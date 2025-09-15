# OSINT Systems Backend

Backend API para o sistema OSINT (Open Source Intelligence).

## Estrutura do Projeto

```
backend/
├── controllers/      # Controladores das rotas
├── middleware/       # Middlewares customizados
├── routes/          # Definições das rotas
├── utils/           # Utilitários e helpers
├── server.js        # Arquivo principal do servidor
├── package.json     # Dependências e scripts
└── .gitignore       # Arquivos ignorados pelo Git
```

## Instalação

```bash
npm install
```

## Scripts Disponíveis

- `npm start` - Inicia o servidor em modo produção
- `npm run dev` - Inicia o servidor em modo desenvolvimento (requer nodemon)

## Dependências Necessárias

Para instalar as dependências básicas:

```bash
npm install express cors
npm install --save-dev nodemon
```

## API Endpoints

### Básicos
- `GET /` - Informações da API
- `GET /api/health` - Status de saúde da API

## Configuração

O servidor roda na porta 3000 por padrão. Para alterar, defina a variável de ambiente `PORT`.