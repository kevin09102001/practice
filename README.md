# Practice

App web para practicar conversaciones por voz con una IA: entrevistas de trabajo, ventas, negociaciones o cualquier situación que describas. Al terminar cada sesión te da retroalimentación sobre cómo te fue.

**Hecho con:** Next.js 16, React 19, TypeScript, Supabase (autenticación y base de datos), Vapi (voz) y la API de Claude.

## Funciones

- Registro e inicio de sesión
- Escenarios ya armados y escenarios nuevos generados a partir de una descripción
- Conversación por voz en tiempo real con un compañero de IA
- Retroalimentación al terminar cada sesión
- Límite de sesiones gratuitas y lista de espera

## Correr en local

```bash
pnpm install
pnpm dev
```

Variables de entorno necesarias (en `.env.local`):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
NEXT_PUBLIC_VAPI_PUBLIC_KEY=
NEXT_PUBLIC_APP_URL=
```
