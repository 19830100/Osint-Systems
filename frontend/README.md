# OSINT Systems Frontend

Interface web para o sistema OSINT (Open Source Intelligence).

## Estrutura do Projeto

```
frontend/
├── public/          # Arquivos públicos estáticos
├── src/             # Código fonte React
│   ├── components/  # Componentes reutilizáveis
│   ├── pages/       # Páginas da aplicação
│   ├── services/    # Serviços para API
│   ├── App.js       # Componente principal
│   └── index.js     # Ponto de entrada
├── package.json     # Dependências e scripts
└── .gitignore       # Arquivos ignorados pelo Git
```

## Instalação

```bash
npm install
```

## Scripts Disponíveis

- `npm start` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria build de produção
- `npm test` - Executa testes
- `npm run eject` - Ejeta configuração do Create React App

## Dependências Necessárias

Para instalar as dependências básicas:

```bash
npm install react react-dom react-scripts
```

## Desenvolvimento

A aplicação roda em modo desenvolvimento na porta 3000 e automaticamente recarrega quando arquivos são modificados.

## Build de Produção

Execute `npm run build` para criar uma versão otimizada para produção na pasta `build/`.