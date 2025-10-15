// public/js/main.js

// 1. Conexão com o Servidor Socket.IO
// A variável 'io()' vem do script /socket.io/socket.io.js que incluímos no HTML.
// Ela automaticamente se conecta ao servidor que serviu a página.
const socket = io();

// 2. Mapeamento dos Elementos do HTML
// Guardamos os elementos da página em variáveis para manipulá-los facilmente.
const statusEvento = document.getElementById('statusEvento');
const formCheckin = document.getElementById('formCheckin');
const inputNome = document.getElementById('inputNome');
const feedback = document.getElementById('feedback');

// --- PARTE 1: EMITIR (emit) EVENTOS PARA O SERVIDOR ---

// Adicionamos um 'escutador' de evento de 'submit' ao nosso formulário.
formCheckin.addEventListener('submit', (e) => {
    // e.preventDefault() impede que a página recarregue, o que é essencial para uma SPA (Single Page Application).
    e.preventDefault();
    const nome = inputNome.value;
    if (nome) {
        // Quando o formulário é enviado, o cliente EMITE o evento 'participante.chegou' para o servidor.
        // Junto com o evento, enviamos um objeto com os dados (o nome do participante).
        socket.emit('participante.chegou', { nome });
    }
});

// --- PARTE 2: ESCUTAR (on) EVENTOS VINDOS DO SERVIDOR ---

// O cliente fica ESCUTANDO pelo evento 'estado.atual'.
// Isso é útil para quando o usuário abre a página no meio do evento, ele já sabe o que está acontecendo.
socket.on('estado.atual', (estado) => {
    if (estado.iniciado) {
        statusEvento.innerText = 'Check-in Aberto!';
        formCheckin.style.display = 'block';
    } else {
        statusEvento.innerText = 'Check-in Encerrado.';
        formCheckin.style.display = 'none';
    }
});

// ESCUTA pelo evento 'evento.iniciado'.
socket.on('evento.iniciado', (data) => {
    // REAÇÃO: Atualiza a interface para refletir a mudança.
    statusEvento.innerText = data.message;
    formCheckin.style.display = 'block'; // Mostra o formulário de check-in.
    feedback.innerText = ''; // Limpa mensagens antigas.
});

// ESCUTA pelo evento 'evento.encerrado'.
socket.on('evento.encerrado', (data) => {
    // REAÇÃO: Atualiza a interface.
    statusEvento.innerText = data.message;
    formCheckin.style.display = 'none'; // Esconde o formulário.
});

// ESCUTA pelos eventos de feedback para dar uma resposta clara ao usuário (requisito do trabalho).
socket.on('feedback.sucesso', (data) => {
    feedback.innerText = data.message;
    feedback.style.color = 'green';
    // Desabilita o campo e o botão para impedir múltiplos envios.
    inputNome.disabled = true;
    formCheckin.querySelector('button').disabled = true;
});

socket.on('feedback.erro', (data) => {
    feedback.innerText = data.message;
    feedback.style.color = 'red';
});

// ESCUTA por um evento de erro genérico.
socket.on('erro.operacao', (data) => {
    alert(data.message); // Um alerta para erros mais graves é uma abordagem simples e eficaz.
});