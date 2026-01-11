💻 Central de Compras - Interface Web (UNESC)

Este repositório contém o Frontend do projeto Central de Compras, desenvolvido para o curso de Ciência da Computação da UNESC. A interface foi projetada para ser intuitiva, rápida e responsiva, atendendo aos três perfis de usuários do sistema: Lojistas, Fornecedores e Administradores.
🚀 Sobre a Interface

A aplicação foi construída utilizando o ecossistema moderno do React, focada em entregar uma experiência de usuário (UX) consistente. Através desta interface, é possível realizar todo o ciclo de compras, desde a prospecção de fornecedores até o fechamento de pedidos.
Funcionalidades por Perfil:

    Painel do Lojista: Catálogo interativo de produtos, busca de fornecedores disponíveis e histórico de pedidos realizados.

    Painel do Fornecedor: Gestão de inventário, criação de campanhas promocionais e controle de condições comerciais.

    Painel do Administrador: Dashboard gerencial para cadastro de categorias, usuários e monitoramento geral do sistema.

🛠️ Tecnologias Utilizadas

    Framework: Next.js (React)

    Linguagem: TypeScript / JavaScript

    Estilização: CSS Modules (para escopo isolado de componentes)

    Consumo de API: Axios

    Autenticação: Gerenciamento de tokens JWT para sessões seguras.

📂 Estrutura do Projeto

    /src/pages: Roteamento dinâmico do Next.js (Admin, Loja e Fornecedor).

    /src/components: Componentes reutilizáveis e HOCs de autenticação (withAuth).

    /src/services: Configuração da instância da API e chamadas de serviço.

    /src/styles: Arquivos de estilo CSS específicos por módulo.

⚙️ Como Executar
Pré-requisitos

    Node.js (versão 18 ou superior)

    Gerenciador de pacotes npm ou yarn

Passos

    Clone o repositório:
    Bash

git clone https://github.com/Rafaelzzzx/TrabalhoFront.git
cd TrabalhoFront

Instale as dependências:
Bash

npm install


Configure o endpoint da API: Verifique o arquivo src/services/api.js e certifique-se de que a URL aponta para o seu backend local (geralmente http://localhost:8080).

Inicie o servidor de desenvolvimento:
Bash

    npm run dev
    

    Acesse: http://localhost:3000

⚙️ Backend

Este frontend depende obrigatoriamente da API Java desenvolvida com Spring Boot para funcionar. Sem o backend rodando, as funcionalidades de login e listagem de dados não estarão disponíveis.

Você pode encontrar o repositório do Backend aqui: 👉 Central de Compras - Backend
## 📨 Contato

* **GitHub:** [Rafaelzzzx](https://github.com/Rafaelzzzx)
* **E-mail:** [Rafaelantunesmariani@gmail.com](mailto:Rafaelantunesmariani@gmail.com)
* **LinkedIn:** [rafael-antunes-java](https://linkedin.com/in/rafael-antunes-java)

Desenvolvido como projeto acadêmico - UNESC 2024/2025.
