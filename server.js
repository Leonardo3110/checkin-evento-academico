// server.js

// 1. Importação dos módulos necessários
// O 'express' é usado para criar o servidor web que vai entregar nossos arquivos HTML, CSS e JS.
const express = require('express');
// O 'http' é um módulo padrão do Node.js, necessário para criar o servidor base.
const http = require('http');
// Importamos a classe 'Server' da biblioteca 'socket.io' para a comunicação em tempo real.
const { Server } = require('socket.io');

// 2. Configuração do servidor
const app = express(); // Inicializa o Express
const server = http.createServer(app); // Cria o servidor HTTP usando o Express
const io = new Server(server); // Conecta o Socket.IO ao servidor HTTP

// Middleware do Express para servir arquivos estáticos.
// Isso diz ao servidor para procurar os arquivos HTML, CSS e JS do cliente na pasta 'public'.
app.use(express.static('public'));

// 3. Estado Central da Aplicação
// Este objeto vai funcionar como a "memória" do nosso servidor.
// Ele armazena se o evento está ativo e a lista de participantes que fizeram check-in.
let estadoDoEvento = {
    iniciado: false,
    participantes: []
};

// 4. Lógica de Conexão do Socket.IO (O Coração do Paradigma de Eventos)
// O evento 'connection' é disparado pelo Socket.IO sempre que um novo cliente (navegador) se conecta.
io.on('connection', (socket) => {
    console.log(`Usuário conectado com o ID: ${socket.id}`);

    // Assim que um cliente conecta, o servidor EMITE o evento 'estado.atual'
    // enviando o estado atual do evento APENAS para esse cliente.
    socket.emit('estado.atual', estadoDoEvento);

    // --- AQUI COMEÇA A ESCUTA (ON) E REAÇÃO A EVENTOS VINDOS DOS CLIENTES ---

    // O servidor fica ESCUTANDO pelo evento 'evento.iniciar', que será emitido pelo admin.
    socket.on('evento.iniciar', () => {
        // Bloco try...catch para garantir que o servidor não quebre por um erro inesperado.
        try {
            console.log('Evento "evento.iniciar" recebido do admin.');
            estadoDoEvento.iniciado = true; // Muda o estado central

            // REAÇÃO: O servidor EMITE o evento 'evento.iniciado' para TODOS os clientes conectados.
            // Isso demonstra o encadeamento: um evento recebido gera outro emitido. [cite: 22]
            io.emit('evento.iniciado', { message: 'Check-in Aberto!' });
        } catch (error) {
            console.error('Erro ao processar "evento.iniciar":', error);
        }
    });

    // O servidor fica ESCUTANDO pelo evento 'participante.chegou', emitido por um participante. [cite: 21]
    socket.on('participante.chegou', (data) => {
        try {
            // Validação de Lógica de Negócio: só aceita check-in se o evento estiver iniciado. [cite: 30]
            if (!estadoDoEvento.iniciado) {
                // Emite um evento de erro apenas para o cliente que tentou o check-in.
                return socket.emit('feedback.erro', { message: 'O check-in está fechado no momento!' });
            }

            const nomeParticipante = data.nome.trim();

            if (!nomeParticipante) {
                return socket.emit('feedback.erro', { message: 'O nome é um campo obrigatório.' });
            }

            // Lógica principal: adiciona o participante à lista de presença.
            estadoDoEvento.participantes.push(nomeParticipante);

            // REAÇÃO: Emite 'presenca.confirmada' para TODOS, atualizando a lista de presentes em tempo real. [cite: 14]
            io.emit('presenca.confirmada', estadoDoEvento.participantes);
            // Envia um feedback de sucesso apenas para o cliente que fez o check-in. [cite: 35]
            socket.emit('feedback.sucesso', { message: 'Sua presença foi confirmada!' });

        } catch (error) {
            console.error('Erro ao processar "participante.chegou":', error);
            // Em caso de erro inesperado, notifica o cliente. [cite: 45]
            socket.emit('erro.operacao', { message: 'Ocorreu um erro inesperado ao processar seu check-in.' });
        }
    });

    // O servidor fica ESCUTANDO pelo evento 'evento.encerrar', emitido pelo admin.
    socket.on('evento.encerrar', () => {
        try {
            console.log('Evento "evento.encerrar" recebido do admin.');
            estadoDoEvento.iniciado = false; // Muda o estado central

            // REAÇÃO: Notifica TODOS os clientes que o evento foi encerrado.
            io.emit('evento.encerrado', { message: 'Check-in Encerrado.' });
        } catch (error) {
            console.error('Erro ao processar "evento.encerrar":', error);
        }
    });

    // O evento 'disconnect' é padrão do Socket.IO e dispara quando um cliente fecha a página.
    socket.on('disconnect', () => {
        console.log(`Usuário desconectado: ${socket.id}`);
    });
});

// 5. Inicialização do Servidor
// Define a porta em que o servidor vai rodar.
const PORT = 3000;
server.listen(PORT, () => {
    // Mensagem de confirmação no console do servidor.
    console.log(`Servidor rodando em http://localhost:${PORT}`);
    console.log('Acesse a página do participante em http://localhost:3000');
    console.log('Acesse a página do admin em http://localhost:3000/admin.html');
});