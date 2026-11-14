# Google Authentication Lab

Aplicação educacional em português para estudar Google Identity Services, OpenID Connect, ID Tokens, OAuth 2.0 e segurança de sessões.

O projeto completo e testado quanto à sintaxe JavaScript está disponível no arquivo ZIP entregue nesta conversa. A estrutura utiliza Vite, JavaScript Vanilla, Tailwind CSS e Vercel Functions.

## Instalação

```bash
npm install
npm run dev
npm run build
```

## Configuração

Copie `.env.example` para `.env`. Configure `VITE_GOOGLE_CLIENT_ID` (público), `GOOGLE_CLIENT_ID`, `SESSION_SECRET`, `KV_REST_API_URL` e `KV_REST_API_TOKEN` (somente servidor). O login real depende de Client ID criado no Google Cloud e de Redis REST compatível com Upstash/Vercel para permitir revogação real de sessão.

## Segurança de sessão

As funções serverless não usam memória local como armazenamento de sessão. Sessões opacas são armazenadas em Redis com TTL de 8 horas e removidas no logout. O OAuth 2.0 é demonstrativo nesta versão; não são solicitados scopes nem acessadas APIs Google.

## Nota

O repositório estava vazio quando o trabalho começou. O arquivo ZIP contém a aplicação completa, incluindo `api/auth`, `src`, configuração Vite/Tailwind/Vercel, `.env.example` e documentação detalhada.