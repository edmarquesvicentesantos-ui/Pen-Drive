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

// WHATSAPP
function enviarRecibo(cliente, itens, total, tipo) {
    let msg = `*Boteco 934 - Recibo*%0ACliente: ${cliente}%0A------------------%0A`;
    itens.forEach(i => msg += `${i.qtd}x ${i.nome} - R$ ${i.subtotal.toFixed(2)}%0A`);
    msg += `------------------%0A*Total: R$ ${total.toFixed(2)}*%0AForma: ${tipo}%0A%0A🍻 Volte sempre!`;
    window.open(`https://wa.me/?text=${msg}`, '_blank');
}

// RECEBER PENDURA
window.receberPendura = async (id, nome) => {
    const met = prompt(`Como ${nome} pagou? (Pix, Dinheiro ou Cartão)`);
    if (met && ["Pix", "Dinheiro", "Cartão"].includes(met)) {
        await updateDoc(doc(db, "vendas", id), { pagamento: met });
        alert("Pendura baixada com sucesso!");
    }
};

// BIPAR
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

// FINALIZAR
window.finalizarVenda = async () => {
    const cliente = document.getElementById('identificacaoCliente').value.toUpperCase();
    const pag = document.getElementById('metodoPagamento').value;
    const total = carrinho.reduce((a, b) => a + b.subtotal, 0);
    if (!cliente || total === 0) return alert("Falta dados!");

    for (const item of carrinho) {
        const ref = doc(db, "estoque", item.idBanco);
        const s = await getDoc(ref);
        if (s.exists()) await updateDoc(ref, { estoqueAtual: s.data().estoqueAtual - item.qtd });
    }
    await addDoc(collection(db, "vendas"), { cliente, pagamento: pag, total, itens: carrinho, data: new Date() });
    if (confirm("Gerar recibo no WhatsApp?")) enviarRecibo(cliente, carrinho, total, pag);
    carrinho = []; renderizarCarrinho(); document.getElementById('identificacaoCliente').value = "";
};

// RELATÓRIOS E INVENTÁRIO
onSnapshot(collection(db, "vendas"), (s) => {
    let t = { Pix: 0, Dinheiro: 0, Cartão: 0, Pendura: 0 };
    const lp = document.getElementById('lista-penduras');
    lp.innerHTML = "";
    s.forEach(d => {
        const v = d.data();
        if (t[v.pagamento] !== undefined) t[v.pagamento] += v.total;
        if (v.pagamento === "Pendura") {
            lp.innerHTML += `<li><span>${v.cliente}: R$ ${v.total.toFixed(2)}</span> <button class="btn-receber" onclick="receberPendura('${d.id}', '${v.cliente}')">RECEBER</button></li>`;
        }
    });
    document.getElementById('faturamento-pix').innerText = `R$ ${t.Pix.toFixed(2)}`;
    document.getElementById('faturamento-dinheiro').innerText = `R$ ${t.Dinheiro.toFixed(2)}`;
    document.getElementById('faturamento-cartao').innerText = `R$ ${t.Cartão.toFixed(2)}`;
    document.getElementById('faturamento-pendura').innerText = `R$ ${t.Pendura.toFixed(2)}`;
});

onSnapshot(collection(db, "estoque"), (s) => {
    const g = document.getElementById('grid-estoque');
    g.innerHTML = "";
    s.forEach(d => {
        const p = d.data();
        const porc = (p.estoqueAtual / p.rendimento) * 100;
        g.innerHTML += `<div class="card-estoque">
            <div style="display:flex; justify-content:space-between; font-size:13px;"><span>${p.nome}</span><span>${p.estoqueAtual} doses</span></div>
            <div class="barra-fora"><div class="barra-dentro" style="width:${porc}%; background:${porc < 20 ? '#ff5e5e' : '#1fcc7d'}"></div></div>
        </div>`;
    });
});

window.salvarProduto = async () => {
    const nome = document.getElementById('nomeProduto').value.toUpperCase();
    const preco = parseFloat(document.getElementById('precoProduto').value);
    const custo = parseFloat(document.getElementById('custoProduto').value);
    const rend = parseInt(document.getElementById('qtdDoses').value) || 1;
    const cod = document.getElementById('codigoBarra').value.trim();
    await addDoc(collection(db, "estoque"), { nome, precoVenda: preco, custoGarrafa: custo, rendimento: rend, estoqueAtual: rend, codigo: cod, data: new Date() });
    alert("Cadastrado!");
};
