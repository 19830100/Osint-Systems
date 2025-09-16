# Osint System - Sistema de Folha de Pagamento

Sistema completo de transparência de folha de pagamento desenvolvido com as seguintes tecnologias:

## 🛠 Tecnologias Utilizadas

### Frontend
- **HTML5** - Estrutura semântica
- **CSS3** - Estilização responsiva e moderna
- **JavaScript (ES6+)** - Aplicação SPA (Single Page Application)

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **JWT** - Autenticação e autorização
- **bcryptjs** - Criptografia de senhas

### Banco de Dados
- **PostgreSQL** - Banco de dados relacional

## 🚀 Funcionalidades

### Dashboard
- ✅ Estatísticas gerais do sistema
- ✅ Resumo mensal de folha de pagamento
- ✅ Total de funcionários ativos
- ✅ Folha total e salário médio

### Gestão de Funcionários
- ✅ Cadastro de funcionários
- ✅ Edição de dados pessoais
- ✅ Busca e filtros
- ✅ Status (ativo/inativo/desligado)

### Folha de Pagamento
- ✅ Cálculo automático de salários
- ✅ Descontos INSS e IRRF (sistema brasileiro)
- ✅ Horas extras e bonificações
- ✅ Relatórios detalhados
- ✅ Filtros por período

### Autenticação
- ✅ Login seguro com JWT
- ✅ Controle de acesso por roles (admin/hr/employee)
- ✅ Sessão persistente

## 📋 Instalação e Configuração

### Pré-requisitos
- Node.js (v16 ou superior)
- PostgreSQL (v12 ou superior)
- NPM ou Yarn

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Configure as variáveis no arquivo .env
npm start
```

### Frontend
```bash
cd frontend
# Servir arquivos estáticos (pode usar qualquer servidor web)
# Exemplo com Python:
python -m http.server 3001
# Ou com Node.js:
npx serve -l 3001
```

### Banco de Dados
1. Criar o banco de dados PostgreSQL
2. Executar o script schema.sql para criar as tabelas
3. Configurar as credenciais no arquivo .env

## 🔧 Configuração

### Variáveis de Ambiente (.env)
- `PORT` - Porta do servidor backend
- `DB_HOST` - Host do PostgreSQL
- `DB_PORT` - Porta do PostgreSQL
- `DB_NAME` - Nome do banco de dados
- `DB_USER` - Usuário do banco
- `DB_PASSWORD` - Senha do banco
- `JWT_SECRET` - Chave secreta para JWT
- `CORS_ORIGIN` - URL do frontend

## 👤 Usuário Padrão

**Login:** admin  
**Senha:** admin123

## 🎨 Interface

O sistema possui uma interface moderna e responsiva inspirada no site de transparência original, com:

- Design limpo e profissional
- Navegação intuitiva por abas
- Tabelas responsivas com paginação
- Modais para formulários
- Feedback visual para ações
- Formatação monetária brasileira

## 🔐 Segurança

- Autenticação JWT
- Criptografia de senhas com bcrypt
- Rate limiting para APIs
- Helmet.js para headers de segurança
- Validação de dados no backend
- Controle de acesso por roles

## 📊 Cálculos de Folha

O sistema implementa os cálculos de acordo com a legislação brasileira:

### INSS (2024)
- Até R$ 1.320,00: 7,5%
- De R$ 1.320,01 a R$ 2.571,29: 9%
- De R$ 2.571,30 a R$ 3.856,94: 12%
- De R$ 3.856,95 a R$ 7.507,49: 14%

### IRRF (Imposto de Renda)
- Cálculo progressivo sobre salário tributável
- Dedução do INSS antes do cálculo
- Aplicação das faixas de isenção e alíquotas

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

---

**Osint System** - Sistema de Transparência de Folha de Pagamento  
Desenvolvido por [Filipe Nunes](https://github.com/19830100)
