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

// ADICIONAR PRODUTO (BIP OU ATALHO)
async function buscarEAdicionar(codigoOuNome, eNome = false) {
    const q = eNome ? 
        query(collection(db, "estoque"), where("nome", "==", codigoOuNome)) :
        query(collection(db, "estoque"), where("codigo", "==", codigoOuNome));
    
    const snap = await getDocs(q);
    if (!snap.empty) {
        const d = snap.docs[0];
        const p = d.data();
        const ex = carrinho.find(i => i.idBanco === d.id);
        if (ex) {
            ex.qtd++;
            ex.subtotal = ex.qtd * p.precoVenda;
        } else {
            carrinho.push({ nome: p.nome, preco: p.precoVenda, qtd: 1, subtotal: p.precoVenda, idBanco: d.id });
        }
        renderizar();
    }
}

document.getElementById('biparVenda').addEventListener('change', (e) => {
    buscarEAdicionar(e.target.value.trim());
    e.target.value = ""; e.target.focus();
});

window.adicionarPorNome = (nome) => buscarEAdicionar(nome, true);

function renderizar() {
    const corpo = document.getElementById('corpo-carrinho');
    corpo.innerHTML = carrinho.map(i => `
        <tr>
            <td>${i.nome}</td>
            <td>${i.qtd}x</td>
            <td style="text-align:right">R$ ${i.subtotal.toFixed(2)}</td>
        </tr>
    `).join('');
    document.getElementById('total-venda-valor').innerText = carrinho.reduce((a, b) => a + b.subtotal, 0).toFixed(2);
}

// FINALIZAR VENDA
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
    alert("Venda Finalizada!");
    carrinho = []; renderizar();
    document.getElementById('identificacaoCliente').value = "";
};

// GESTÃO DE PRODUTOS
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

// MONITOR DE PENDURAS
onSnapshot(collection(db, "vendas"), (s) => {
    const p = {};
    s.forEach(d => { if (d.data().pagamento === "Pendura") p[d.data().cliente] = (p[d.data().cliente] || 0) + d.data().total; });
    document.getElementById('lista-penduras').innerHTML = Object.entries(p).map(([n, t]) => `
        <div class="item-pendura">${n} <span>R$ ${t.toFixed(2)}</span></div>
    `).join('');
});
