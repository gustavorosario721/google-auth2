# Google Authentication Lab

Laboratório educacional interativo em português para estudar Google Identity Services (GIS), OpenID Connect, ID Tokens, JWT, OAuth 2.0 e segurança de sessões.

## Tecnologias

- Vite + JavaScript Vanilla (ES Modules)
- HTML5 + Tailwind CSS
- Google Identity Services (biblioteca oficial)
- Vercel Functions
- `google-auth-library` para validar ID Tokens
- Redis REST compatível com Upstash/Vercel para sessões revogáveis

Não utiliza React, Next.js, Vue, Angular, Supabase, Firebase Authentication, Express ou backend hospedado separadamente.

## Instalação local

Requer Node.js 20 ou superior.

```bash
npm install
cp .env.example .env
npm run dev
```

Build e preview:

```bash
npm run build
npm run preview
```

Para testar as funções serverless localmente, use a CLI da Vercel (`vercel dev`).

## Variáveis de ambiente

Configure em `.env` local e nas configurações do projeto Vercel:

| Variável | Exposição | Finalidade |
|---|---|---|
| `VITE_GOOGLE_CLIENT_ID` | Pública | Client ID usado pelo GIS no navegador |
| `GOOGLE_CLIENT_ID` | Somente servidor | Audiência esperada na validação do ID Token |
| `SESSION_SECRET` | Somente servidor | Segredo HMAC com pelo menos 32 bytes |
| `KV_REST_API_URL` | Somente servidor | Endpoint REST do Redis |
| `KV_REST_API_TOKEN` | Somente servidor | Token de acesso ao Redis |

Gere um segredo aleatório forte para `SESSION_SECRET`. Nunca use o prefixo `VITE_` em segredos. O arquivo `.env` está no .gitignore; nunca faça commit de credenciais reais.

## Google Identity Services

1. Crie/configure posteriormente um OAuth Client do tipo Web Application no Google Cloud.
2. Adicione as origens locais e de produção autorizadas.
3. Configure o mesmo Client ID em `VITE_GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_ID`.
4. Não configure nem compartilhe Client Secret no frontend. O fluxo GIS de autenticação desta aplicação utiliza ID Token.
5. O login real não poderá ser validado até que um Client ID real e domínios autorizados sejam configurados.

O botão exibido é renderizado pela biblioteca oficial GIS. Se o Client ID estiver ausente, a interface informa a pendência e não simula uma autenticação.

## Arquitetura

- `src/main.js`: SPA, navegação e renderização dinâmica das oito seções.
- `src/components/Sidebar.js`: navegação responsiva.
- `src/services/auth.js`: chamadas aos endpoints de sessão.
- `src/utils/security.js`: escape de HTML e utilitários.
- `src/styles/main.css`: Tailwind e estilos de interface.
- `api/auth/google.js`: valida ID Token e cria sessão.
- `api/auth/session.js`: consulta sessão.
- `api/auth/logout.js`: revoga sessão e expira cookies.
- `api/auth/_shared.js`: cookies, CSRF, headers e integração Redis REST.

## Segurança da autenticação

O endpoint de login aceita POST, verifica a origem e o token CSRF, valida o ID Token usando `OAuth2Client.verifyIdToken` com o Client ID esperado e confere claims essenciais (`iss`, `aud`, `sub` e `exp`). Os dados do perfil vêm exclusivamente do payload verificado no servidor.

A aplicação cria um identificador aleatório opaco de sessão. O valor é enviado em cookie HttpOnly, SameSite=Lax e Secure em produção. O Redis armazena os dados do usuário sob uma chave HMAC com TTL de oito horas. O logout remove a chave no Redis e expira os cookies. Assim, o logout não depende de memória local de uma instância serverless.

Operações mutáveis verificam origem e token CSRF em cookie não HttpOnly comparado com o cabeçalho `X-CSRF-Token`. Os endpoints enviam `Cache-Control: no-store`.

Se Redis ou as variáveis de sessão não estiverem configurados, a autenticação é recusada com erro de configuração; a aplicação não troca isso por localStorage ou sessão em memória.

## OAuth 2.0: escopo desta versão

O módulo OAuth 2.0 é exclusivamente educacional. Ele explica Authorization Code Flow, scopes, state, PKCE, access tokens, refresh tokens, redirect URI, Client ID e Client Secret. Não solicita scopes adicionais, não implementa consentimento OAuth nem acessa APIs Google. ID Token é para identidade; Access Token é para autorização.

## Deploy na Vercel

1. Importe este repositório na Vercel.
2. Framework: Vite (detecção automática).
3. Build command: `npm run build`.
4. Output directory: `dist`.
5. Configure todas as variáveis acima nos ambientes Preview e Production conforme necessário.
6. Adicione as origens de deploy em Google Identity Services depois da criação do Client ID.
7. Configure uma integração Redis REST compatível com Upstash/Vercel e copie URL e token para as variáveis de ambiente.
8. Faça redeploy após alterar variáveis.

O projeto inclui `vercel.json` para build e fallback SPA. As rotas `/api/*` continuam sendo funções serverless.

## Limitações e status

- Interface educacional e navegação: implementadas.
- Login GIS: preparado; depende de Client ID real e origem autorizada.
- Verificação server-side de ID Token: implementada.
- Sessão revogável: implementada; depende de Redis REST e segredo forte.
- OAuth 2.0 completo e acesso a Google APIs: não implementados, intencionalmente.
- Não afirmar que o login real foi testado antes de configurar credenciais Google.

## Segurança adicional

O identificador estável da conta é o claim `sub`, nunca o e-mail. O JWT demonstrativo da interface é fictício. Decodificar um JWT no cliente não verifica assinatura ou identidade. Não persista ID Tokens, Access Tokens, Refresh Tokens ou Client Secrets no armazenamento do navegador.
