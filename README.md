# Criador de Curriculo Online

Plataforma web para criar curriculos profissionais com editor visual, preview em tempo real, dashboard local, exportacao em PDF, importacao inteligente a partir de GitHub e PDFs, e recursos de IA mockados.

## Stack

- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express
- Persistencia local: `localStorage`
- Exportacao PDF: Puppeteer
- Testes backend: `node:test`

## Estrutura

```text
frontend/
  src/
    components/
    hooks/
    layouts/
    pages/
    services/
    styles/
    templates/
    utils/
backend/
  controllers/
  middleware/
  routes/
  services/
  test/
  utils/
.github/
  workflows/
```

## Variaveis de ambiente

Use os exemplos incluidos no repositório:

- `backend/.env.example`
- `frontend/.env.example`

Variaveis principais do backend:

- `PORT`: porta da API
- `ALLOWED_ORIGINS`: origens autorizadas no CORS
- `ALLOWED_PDF_IMAGE_HOSTS`: allowlist explicita de hosts de imagem aceitos na exportacao de PDF
- `PUPPETEER_DISABLE_SANDBOX`: mantenha `0` em ambiente normal; use `1` apenas quando o host realmente exigir

Variavel principal do frontend:

- `VITE_API_URL`: URL base da API

## Execucao local

1. Instale dependencias:
   - `cd frontend && npm install`
   - `cd ../backend && npm install`
2. Configure os arquivos de ambiente a partir dos exemplos, se necessario.
3. Inicie o backend:
   - `cd backend && npm run dev`
4. Inicie o frontend:
   - `cd frontend && npm run dev`
5. Acesse:
   - Frontend: `http://localhost:5173`
   - Backend: `http://localhost:4000`

## Testes

- Backend: `cd backend && npm test`
- Frontend build: `cd frontend && npm run build`

## CI

O repositório inclui workflow em `.github/workflows/ci.yml` para:

- instalar dependencias do backend e rodar `npm test`
- instalar dependencias do frontend e rodar `npm run build`

## Fluxo principal

1. O usuario acessa o dashboard local e cria, duplica, edita ou exclui curriculos.
2. Os curriculos ficam persistidos no `localStorage` do navegador atual.
3. O editor dividido em secoes mostra preview em tempo real.
4. A importacao inteligente ajuda a reaproveitar dados de GitHub, LinkedIn PDF e curriculos em PDF.
5. As ferramentas de IA mockadas ajudam a melhorar resumo, objetivo e habilidades.
6. O curriculo pode ser exportado em PDF no template escolhido.
