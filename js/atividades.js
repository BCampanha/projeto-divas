// ========================================
// FILTRO DA GALERIA - ATIVIDADES
// ========================================

const botoes = document.querySelectorAll('.botao-opcoes');
const gallery = document.getElementById('gallery');
const cards = document.querySelectorAll('.photo-card');

botoes.forEach(botao => {
    botao.addEventListener('click', () => {
        // 1. Atualiza botão ativo
        botoes.forEach(b => b.classList.remove('active'));
        botao.classList.add('active');

        const filtro = botao.getAttribute('data-filter');

        // 2. Mostra/esconde cards
        cards.forEach(card => {
            const categoria = card.getAttribute('data-category');

            if (filtro === 'todos' || categoria === filtro) {
                card.classList.remove('hide');
            } else {
                card.classList.add('hide');
            }
        });

        // 3. Reorganiza grid (opcional - melhora o layout)
        const visiveis = [...cards].filter(c => !c.classList.contains('hide'));
        visiveis.forEach(card => gallery.appendChild(card));
    });
});


// ========================================
// NOVO: FILTRAR AUTOMATICAMENTE AO CARREGAR
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. Descobre qual botão já está com a classe 'active' no HTML
    const botaoAtivo = document.querySelector('.botao-opcoes.active');
    
    if (botaoAtivo) {
        const filtroInicial = botaoAtivo.getAttribute('data-filter');
        
        // 2. Aplica a lógica de filtro para esse botão
        cards.forEach(card => {
            const categoria = card.getAttribute('data-category');
            
            if (filtroInicial === 'todos' || categoria === filtroInicial) {
                card.classList.remove('hide');
            } else {
                card.classList.add('hide');
            }
        });

        // 3. Reorganiza o grid na ordem correta
        const visiveis = [...cards].filter(c => !c.classList.contains('hide'));
        visiveis.forEach(card => gallery.appendChild(card));
    }
});