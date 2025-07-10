# Tradutor Wai Wai

## 📌 Objetivo

O objetivo deste projeto é criar uma plataforma segura e acessível com:

- Tradução de termos acadêmicos Wai Wai ↔ Português  
- Cadastro e login de usuários com autenticação  
- Sugestão de novos termos (com validação por especialistas)  
- Acesso diferenciado para administradores e usuários  
- Interface acessível, com modo escuro e navegação intuitiva  
- Preservação linguística com curadoria cultural  

---

## 🛠️ Tecnologias Utilizadas

- HTML5  
- CSS3 (com gradiente em tons naturais)  
- JavaScript  
- Node.js  
- Git & GitHub  
- VS Code  

---

## 📁 Estrutura do Projeto `tradutor-wai-wai/`

```
tradutor-wai-wai/
├── bin/
│   └── www
├── config/
│   ├── database.js
│   └── session.js
├── middlewares/
│   └── DesvincularAdm.js
├── models/
│   ├── Palavras.js
│   ├── Solicitacao.js
│   ├── Sugestao.js
│   └── Usuario.js
├── public/
│   ├── javascripts/
│   └── stylesheets/
├── routes/
│   ├── cadastro.js
│   ├── index.js
│   ├── login.js
│   ├── sair.js
│   ├── sobre.js
│   └── users.js
├── views/
│   ├── partials/
│   │   ├── footer.ejs
│   │   ├── header.ejs
│   ├── cadastro.ejs
│   ├── error.ejs
│   ├── index.ejs
│   ├── layout.ejs
│   ├── login.ejs
│   └── sobre.ejs
├── perfil.js
├── sair.js
├── sobre.js
├── tradutor.js
├── user.js
├── app.js
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

---

## 🔐 Segurança da Informação
````
- Senhas protegidas e ocultas (com opção de visualizar)  
- Rota `tradutor-way-wai/` com autenticação segura por sessão  
- Acesso e edição de dados restritos ao perfil do usuário  
- Sugestões de termos passam por validação técnica  
- Criptografia de dados seguindo a LGPD  

| Recurso                              | Descrição                                                      | Caminho no projeto              | Linhas-chave   |
| ------------------------------------ | -------------------------------------------------------------- | ------------------------------- | -------------- |
| **Criptografia de Senha (`bcrypt`)** | Gera hash seguro da senha antes de salvar no banco.            | `./tradutor-way-way/models/usuario.js` | 12 a 17        |
| **Verificação Segura de Senha**      | Compara senha digitada com hash salvo.                         | `./traduto-way-way/models/usuario.js` | 20 a 22        |
| **Validação de Cadastro**            | Confirma campos obrigatórios, formato de email e senha segura. | `.routes/cadastro.js`            | Linhas 7 a 44  |
| **Criação de Sessão Segura**         | Sessão iniciada após cadastro com controle de acesso.          | `routes/cadastro.js`            | Linhas 48 a 53 |
| **Perfis de Usuário**                | Define acessos: `público`, `tradutor`, `admin`.                | `middlewares/models/usuario.js` | Linha 6        |
| **Conformidade com LGPD**            | Dados pessoais protegidos e nunca armazenados em texto puro.   | Documentação + Implementação    | —              |


---

## 👥 Autores

**Iolandino Xayukuma Wai Wai**  
Projeto desenvolvido para a disciplina de Segurança da Informação, com foco na valorização de línguas indígenas e proteção de dados digitais.
