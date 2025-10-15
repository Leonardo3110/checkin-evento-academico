// public/js/admin.js

// 1. Conexão com o Servidor Socket.IO
const socket = io();

// 2. Mapeamento dos Elementos do HTML
const statusEvento = document.getElementById('statusEvento');
const btnIniciar = document.getElementById('btnIniciar');
const btnEncerrar = document.getElementById('btnEncerrar');
const totalPresentes = document.getElementById('totalPresentes');
const listaPresentes = document.getElementById('listaPresentes');

// --- PARTE 1: EMITIR (emit) EVENTOS PARA O SERVIDOR ---

// Adiciona um 'escutador' de clique ao botão Iniciar.
btnIniciar.addEventListener('click', () => {
    // Ao ser clicado, EMITE o evento 'evento.iniciar' para o servidor.
    socket.emit('evento.iniciar');
});

// Adiciona um 'escutador' de clique ao botão Encerrar.
btnEncerrar.addEventListener('click', () => {
    // Ao ser clicado, EMITE o evento 'evento.encerrar' para o servidor.
    socket.emit('evento.encerrar');
});

// --- PARTE 2: ESCUTAR (on) EVENTOS VINDOS DO SERVIDOR ---

// Função auxiliar para atualizar a lista de presença na tela.
// Isso evita a repetição de código.
const atualizarLista = (participantes) => {
    listaPresentes.innerHTML = ''; // Limpa a lista atual para não duplicar nomes.
    participantes.forEach(nome => {
        const li = document.createElement('li'); // Cria um item <li>
        li.textContent = nome; // Define o texto do item como o nome do participante.
        listaPresentes.appendChild(li); // Adiciona o item à lista <ul>.
    });
    totalPresentes.innerText = participantes.length; // Atualiza o contador de presentes.
};

// ESCUTA pelo evento 'estado.atual' para saber o estado do evento ao carregar a página.
socket.on('estado.atual', (estado) => {
    if (estado.iniciado) {
        statusEvento.innerText = 'Check-in Aberto!';
        btnIniciar.disabled = true;
        btnEncerrar.disabled = false;
    }
    // Atualiza a lista de presença com os dados que já estavam no servidor.
    atualizarLista(estado.participantes);
});

// ESCUTA pelo evento 'evento.iniciado' que o próprio admin (ou outro admin) disparou.
socket.on('evento.iniciado', (data) => {
    // REAÇÃO: Atualiza a interface.
    statusEvento.innerText = data.message;
    btnIniciar.disabled = true; // Desabilita o botão 'Iniciar' para evitar múltiplos cliques.
    btnEncerrar.disabled = false; // Habilita o botão 'Encerrar'.
});

// ESCUTA pelo evento 'presenca.confirmada', que é disparado toda vez que um novo participante faz check-in.
socket.on('presenca.confirmada', (participantes) => {
    // REAÇÃO: Chama a função para atualizar a lista de presença em tempo real.
    atualizarLista(participantes);
});

// ESCUTA pelo evento 'evento.encerrado'.
socket.on('evento.encerrado', (data) => {
    // REAÇÃO: Atualiza a interface.
    statusEvento.innerText = data.message;
    btnIniciar.disabled = false; // Habilita o botão 'Iniciar' novamente (para um possível novo evento).
    btnEncerrar.disabled = true; // Desabilita o botão 'Encerrar'.
});