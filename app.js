// Função para carregar o catálogo automaticamente do Firebase
async function carregarCatalogo() {
    const vitrine = document.getElementById('vitrine-produtos');
    const snap = await getDocs(collection(db, "estoque"));
    
    vitrine.innerHTML = ""; // Limpa antes de carregar
    
    snap.forEach((doc) => {
        const p = doc.data();
        vitrine.innerHTML += `
            <div class="card-produto-catalogo" onclick="adicionarPorNome('${p.nome}')">
                <img src="${p.foto}" class="img-catalogo" onerror="this.src='https://via.placeholder.com/80'">
                <span class="nome-catalogo">${p.nome}</span>
                <span class="preco-catalogo">R$ ${p.precoVenda.toFixed(2)}</span>
            </div>
        `;
    });
}

// Atualiza o abrir/fechar para carregar os produtos quando abrir
window.toggleCategorias = () => {
    const lista = document.getElementById('lista-categorias');
    if (lista.style.display === "block") {
        lista.style.display = "none";
    } else {
        lista.style.display = "block";
        carregarCatalogo(); // Busca os produtos no banco de dados
    }
};
// Carrega os produtos assim que a página abre
window.addEventListener('DOMContentLoaded', () => {
    carregarCatalogo('TODOS');
});

window.carregarCatalogo = async (categoria) => {
    const vitrine = document.getElementById('vitrine-produtos');
    const snap = await getDocs(collection(db, "estoque"));
    
    vitrine.innerHTML = ""; 
    
    snap.forEach((doc) => {
        const p = doc.data();
        
        // Verifica se o produto pertence à categoria ou se está em "TODOS"
        // Para isso funcionar, cadastre o campo 'categoria' no modal de gestão
        if (categoria === 'TODOS' || p.categoria === categoria) {
            vitrine.innerHTML += `
                <div class="card-produto-catalogo" onclick="adicionarPorNome('${p.nome}')">
                    <img src="${p.foto}" class="img-catalogo" onerror="this.src='https://via.placeholder.com/60'">
                    <div style="font-size:10px; margin-top:5px; color:#fff">${p.nome}</div>
                    <div style="font-size:11px; color:var(--verde)">R$ ${p.precoVenda.toFixed(2)}</div>
                </div>
            `;
        }
    });
};

// Função para filtrar quando clicar nos botões BAR ou BOTICÁRIO
window.filtrarCatalogo = (cat) => {
    document.querySelectorAll('.aba-filtro').forEach(btn => btn.classList.remove('ativa'));
    event.target.classList.add('ativa');
    carregarCatalogo(cat);
};
