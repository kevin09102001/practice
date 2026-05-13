"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { getVapi, buildAssistantConfig, type TranscriptMessage } from "@/lib/vapi";
import { endSessionAction, abandonSessionAction } from "@/app/session/actions";
import { cn } from "@/lib/utils";

type Scenario = {
  id: string;
  title: string;
  category: string;
  level: string;
  language: string;
  description: string;
  duration_minutes: number;
  interviewer_name: string;
  interviewer_persona: string;
  difficulty: number;
};

type SessionState = "idle" | "connecting" | "active" | "ending" | "error";

export function SessionRoom({
  session,
  scenario,
}: {
  session: { id: string };
  scenario: Scenario;
}) {
  const router = useRouter();
  const [state, setState] = useState<SessionState>("idle");
  const [messages, setMessages] = useState<TranscriptMessage[]>([]);
  const [partialUser, setPartialUser] = useState("");
  const [partialAssistant, setPartialAssistant] = useState("");
  const [isAssistantSpeaking, setIsAssistantSpeaking] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  // Refs para que los event handlers de Vapi accedan al state actual
  const stateRef = useRef<SessionState>("idle");
  const messagesRef = useRef<TranscriptMessage[]>([]);
  const partialUserRef = useRef("");
  const partialAssistantRef = useRef("");
  const startTimeRef = useRef<number | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => { stateRef.current = state; }, [state]);
  useEffect(() => { messagesRef.current = messages; }, [messages]);
  useEffect(() => { partialUserRef.current = partialUser; }, [partialUser]);
  useEffect(() => { partialAssistantRef.current = partialAssistant; }, [partialAssistant]);

  // Auto-scroll del transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, partialUser, partialAssistant]);

  // Timer en vivo durante la sesión
  useEffect(() => {
    if (state !== "active") return;
    const interval = setInterval(() => {
      if (startTimeRef.current) {
        setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [state]);

  // Registro de eventos Vapi (solo una vez al montar)
  useEffect(() => {
    const vapi = getVapi();

    const onCallStart = () => {
      setState("active");
      startTimeRef.current = Date.now();
    };

    const onCallEnd = () => {
      // Vapi terminó (manual, timeout, o desconexión)
      if (stateRef.current === "ending" || stateRef.current === "idle") return;
      setState("ending");

      // Incluir partials por si quedó algo sin finalizar
      const finalMessages = [...messagesRef.current];
      if (partialAssistantRef.current) {
        finalMessages.push({
          role: "assistant",
          content: partialAssistantRef.current,
          timestamp: Date.now(),
        });
      }
      if (partialUserRef.current) {
        finalMessages.push({
          role: "user",
          content: partialUserRef.current,
          timestamp: Date.now(),
        });
      }

      const duration = startTimeRef.current
        ? Math.floor((Date.now() - startTimeRef.current) / 1000)
        : 0;

      startTransition(async () => {
        const result = await endSessionAction(session.id, finalMessages, duration);
        if ("error" in result) {
          setError(result.error);
          setState("error");
        } else {
          router.push(`/session/${session.id}/feedback`);
        }
      });
    };

    const onSpeechStart = () => setIsAssistantSpeaking(true);
    const onSpeechEnd = () => setIsAssistantSpeaking(false);

    const onMessage = (msg: {
      type?: string;
      role?: string;
      transcript?: string;
      transcriptType?: string;
    }) => {
      if (msg.type !== "transcript" || !msg.role || !msg.transcript) return;

      if (msg.transcriptType === "partial") {
        if (msg.role === "user") setPartialUser(msg.transcript);
        else if (msg.role === "assistant") setPartialAssistant(msg.transcript);
      } else if (msg.transcriptType === "final") {
        const role = msg.role === "user" ? "user" : "assistant";
        const content = msg.transcript;
        setMessages((prev) => [
          ...prev,
          { role, content, timestamp: Date.now() },
        ]);
        if (msg.role === "user") setPartialUser("");
        else if (msg.role === "assistant") setPartialAssistant("");
      }
    };

    const onError = (e: { message?: string; errorMsg?: string }) => {
      console.error("Vapi error:", e);
      setError(e?.message ?? e?.errorMsg ?? "Something went wrong with the call");
      setState("error");
    };

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("message", onMessage);
    vapi.on("error", onError);

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("message", onMessage);
      vapi.off("error", onError);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cleanup: si el componente se desmonta con call activa, parar Vapi
  useEffect(() => {
    return () => {
      if (stateRef.current === "active" || stateRef.current === "connecting") {
        try { getVapi().stop(); } catch {}
      }
    };
  }, []);

  const handleStart = async () => {
    setState("connecting");
    setError(null);
    try {
      const vapi = getVapi();
      // Vapi tipa los providers/modelos como union de literales estrictos;
      // TypeScript widena nuestros strings a `string` y rompe el check.
      // El runtime ya está validado — cast al tipo del parámetro.
      const config = buildAssistantConfig(scenario);
      await vapi.start(config as Parameters<typeof vapi.start>[0]);
    } catch (e: unknown) {
      const message = e instanceof Error
        ? e.message
        : "Could not start the call. Check your microphone permissions.";
      console.error(e);
      setError(message);
      setState("error");
    }
  };

  const handleEndCall = () => {
    if (stateRef.current === "ending") return;
    try { getVapi().stop(); } catch {}
    // onCallEnd se encarga del resto
  };

  const handleAbandon = () => {
    try { getVapi().stop(); } catch {}
    startTransition(async () => {
      await abandonSessionAction(session.id);
      router.push("/scenarios");
    });
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <main className="paper-grain min-h-dvh">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-8 lg:px-12">
        <Logo />
        <div className="flex items-center gap-6">
          {state === "active" && (
            <p className="label-speaker tabular-nums">{formatTime(elapsed)}</p>
          )}
          {state === "active" && (
            <Button onClick={handleEndCall} variant="secondary" size="sm">
              End scene
            </Button>
          )}
        </div>
      </header>

      {state === "idle" && (
        <section className="mx-auto max-w-3xl px-6 pt-12 pb-24 lg:px-12 lg:pt-20">
          <p className="script-in label-act mb-6" style={{ animationDelay: "0s" }}>
            Act IV · The Stage
          </p>
          <h1
            className="script-in font-display mb-4 text-[clamp(2.5rem,7vw,5rem)] leading-[0.95]"
            style={{ animationDelay: "0.3s" }}
          >
            {scenario.title}<span className="text-[var(--color-accent)]">.</span>
          </h1>
          <p
            className="script-in stage-direction mb-12 text-base"
            style={{ animationDelay: "0.5s" }}
          >
            with <em className="not-italic font-medium text-[var(--color-ink)]">{scenario.interviewer_name}</em>
          </p>
          <div
            className="script-in mb-12 space-y-4 border-l-2 border-[var(--color-ink)]/25 pl-6"
            style={{ animationDelay: "0.7s" }}
          >
            <p className="stage-direction text-sm">
              [ The stage is set. Your microphone is your only line. Speak naturally. ]
            </p>
            <p className="stage-direction text-sm">
              [ {scenario.interviewer_name} will speak first. Listen, then respond.
              The scene runs about {scenario.duration_minutes} minutes. ]
            </p>
          </div>
          <div className="script-in" style={{ animationDelay: "0.9s" }}>
            <Button onClick={handleStart} size="lg">
              Take the stage →
            </Button>
            <p className="stage-direction mt-4 text-xs">
              [ Your browser will ask for microphone access. Allow it. ]
            </p>
          </div>
        </section>
      )}

      {state === "connecting" && (
        <section className="mx-auto max-w-2xl px-6 pt-32 text-center lg:px-12">
          <p className="label-act mb-4">Connecting</p>
          <h2 className="font-display mb-6 text-4xl">Lights coming up...</h2>
          <div className="flex justify-center gap-1.5">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--color-accent)]" style={{ animationDelay: "0ms" }} />
            <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--color-accent)]" style={{ animationDelay: "200ms" }} />
            <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--color-accent)]" style={{ animationDelay: "400ms" }} />
          </div>
        </section>
      )}

      {state === "active" && (
        <section className="mx-auto max-w-3xl px-6 pb-32 lg:px-12">
          <div className="mb-12 flex items-center justify-center gap-4 pt-4">
            <SpeakerOrb active={isAssistantSpeaking} />
            <div>
              <p className="label-act">{isAssistantSpeaking ? "Speaking" : "Listening"}</p>
              <p className="font-display text-2xl">
                {isAssistantSpeaking ? scenario.interviewer_name : "You"}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {messages.length === 0 && !partialAssistant && !partialUser && (
              <p className="stage-direction text-center text-sm">
                [ The scene begins. ]
              </p>
            )}

            {messages.map((msg, idx) => (
              <TranscriptLine
                key={`${msg.timestamp}-${idx}`}
                role={msg.role}
                content={msg.content}
                speakerName={msg.role === "assistant" ? scenario.interviewer_name : "You"}
              />
            ))}

            {partialAssistant && (
              <TranscriptLine
                role="assistant"
                content={partialAssistant}
                speakerName={scenario.interviewer_name}
                isPartial
              />
            )}
            {partialUser && (
              <TranscriptLine
                role="user"
                content={partialUser}
                speakerName="You"
                isPartial
              />
            )}

            <div ref={transcriptEndRef} />
          </div>
        </section>
      )}

      {state === "ending" && (
        <section className="mx-auto max-w-2xl px-6 pt-32 text-center lg:px-12">
          <p className="label-act mb-4">End scene</p>
          <h2 className="font-display mb-6 text-4xl">Curtain falling...</h2>
          <p className="stage-direction text-sm">[ Saving your rehearsal. ]</p>
        </section>
      )}

      {state === "error" && (
        <section className="mx-auto max-w-2xl px-6 pt-32 lg:px-12">
          <p className="label-act mb-4 text-[var(--color-accent)]">Scene interrupted</p>
          <h2 className="font-display mb-6 text-4xl">
            Something went wrong<span className="text-[var(--color-accent)]">.</span>
          </h2>
          <p className="stage-direction mb-8 border-l-2 border-[var(--color-accent)] pl-4 text-sm">
            {error}
          </p>
          <Button onClick={handleAbandon}>Leave the stage</Button>
        </section>
      )}
    </main>
  );
}

