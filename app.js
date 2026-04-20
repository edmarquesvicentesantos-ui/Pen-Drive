// ... dentro da função onSnapshot, onde gera o grid.innerHTML ...
onSnapshot(query(collection(db, "estoque"), orderBy("data", "desc")), (snap) => {
    const grid = document.getElementById('grid-produtos');
    grid.innerHTML = "";
    snap.forEach(doc => {
        const p = doc.data();
        
        // Cálculo do Lucro que vai pro bolso
        const lucroReais = p.preco - p.custo;
        // Cálculo da Margem Real (%)
        const margemPorcentagem = p.preco > 0 ? (lucroReais / p.preco) * 100 : 0;

        grid.innerHTML += `
            <div class="card">
                <span class="barcode">COD: ${p.codigo}</span>
                <h4>${p.nome}</h4>
                <span class="preco">Venda: R$ ${p.preco.toFixed(2)}</span>
                <div style="margin-top: 10px; border-top: 1px solid #333; padding-top: 5px;">
                    <small style="color: #2ecc71; display: block;">Lucro: R$ ${lucroReais.toFixed(2)}</small>
                    <small style="color: #3498db; display: block;">Margem Real: ${margemPorcentagem.toFixed(1)}%</small>
                </div>
            </div>
        `;
    });
});
