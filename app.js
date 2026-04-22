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
