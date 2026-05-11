// informacao.js

// Mudei os nomes aqui para: botoesInfo e containersInfo
const botoesInfo = document.querySelectorAll('.botao-opcoes-2');
const containersInfo = document.querySelectorAll('.cards-container');

botoesInfo.forEach(botao => {
    botao.addEventListener('click', () => {
        
        // Remove active dos botões
        botoesInfo.forEach(btn => btn.classList.remove('active'));
        botao.classList.add('active');

        const filtro = botao.getAttribute('data-filter');

        containersInfo.forEach(container => {
            if (container.id === filtro) {
                container.style.display = 'flex';
            } else {
                container.style.display = 'none';
            }
        });
    });
});