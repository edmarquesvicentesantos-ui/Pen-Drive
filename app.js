// ... (mantenha as configurações do Firebase no topo)

window.salvarProduto = async () => {
    const nome = document.getElementById('nomeProduto').value.toUpperCase();
    const precoVenda = parseFloat(document.getElementById('precoProduto').value);
    const custoGarrafa = parseFloat(document.getElementById('custoProduto').value);
    const rendimento = parseInt(document.getElementById('qtdDoses').value) || 1;
    const codigo = document.getElementById('codigoBarra').value.trim();

    // Cálculo de margem inteligente para o Boteco 934
    const custoPorDose = custoGarrafa / rendimento;

    try {
        await addDoc(collection(db, "estoque"), {
            nome,
            precoVenda,
            custoGarrafa,
            custoPorDose: custoPorDose.toFixed(2),
            rendimento,
            estoqueAtual: rendimento, // Começa com a garrafa cheia de doses
            codigo,
            data: new Date()
        });
        alert(`Cadastrado! Custo por dose: R$ ${custoPorDose.toFixed(2)} ✅`);
        limparCamposCadastro();
    } catch (e) { alert("Erro: " + e.message); }
};

// --- BUSCAR E VENDER (SOMA ITENS E DESCONTA DO ESTOQUE) ---
document.getElementById('biparVenda').addEventListener('change', async (e) => {
    const code = e.target.value.trim();
    if (!code) return;

    const q = query(collection(db, "estoque"), where("codigo", "==", code));
    const snap = await getDocs(q);

    if (!snap.empty) {
        const docRef = snap.docs[0];
        const p = docRef.data();
        
        // Lógica de Venda
        const itemExistente = carrinho.find(i => i.codigo === code);
        if (itemExistente) {
            itemExistente.qtd += 1;
            itemExistente.subtotal = itemExistente.qtd * p.precoVenda;
        } else {
            carrinho.push({ 
                nome: p.nome, 
                preco: p.precoVenda, 
                codigo: code, 
                qtd: 1, 
                subtotal: p.precoVenda,
                idBanco: docRef.id 
            });
        }
        renderizarCarrinho();
    } else {
        alert("Produto não encontrado!");
    }
    e.target.value = ""; e.target.focus();
});

// --- FINALIZAR E DAR BAIXA NO ESTOQUE DE DOSES ---
window.finalizarVenda = async () => {
    const cliente = document.getElementById('identificacaoCliente').value;
    const pagamento = document.getElementById('metodoPagamento').value;
    if (!cliente || carrinho.length === 0) return alert("Falta dados!");

    try {
        // Para cada item vendido, o sistema desconta uma "dose/unidade" no Firebase
        for (const item of carrinho) {
            const ref = doc(db, "estoque", item.idBanco);
            const snap = await getDoc(ref);
            const estoqueAtual = snap.data().estoqueAtual;
            await updateDoc(ref, { estoqueAtual: estoqueAtual - item.qtd });
        }

        await addDoc(collection(db, "vendas"), {
            cliente: cliente.toUpperCase(),
            pagamento,
            total: carrinho.reduce((acc, i) => acc + i.subtotal, 0),
            itens: carrinho,
            data: new Date()
        });

        alert("Venda e Baixa de Estoque Realizadas! 🥃");
        carrinho = [];
        renderizarCarrinho();
    } catch (e) { alert("Erro: " + e.message); }
};
