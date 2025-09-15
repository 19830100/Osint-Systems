# Osint System

Sistema de Transparência de Folha de Pagamento desenvolvido para proporcionar transparência e acesso às informações de remuneração dos funcionários.

## Características

- **Interface Web Responsiva**: Desenvolvida com HTML, CSS e JavaScript
- **Gestão de Funcionários**: Cadastro, consulta e gerenciamento de funcionários
- **Relatórios de Folha**: Geração de relatórios mensais e anuais
- **Sistema de Busca**: Pesquisa por nome, matrícula, cargo ou departamento
- **Autenticação**: Sistema de login para administradores
- **Design Moderno**: Interface limpa e profissional

## Tecnologias Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Node.js com Express.js
- **Database**: PostgreSQL (configuração futura)
- **Autenticação**: JWT (JSON Web Tokens)

## Instalação e Execução

1. Clone o repositório:
   ```bash
   git clone https://github.com/19830100/Osint-Systems.git
   cd Osint-Systems
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente:
   ```bash
   cp .env.example .env
   # Edite o arquivo .env conforme necessário
   ```

4. Execute o servidor:
   ```bash
   npm start
   ```

5. Acesse o sistema em: http://localhost:3000

## Funcionalidades

### Portal de Transparência
- Consulta pública de informações de funcionários
- Busca por nome, matrícula, cargo ou departamento
- Visualização de dados de remuneração

### Gestão de Funcionários (Área Administrativa)
- Cadastro de novos funcionários
- Edição de informações existentes
- Listagem completa de funcionários

### Relatórios
- Relatórios mensais de folha de pagamento
- Cálculos automáticos de salário bruto, descontos e líquido
- Totalizadores por período

### Autenticação
- Login: admin
- Senha: admin123

## Estrutura do Projeto

```
Osint-Systems/
├── frontend/
│   └── index.html          # Interface principal
├── css/
│   └── styles.css          # Estilos da aplicação
├── js/
│   └── app.js             # Lógica do frontend
├── server.js              # Servidor Express
├── package.json           # Dependências do projeto
└── README.md             # Documentação
```

## Próximas Implementações

- [ ] Integração com banco de dados PostgreSQL
- [ ] API REST completa
- [ ] Sistema de autenticação robusto
- [ ] Diferentes níveis de acesso (admin, usuário)
- [ ] Exportação de relatórios (PDF, Excel)
- [ ] Dashboard com gráficos e estatísticas
- [ ] Sistema de logs e auditoria

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.