function SpeakerOrb({ active }: { active: boolean }) {
  return (
    <div className="relative h-16 w-16">
      <div
        className={cn(
          "absolute inset-0 rounded-full transition-all duration-300",
          active
            ? "bg-[var(--color-accent)] shadow-[0_0_40px_var(--color-accent)]"
            : "bg-[var(--color-ink)]/20"
        )}
      />
      {active && (
        <div className="absolute inset-0 animate-ping rounded-full bg-[var(--color-accent)] opacity-30" />
      )}
    </div>
  );
}

function TranscriptLine({
  role,
  content,
  speakerName,
  isPartial,
}: {
  role: "user" | "assistant";
  content: string;
  speakerName: string;
  isPartial?: boolean;
}) {
  return (
    <div className="grid grid-cols-[100px_1fr] gap-x-6 lg:grid-cols-[120px_1fr]">
      <p
        className={cn(
          "label-speaker pt-[7px]",
          role === "user" ? "text-[var(--color-accent)]" : "text-[var(--color-ink)]"
        )}
      >
        {speakerName}.
      </p>
      <p
        className={cn(
          "text-[17px] leading-[1.6]",
          isPartial && "italic text-[var(--color-ink)]/55"
        )}
      >
        {content}
        {isPartial && <span className="cursor-blink" />}
      </p>
    </div>
  );
}
