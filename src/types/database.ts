/**
 * Tipos del schema de Supabase.
 *
 * IMPORTANTE: cada tabla DEBE tener `Relationships: []` y el schema completo
 * debe incluir Views, Functions, Enums, CompositeTypes — aunque estén vacíos —
 * porque el genérico interno de Supabase exige esta forma.
 *
 * Cuando crezca la app vale la pena regenerar con la CLI de Supabase:
 *   supabase gen types typescript --project-id <id> > src/types/database.ts
 */

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          first_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          first_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          first_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      scenarios: {
        Row: {
          id: string;
          slug: string;
          title: string;
          category: string;
          level: string;
          language: string;
          description: string;
          duration_minutes: number;
          difficulty: number;
          interviewer_name: string;
          interviewer_persona: string;
          voice_gender: "male" | "female" | null;
          is_active: boolean;
          is_template: boolean;
          user_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          category: string;
          level: string;
          language?: string;
          description: string;
          duration_minutes: number;
          difficulty: number;
          interviewer_name: string;
          interviewer_persona: string;
          voice_gender?: "male" | "female" | null;
          is_active?: boolean;
          is_template?: boolean;
          user_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          category?: string;
          level?: string;
          language?: string;
          description?: string;
          duration_minutes?: number;
          difficulty?: number;
          interviewer_name?: string;
          interviewer_persona?: string;
          voice_gender?: "male" | "female" | null;
          is_active?: boolean;
          is_template?: boolean;
          user_id?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };

      sessions: {
        Row: {
          id: string;
          user_id: string;
          scenario_id: string;
          status: "active" | "completed" | "abandoned";
          transcript: unknown | null;
          duration_seconds: number | null;
          vapi_call_id: string | null;
          started_at: string;
          ended_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          scenario_id: string;
          status?: "active" | "completed" | "abandoned";
          transcript?: unknown | null;
          duration_seconds?: number | null;
          vapi_call_id?: string | null;
          started_at?: string;
          ended_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          scenario_id?: string;
          status?: "active" | "completed" | "abandoned";
          transcript?: unknown | null;
          duration_seconds?: number | null;
          vapi_call_id?: string | null;
          started_at?: string;
          ended_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };

      feedback: {
        Row: {
          id: string;
          session_id: string;
          user_id: string;
          scores: unknown;
          overall_score: number;
          strengths: unknown;
          improvements: unknown;
          summary: string;
          model_used: string;
          generation_ms: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          user_id: string;
          scores: unknown;
          overall_score: number;
          strengths: unknown;
          improvements: unknown;
          summary: string;
          model_used: string;
          generation_ms?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          user_id?: string;
          scores?: unknown;
          overall_score?: number;
          strengths?: unknown;
          improvements?: unknown;
          summary?: string;
          model_used?: string;
          generation_ms?: number | null;
          created_at?: string;
        };
        Relationships: [];
      };

      waitlist: {
        Row: {
          id: string;
          user_id: string | null;
          email: string;
          reason: string | null;
          source: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          email: string;
          reason?: string | null;
          source?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          email?: string;
          reason?: string | null;
          source?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };

    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
