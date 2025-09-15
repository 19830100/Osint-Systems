# Osint-Systems

Sistema de OSINT (Open Source Intelligence) com backend e frontend separados.

## Estrutura do Projeto

```
Osint-Systems/
├── backend/          # API Backend (Node.js/Express)
├── frontend/         # Interface Frontend (React)
├── README.md
└── LICENSE
```

## Backend

O backend é uma API REST desenvolvida em Node.js com Express.

### Instalação e Execução

```bash
cd backend
npm install
npm start          # Produção
npm run dev        # Desenvolvimento (com nodemon)
```

O servidor roda por padrão na porta 3000.

### Endpoints Disponíveis

- `GET /` - Informações da API
- `GET /api/health` - Status da API

## Frontend

O frontend é uma aplicação React que consome a API do backend.

### Instalação e Execução

```bash
cd frontend
npm install
npm start          # Desenvolvimento
npm run build      # Build para produção
```

A aplicação roda por padrão na porta 3000 (React).

## Desenvolvimento

1. Clone o repositório
2. Configure o backend (veja instruções acima)
3. Configure o frontend (veja instruções acima)
4. Execute ambos os serviços

## Licença

MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.
