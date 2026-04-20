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

window.buscarReposicao = (n) => window.open(`https://www.google.com/search?q=${encodeURIComponent(n)}+preço+atacado&tbm=isch`, '_blank');

async function adicionar(v, porNome = false) {
    const q = porNome ? query(collection(db, "estoque"), where("nome", "==", v)) : query(collection(db, "estoque"), where("codigo", "==", v));
    const snap = await getDocs(q);
    if (!snap.empty) {
        const d = snap.docs[0]; const p = d.data();
        const ex = carrinho.find(i => i.idBanco === d.id);
        if (ex) { ex.qtd++; ex.subtotal = ex.qtd * p.precoVenda; }
        else { carrinho.push({ nome: p.nome, preco: p.precoVenda, qtd: 1, subtotal: p.precoVenda, idBanco: d.id }); }
        renderizar();
    }
}

document.getElementById('biparVenda').addEventListener('change', (e) => { adicionar(e.target.value.trim()); e.target.value = ""; e.target.focus(); });
window.adicionarPorNome = (n) => adicionar(n, true);

function renderizar() {
    document.getElementById('corpo-carrinho').innerHTML = carrinho.map(i => `<tr><td>${i.nome}</td><td>${i.qtd}x</td><td style="text-align:right">R$ ${i.subtotal.toFixed(2)}</td></tr>`).join('');
    document.getElementById('total-venda-valor').innerText = carrinho.reduce((a, b) => a + b.subtotal, 0).toFixed(2);
}

window.finalizarVenda = async () => {
    const total = carrinho.reduce((a, b) => a + b.subtotal, 0);
    const cliente = document.getElementById('identificacaoCliente').value.toUpperCase() || "CONSUMIDOR";
    const pag = document.getElementById('metodoPagamento').value;
    if (total === 0) return;
    for (const item of carrinho) {
        const ref = doc(db, "estoque", item.idBanco);
        const s = await getDoc(ref);
        if (s.exists()) await updateDoc(ref, { estoqueAtual: s.data().estoqueAtual - item.qtd });
    }
    await addDoc(collection(db, "vendas"), { cliente, pagamento: pag, total, data: new Date() });
    alert("Venda OK!"); carrinho = []; renderizar();
};

window.exportarEstoque = async () => {
    const q = query(collection(db, "estoque"));
    const snap = await getDocs(q);
    const dados = []; snap.forEach(doc => dados.push(doc.data()));
    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `backup_boteco934.json`; a.click();
};

window.importarEstoque = (e) => {
    const leitor = new FileReader();
    leitor.onload = async (ev) => {
        const produtos = JSON.parse(ev.target.result);
        for (const p of produtos) { await addDoc(collection(db, "estoque"), { codigo: p.codigo, nome: p.nome.toUpperCase(), precoVenda: parseFloat(p.precoVenda), estoqueAtual: parseInt(p.estoqueAtual) }); }
        alert("Importado!");
    };
    leitor.readAsText(e.target.files[0]);
};

onSnapshot(collection(db, "estoque"), (s) => {
    const lista = document.getElementById('lista-reposicao'); lista.innerHTML = "";
    s.forEach(d => { const p = d.data(); if (p.estoqueAtual <= 5) lista.innerHTML += `<div class="item-alerta"><span>${p.nome} (${p.estoqueAtual})</span><button onclick="buscarReposicao('${p.nome}')">VER</button></div>`; });
});

onSnapshot(collection(db, "vendas"), (s) => {
    const pen = {}; s.forEach(d => { if (d.data().pagamento === "Pendura") pen[d.data().cliente] = (pen[d.data().cliente] || 0) + d.data().total; });
    document.getElementById('lista-penduras').innerHTML = Object.entries(pen).map(([n, t]) => `<div style="display:flex; justify-content:space-between; font-size:11px;">${n} <b>R$ ${t.toFixed(2)}</b></div>`).join('');
});

window.abrirModal = () => document.getElementById('modalCadastro').style.display = 'flex';
window.fecharModal = () => document.getElementById('modalCadastro').style.display = 'none';
window.salvarNovoProduto = async () => {
    const codigo = document.getElementById('cadCodigo').value;
    const nome = document.getElementById('cadNome').value.toUpperCase();
    const preco = parseFloat(document.getElementById('cadPreco').value);
    const estoque = parseInt(document.getElementById('cadEstoque').value);
    await addDoc(collection(db, "estoque"), { codigo, nome, precoVenda: preco, estoqueAtual: estoque });
    alert("Salvo!"); fecharModal();
};
