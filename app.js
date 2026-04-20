import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, where, getDocs, updateDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAZf_RpFnTCS3DxqKIxpK7CEh5aTrLMEs4",
    authDomain: "boteco934-afc3f.firebaseapp.com",
    projectId: "boteco934-afc3f",
    storageBucket: "boteco934-afc3f.appspot.com",
    messagingSenderId: "182023728304",
    appId: "1:182023728304:web:e716c52a0d91b192727ae6"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
let carrinho = [];
let produtosTemporarios = [];

// --- IMPRESSÃO TÉRMICA ---
function imprimirRecibo(cliente, itens, total, tipo) {
    const win = window.open('', '', 'width=300,height=600');
    let listaHtml = itens.map(i => `<tr><td style="font-size:12px">${i.qtd}x ${i.nome}</td><td align="right" style="font-size:12px">${i.subtotal.toFixed(2)}</td></tr>`).join('');
    win.document.write(`<html><body onload="window.print();window.close()"><div style="font-family:monospace;width:100%"><center><strong style="font-size:16px">BOTECO 934</strong><br>Petrolina - PE<br>--------------------------</center><table style="width:100%">${listaHtml}</table>--------------------------<br><strong>TOTAL: R$ ${total.toFixed(2)}</strong><br>PAGTO: ${tipo}<br><center>--------------------------<br>🍻 Volte Sempre! 🍻</center></div></body></html>`);
    win.document.close();
}

// --- WHATSAPP ---
function enviarZap(cliente, itens, total, tipo) {
    let msg = `*Boteco 934 - Recibo*%0ACliente: ${cliente}%0A------------------%0A`;
    itens.forEach(i => msg += `${i.qtd}x ${i.nome} - R$ ${i.subtotal.toFixed(2)}%0A`);
    msg += `------------------%0A*Total: R$ ${total.toFixed(2)}*%0A🍻 Volte sempre!`;
    window.open(`https://wa.me/?text=${msg}`, '_blank');
}

// --- SISTEMA DE IMPORTAÇÃO COM CONFERÊNCIA ---
document.getElementById('arquivoImportar').addEventListener('change', function(e) {
    const reader = new FileReader();
    reader.onload = (ev) => {
        try {
            produtosTemporarios = JSON.parse(ev.target.result);
            mostrarConferencia();
        } catch (err) { alert("Erro: O arquivo deve ser um JSON válido."); }
    };
    reader.readAsText(e.target.files[0]);
});

function mostrarConferencia() {
    const corpo = document.getElementById('corpoConferencia');
    corpo.innerHTML = produtosTemporarios.map(p => `
        <tr style="border-bottom: 1px solid #333;">
            <td>${p.nome}</td>
            <td>${p.custoGarrafa.toFixed(2)}</td>
            <td>${p.precoVenda.toFixed(2)}</td>
            <td>${p.codigo}</td>
        </tr>
    `).join('');
    document.getElementById('areaConferencia').style.display = "block";
}

window.confirmarImportacao = async () => {
    for (const p of produtosTemporarios) {
        await addDoc(collection(db, "estoque"), p);
    }
    alert("Estoque atualizado com sucesso!");
    window.cancelarImportacao();
};

window.cancelarImportacao = () => {
    produtosTemporarios = [];
    document.getElementById('areaConferencia').style.display = "none";
    document.getElementById('arquivoImportar').value = "";
};

// --- EXPORTAR BACKUP ---
window.exportarEstoque = async () => {
    const snap = await getDocs(collection(db, "estoque"));
    const dados = []; snap.forEach(d => dados.push(d.data()));
    const blob = new Blob([JSON.stringify(dados, null, 2)], {type: "application/json"});
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = 'backup_boteco934.json'; a.click();
};

// --- LÓGICA DE VENDA (BIPAR) ---
document.getElementById('biparVenda').addEventListener('change', async (e) => {
    const code = e.target.value.trim();
    if (!code) return;
    const q = query(collection(db, "estoque"), where("codigo", "==", code));
    const snap = await getDocs(q);
    if (!snap.empty) {
        const docRef = snap.docs[0];
        const p = docRef.data();
        const ex = carrinho.find(i => i.codigo === code);
        if (ex) { ex.qtd += 1; ex.subtotal = ex.qtd * p.precoVenda; }
        else { carrinho.push({ nome: p.nome, preco: p.precoVenda, codigo: code, qtd: 1, subtotal: p.precoVenda, idBanco: docRef.id }); }
        renderizarCarrinho();
    }
    e.target.value = ""; e.target.focus();
});

