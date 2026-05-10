const botoes = document.querySelectorAll('.botao-opcoes');
const grid   = document.querySelector('.grid-imagens');
const cards  = document.querySelectorAll('.card-grande, .card-pequeno');
 
botoes.forEach(botao => {
    botao.addEventListener('click', () => {
 
        // 1. Atualiza botão ativo
        botoes.forEach(b => b.classList.remove('active'));
        botao.classList.add('active');
 
        const filtro = botao.getAttribute('data-filter');
 
        // 2. Mostra ou esconde cada card
        cards.forEach(card => {
            const categoria = card.getAttribute('data-category');
 
            if (filtro === 'todos' || categoria === filtro) {
                card.classList.remove('hide');
            } else {
                card.classList.add('hide');
            }
        });
 
        /*
         * 3. Reposiciona os cards visíveis no grid.
         *
         * Problema: quando o card-grande (span 2 linhas) é escondido,
         * os card-pequeno ficam desalinhados sozinhos na coluna esquerda.
         *
         * Solução: move os cards visíveis para dentro de um novo wrapper,
         * garantindo que sempre venha: grande → pequeno → pequeno.
         */
        const visiveis = [...cards].filter(c => !c.classList.contains('hide'));
 
        // Reinsere na ordem correta dentro do grid
        visiveis.forEach(card => grid.appendChild(card));
    });
});