# Sustenta & Habilidade

Monorepo do site do **II Sustenta & Habilidade** (UNESP/IBILCE): Next.js no frontend e Payload CMS no backend, com MongoDB Atlas.

## Apps

| App | Pasta | Porta | Função |
| --- | --- | --- | --- |
| `web` | `apps/web` | 3000 | Landing page e `/inscricoes` |
| `cms` | `apps/cms` | 3001 | Admin Payload e API das inscrições |

O formulário de `/inscricoes` envia os dados para a collection `inscricoes` do Payload.

## Desenvolvimento

1. Copie as credenciais do Atlas para `apps/cms/.env` (veja `.env.example`).
2. Crie `apps/web/.env.local` com `PAYLOAD_URL=http://localhost:3001`.
3. Instale as dependências de cada app (já existentes se você clonou com `node_modules`).
4. Na raiz:

```bash
npm run dev
```

- Site: [http://localhost:3000](http://localhost:3000)
- Inscrições: [http://localhost:3000/inscricoes](http://localhost:3000/inscricoes)
- Admin Payload: [http://localhost:3001/admin](http://localhost:3001/admin)