function renderizarCarrinho() {
    document.getElementById('lista-carrinho').innerHTML = carrinho.map(i => `<div class="item-carrinho"><span>${i.qtd}x ${i.nome}</span><span>R$ ${i.subtotal.toFixed(2)}</span></div>`).join('');
    document.getElementById('total-venda-valor').innerText = `R$ ${carrinho.reduce((a, b) => a + b.subtotal, 0).toFixed(2)}`;
}

// --- FINALIZAR ---
window.finalizarVenda = async () => {
    const cliente = document.getElementById('identificacaoCliente').value.toUpperCase();
    const pag = document.getElementById('metodoPagamento').value;
    const total = carrinho.reduce((a, b) => a + b.subtotal, 0);
    if (!cliente || total === 0) return alert("Identifique o cliente e os produtos!");

    for (const item of carrinho) {
        const ref = doc(db, "estoque", item.idBanco);
        const s = await getDoc(ref);
        if (s.exists()) await updateDoc(ref, { estoqueAtual: s.data().estoqueAtual - item.qtd });
    }
    await addDoc(collection(db, "vendas"), { cliente, pagamento: pag, total, itens: carrinho, data: new Date() });
    
    const op = prompt("1-Imprimir | 2-WhatsApp | 3-Ambos | 4-Só Salvar");
    if (op == "1" || op == "3") imprimirRecibo(cliente, carrinho, total, pag);
    if (op == "2" || op == "3") enviarZap(cliente, carrinho, total, pag);

    carrinho = []; renderizarCarrinho(); document.getElementById('identificacaoCliente').value = "";
};

// --- MONITORES EM TEMPO REAL ---
onSnapshot(collection(db, "vendas"), (s) => {
    let t = { Pix: 0, Dinheiro: 0, Cartão: 0, Pendura: 0 };
    s.forEach(d => { if (t[d.data().pagamento] !== undefined) t[d.data().pagamento] += d.data().total; });
    document.getElementById('faturamento-pix').innerText = `R$ ${t.Pix.toFixed(2)}`;
    document.getElementById('faturamento-dinheiro').innerText = `R$ ${t.Dinheiro.toFixed(2)}`;
    document.getElementById('faturamento-cartao').innerText = `R$ ${t.Cartão.toFixed(2)}`;
    document.getElementById('faturamento-pendura').innerText = `R$ ${t.Pendura.toFixed(2)}`;
});

onSnapshot(collection(db, "estoque"), (s) => {
    const g = document.getElementById('grid-estoque'); g.innerHTML = "";
    s.forEach(d => {
        const p = d.data(); const porc = (p.estoqueAtual / p.rendimento) * 100;
        g.innerHTML += `<div class="card-estoque"><div style="display:flex;justify-content:space-between;font-size:13px"><span>${p.nome}</span><span>${p.estoqueAtual} doses</span></div><div class="barra-fora"><div class="barra-dentro" style="width:${porc}%; background:${porc < 20 ? '#ff5e5e' : '#1fcc7d'}"></div></div></div>`;
    });
});

window.salvarProduto = async () => {
    const nome = document.getElementById('nomeProduto').value.toUpperCase();
    const preco = parseFloat(document.getElementById('precoProduto').value);
    const custo = parseFloat(document.getElementById('custoProduto').value);
    const rend = parseInt(document.getElementById('qtdDoses').value) || 1;
    const cod = document.getElementById('codigoBarra').value.trim();
    await addDoc(collection(db, "estoque"), { nome, precoVenda: preco, custoGarrafa: custo, rendimento: rend, estoqueAtual: rend, codigo: cod, data: new Date() });
    alert("Produto salvo!");
    document.getElementById('codigoBarra').value = ""; document.getElementById('nomeProduto').value = "";
};
