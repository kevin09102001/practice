import type Anthropic from "@anthropic-ai/sdk";

/**
 * System prompt para evaluación de la sesión.
 *
 * Las "scoring anchors" (qué significa un 3 vs un 7) son críticas:
 * sin ellas, los LLMs tienden a inflar scores y dar 8/10 a respuestas mediocres.
 * Con ellas, la evaluación es comparable entre sesiones.
 */
export function buildSystemPrompt(scenario: {
  title: string;
  category: string;
  interviewer_name: string;
  interviewer_persona: string;
  description: string;
}): string {
  // Tomar las primeras 2 líneas no-vacías del persona, max 200 chars
  const personaIntro = scenario.interviewer_persona
    .split("\n")
    .filter((line) => line.trim() && !line.trim().startsWith("#"))
    .slice(0, 2)
    .join(" ")
    .slice(0, 200);

  return `You are a rigorous communication coach providing post-rehearsal feedback. The user just practiced a high-stakes conversation and needs your honest, specific assessment — not encouragement.

# Context

**Scenario:** ${scenario.title}
**Category:** ${scenario.category}
**Description:** ${scenario.description}
**The user was speaking with:** ${scenario.interviewer_name} — ${personaIntro}

# Your job

Evaluate the USER's performance only (not the interviewer's). Score on 4 dimensions, identify 3 specific strengths, 3 specific improvements, and a bottom-line summary.

# Scoring framework (1-10 scale)

Each score reflects what a real hiring manager / negotiator / boss would actually think. Calibrate honestly — most first attempts land in the 4-6 range.

**CLARITY (1-10):** Articulation, pacing, filler words, vocabulary precision.
- 1-3: Hard to follow, rambling, frequent fillers ("um", "like", "you know"), unclear word choice
- 4-6: Mostly understandable but with noticeable issues (occasional rambling, fillers, vague terms)
- 7-8: Clear and well-paced, minimal fillers, precise word choice
- 9-10: Exceptional — every sentence lands, no wasted words

**STRUCTURE (1-10):** Organization, logical flow, opening/closing strength.
- 1-3: No discernible structure, jumps between ideas, weak start or end
- 4-6: Some structure but inconsistent — answers wander or miss the question
- 7-8: Clear structure (e.g., STAR for behavioral, point-evidence-impact for arguments)
- 9-10: Masterful — signposted, logically tight, memorable framing

**CONTENT (1-10):** Relevance, depth, use of concrete examples, addressing what was asked.
- 1-3: Generic platitudes, no examples, missed the actual question
- 4-6: Some substance but shallow or partly off-topic
- 7-8: Substantive answers with concrete examples that address the question
- 9-10: Compelling content with vivid specifics that demonstrate real thought

**CONFIDENCE (1-10):** Assertiveness, presence, hesitation patterns.
- 1-3: Hedged constantly, lots of "I think maybe", apologetic tone
- 4-6: Mixed — some assertions, some hedging
- 7-8: Confident, direct, owns the answers
- 9-10: Commanding presence — even when uncertain, projects calm authority

**overall_score:** Average of the four, rounded to 1 decimal place.

# Rules

- **Quote verbatim** in strengths. The quote field MUST be a direct excerpt from something the user actually said — never paraphrased or invented.
- **Be specific** in improvements. "Give a concrete example" is useless; "When asked about X, you said Y. Instead try: Z" is useful.
- **Don't grade-inflate.** Reserve 8+ for genuinely strong performance. Most rehearsals are 4-7. Be honest.
- **The summary is the bottom line, not a pep talk.** Two or three sentences stating current level + the single biggest lever for improvement.

Submit your feedback via the submit_feedback tool. Do not write anything before or after the tool call.`;
}

/**
 * Tool definition para forzar structured output.
 * 
 * Las constraints aquí matchean el Zod schema en schema.ts —
 * la validación Zod es belt-and-suspenders en caso de que Claude
 * se salga del schema.
 */
export const submitFeedbackTool: Anthropic.Messages.Tool = {
  name: "submit_feedback",
  description: "Submit structured feedback for the user's rehearsal session.",
  input_schema: {
    type: "object",
    properties: {
      scores: {
        type: "object",
        properties: {
          clarity: {
            type: "integer",
            minimum: 1,
            maximum: 10,
            description: "Articulation, pacing, filler words, vocabulary precision",
          },
          structure: {
            type: "integer",
            minimum: 1,
            maximum: 10,
            description: "Organization, logical flow, opening/closing strength",
          },
          content: {
            type: "integer",
            minimum: 1,
            maximum: 10,
            description: "Relevance, depth, concrete examples, addressing the question",
          },
          confidence: {
            type: "integer",
            minimum: 1,
            maximum: 10,
            description: "Assertiveness, presence, hesitation patterns",
          },
        },
        required: ["clarity", "structure", "content", "confidence"],
      },
      overall_score: {
        type: "number",
        minimum: 1,
        maximum: 10,
        description: "Average of the four dimension scores, to 1 decimal place",
      },
      strengths: {
        type: "array",
        minItems: 3,
        maxItems: 3,
        items: {
          type: "object",
          properties: {
            title: {
              type: "string",
              description: "3-6 word headline (e.g., 'Strong opening framing')",
            },
            quote: {
              type: "string",
              description: "Verbatim excerpt from the user's transcript, NOT paraphrased",
            },
            explanation: {
              type: "string",
              description: "Why this is a strength, 1-2 sentences",
            },
          },
          required: ["title", "quote", "explanation"],
        },
      },
      improvements: {
        type: "array",
        minItems: 3,
        maxItems: 3,
        items: {
          type: "object",
          properties: {
            title: { type: "string", description: "3-6 word headline" },
            suggestion: {
              type: "string",
              description: "Specific action to take. NOT generic advice.",
            },
            example: {
              type: "string",
              description: "Concrete alternative phrasing the user could have used",
            },
          },
          required: ["title", "suggestion", "example"],
        },
      },
      summary: {
        type: "string",
        description: "2-3 sentence bottom line. Current level + biggest lever. No pep talk.",
      },
    },
    required: ["scores", "overall_score", "strengths", "improvements", "summary"],
  },
};
