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

// --- LOGICA PDV ---
async function adicionar(valor, porNome = false) {
    try {
        const q = porNome ? query(collection(db, "estoque"), where("nome", "==", valor)) : query(collection(db, "estoque"), where("codigo", "==", valor));
        const snap = await getDocs(q);
        if (!snap.empty) {
            const d = snap.docs[0]; const p = d.data();
            const ex = carrinho.find(i => i.idBanco === d.id);
            if (ex) { ex.qtd++; ex.subtotal = ex.qtd * Number(p.precoVenda); }
            else { carrinho.push({ nome: p.nome, preco: Number(p.precoVenda), qtd: 1, subtotal: Number(p.precoVenda), idBanco: d.id }); }
            renderizar();
        } else { alert("Produto não cadastrado!"); }
    } catch (e) { console.error(e); }
}

document.getElementById('biparVenda').addEventListener('change', (e) => {
    adicionar(e.target.value.trim()); e.target.value = ""; e.target.focus();
});
window.adicionarPorNome = (n) => adicionar(n, true);

function renderizar() {
    document.getElementById('corpo-carrinho').innerHTML = carrinho.map(i => `<tr><td>${i.nome}</td><td>${i.qtd}x</td><td style="text-align:right">R$ ${i.subtotal.toFixed(2)}</td></tr>`).join('');
    document.getElementById('total-venda-valor').innerText = carrinho.reduce((a, b) => a + b.subtotal, 0).toFixed(2);
}

window.finalizarVenda = async () => {
    try {
        const total = carrinho.reduce((a, b) => a + b.subtotal, 0);
        const cliente = document.getElementById('identificacaoCliente').value.trim().toUpperCase() || "CONSUMIDOR";
        const pag = document.getElementById('metodoPagamento').value;
        if (carrinho.length === 0) return alert("Carrinho vazio!");

        for (const item of carrinho) {
            const ref = doc(db, "estoque", item.idBanco);
            const s = await getDoc(ref);
            if (s.exists()) await updateDoc(ref, { estoqueAtual: Number(s.data().estoqueAtual) - item.qtd });
        }

        await addDoc(collection(db, "vendas"), { cliente, pagamento: pag, total: Number(total), data: new Date() });
        alert("VENDA CONCLUÍDA! 🍻");
        carrinho = []; renderizar();
        document.getElementById('identificacaoCliente').value = "";
    } catch (e) { alert("Erro ao finalizar: " + e.message); }
};

// --- LOGICA GESTÃO & FINANCEIRO ---
window.mudarAba = (aba) => {
    document.querySelectorAll('.aba-conteudo').forEach(a => a.style.display = 'none');
    document.querySelectorAll('.aba-btn').forEach(b => b.classList.remove('ativa'));
    if(aba === 'produtos') {
        document.getElementById('aba-produtos').style.display = 'block';
        document.getElementById('btn-aba-prod').classList.add('ativa');
    } else {
        document.getElementById('aba-contas').style.display = 'block';
        document.getElementById('btn-aba-fin').classList.add('ativa');
        atualizarResumoFinanceiro();
    }
};

window.salvarFinanceiro = async () => {
    const desc = document.getElementById('finDescricao').value.toUpperCase();
    const valor = parseFloat(document.getElementById('finValor').value);
    const tipo = document.getElementById('finTipo').value;
    if (!desc || isNaN(valor)) return alert("Dados inválidos!");
    await addDoc(collection(db, "financeiro"), { descricao: desc, valor: valor, tipo: tipo, data: new Date() });
    alert("Lançado!"); document.getElementById('finDescricao').value = ""; document.getElementById('finValor').value = "";
    atualizarResumoFinanceiro();
};

async function atualizarResumoFinanceiro() {
    const hoje = new Date().setHours(0,0,0,0);
    const snapV = await getDocs(collection(db, "vendas"));
    let vHoje = 0; snapV.forEach(d => { if(d.data().data.toDate() >= hoje) vHoje += d.data().total; });
    const snapF = await getDocs(collection(db, "financeiro"));
    let dHoje = 0; snapF.forEach(d => { if(d.data().data.toDate() >= hoje && d.data().tipo === "Saída") dHoje += d.data().valor; });
    document.getElementById('resumo-vendas').innerText = `R$ ${vHoje.toFixed(2)}`;
    document.getElementById('resumo-despesas').innerText = `R$ ${dHoje.toFixed(2)}`;
    document.getElementById('resumo-saldo').innerText = `R$ ${(vHoje - dHoje).toFixed(2)}`;
}

// --- MONITORES REAL-TIME ---
onSnapshot(collection(db, "estoque"), (s) => {
    const lista = document.getElementById('lista-reposicao'); lista.innerHTML = "";
    s.forEach(d => {
        const p = d.data();
        if (Number(p.estoqueAtual) <= 5) {
            lista.innerHTML += `<div class="item-alerta"><span>${p.nome} (${p.estoqueAtual})</span><button onclick="window.open('https://www.google.com/search?q=${p.nome}+preço+atacado&tbm=isch')">VER</button></div>`;
        }
    });
});

onSnapshot(collection(db, "vendas"), (s) => {
    const pen = {}; const clientesSet = new Set();
    s.forEach(d => {
        const v = d.data(); clientesSet.add(v.cliente);
        if (v.pagamento === "Pendura") pen[v.cliente] = (pen[v.cliente] || 0) + v.total;
    });
    document.getElementById('lista-penduras').innerHTML = Object.entries(pen).map(([n, t]) => `<div style="display:flex; justify-content:space-between; font-size:11px;">${n} <b>R$ ${t.toFixed(2)}</b></div>`).join('');
    document.getElementById('lista-clientes-sugestao').innerHTML = Array.from(clientesSet).map(c => `<option value="${c}">`).join('');
});

// --- AUXILIARES ---
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

window.exportarEstoque = async () => {
    const snap = await getDocs(collection(db, "estoque"));
    const dados = []; snap.forEach(doc => dados.push(doc.data()));
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([JSON.stringify(dados, null, 2)], {type:"application/json"})); a.download=`backup_934.json`; a.click();
};
