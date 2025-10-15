# Trabalho 01: Sistema de Check-in em Evento Acadêmico

## Linguagem de Programação e Paradigmas - Sistemas de Informação

Este projeto é uma aplicação web desenvolvida para a disciplina de Linguagem de Programação e Paradigmas. O sistema simula um processo de check-in em tempo real para um evento acadêmico, utilizando uma arquitetura orientada a eventos com Node.js e Socket.IO.

**Desenvolvido por:**
- **Nome:** [SEU NOME COMPLETO AQUI]
- **GitHub:** @[SEU-USUARIO-DO-GITHUB-AQUI]

---

## Como Instalar e Executar o Projeto

### Pré-requisitos
- É necessário ter o **Node.js** instalado (qualquer versão LTS, como v20.x ou superior).

### Passos para Instalação
1.  Clone este repositório para a sua máquina local.
2.  Abra o terminal na pasta raiz do projeto (`checkin-evento-academico`).
3.  Execute o seguinte comando para instalar as dependências (Express e Socket.IO):
    ```bash
    npm install
    ```

### Execução da Aplicação
1.  Com o terminal ainda na pasta raiz, inicie o servidor com o comando:
    ```bash
    node server.js
    ```
2.  O terminal exibirá a mensagem "Servidor rodando em http://localhost:3000".
3.  Abra duas janelas de navegador distintas para testar o fluxo:
    - **Interface do Administrador:** `http://localhost:3000/admin.html`
    - **Interface do Participante:** `http://localhost:3000`

---

## Documentação do Projeto

[cite_start]Esta seção responde às perguntas solicitadas na descrição do trabalho. [cite: 49]

### Quais eventos o seu sistema emite e escuta?

[cite_start]O sistema utiliza uma comunicação bidirecional (cliente ↔ servidor) com os seguintes eventos customizados: [cite: 50]

#### **Cliente → Servidor:**
* `evento.iniciar`: Emitido pela página do **administrador** quando ele clica no botão "Iniciar Check-in".
* `participante.chegou`: Emitido pela página do **participante** ao enviar seu nome para realizar o check-in.
* `evento.encerrar`: Emitido pela página do **administrador** para finalizar o período de check-in.

#### **Servidor → Cliente:**
* `estado.atual`: Emitido para um cliente assim que ele se conecta, enviando o estado atual do sistema (se o evento está aberto e a lista de participantes) para sincronizar sua tela.
* `evento.iniciado`: Emitido para **todos** os clientes quando o administrador inicia o evento, liberando a interface de check-in.
* `presenca.confirmada`: Emitido para **todos** os clientes sempre que um novo participante é confirmado, enviando a lista de presença atualizada em tempo real.
* `evento.encerrado`: Emitido para **todos** os clientes quando o evento é finalizado, bloqueando as interfaces.
* `feedback.sucesso` / `feedback.erro`: Emitidos para o cliente **específico** que realizou uma ação, informando se o check-in foi bem-sucedido ou se houve um erro de lógica (ex: check-in fechado).

### Como o sistema sabe quando deve atualizar os outros usuários?

O servidor (`server.js`) atua como a autoridade central que gerencia o estado da aplicação. [cite_start]Toda vez que uma ação de um usuário resulta em uma mudança de estado que precisa ser refletida globalmente, o servidor utiliza o método **`io.emit('nome-do-evento', dados)`**. [cite: 51]

O `io.emit()` é a instrução da biblioteca Socket.IO para enviar uma mensagem a **todos os clientes conectados simultaneamente**. Por exemplo, quando um participante faz check-in (`socket.on('participante.chegou', ...)`), o servidor adiciona o nome à lista e imediatamente dispara `io.emit('presenca.confirmada', ...)` com a nova lista. [cite_start]Isso garante que a tela do administrador e de quaisquer outros observadores seja atualizada instantaneamente, sem a necessidade de recarregar a página. [cite: 14]

### Que parte do código mostra claramente o uso do paradigma orientado a eventos?

[cite_start]O uso do paradigma é a espinha dorsal do arquivo `server.js`, especificamente dentro do bloco `io.on('connection', (socket) => { ... });`. [cite: 52]

* **Escuta de Eventos (`on`):** As linhas como `socket.on('evento.iniciar', () => { ... })` e `socket.on('participante.chegou', (data) => { ... })` são a demonstração clara do servidor "escutando" passivamente por eventos que chegam dos clientes. [cite_start]O fluxo do programa não é sequencial; ele é **reativo** a essas ocorrências. [cite: 21]

* **Reação e Emissão de Eventos (`emit`):** Dentro da função de callback de cada `socket.on`, o servidor processa a lógica e, em seguida, **reage** disparando um novo evento com `io.emit('presenca.confirmada', ...)` ou `io.emit('evento.iniciado', ...)`. [cite_start]Este ciclo de **escutar, reagir e emitir** é a essência da programação orientada a eventos e a base para a comunicação em tempo real da aplicação. [cite: 22]