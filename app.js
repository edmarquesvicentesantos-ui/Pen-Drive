import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, where, getDocs, updateDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

// --- FUNÇÃO PARA RECEBER PENDURA ---
window.receberPagamento = async (vendaId, nomeCliente) => {
    const novoMetodo = prompt(`Como o(a) ${nomeCliente} pagou? (Pix, Dinheiro ou Cartão)` );
    if (!novoMetodo || !["Pix", "Dinheiro", "Cartão"].includes(novoMetodo)) {
        return alert("Pagamento cancelado ou método inválido!");
    }

    try {
        const vendaRef = doc(db, "vendas", vendaId);
        await updateDoc(vendaRef, { pagamento: novoMetodo });
        alert(`Pagamento de ${nomeCliente} recebido via ${novoMetodo}! ✅`);
    } catch (e) {
        alert("Erro ao processar: " + e.message);
    }
};

// --- MANTENDO O PDV E CADASTRO ---
document.getElementById('biparVenda').addEventListener('change', async (e) => {
    const code = e.target.value.trim();
    if (!code) return;
    const q = query(collection(db, "estoque"), where("codigo", "==", code));
    const snap = await getDocs(q);
    if (!snap.empty) {
        const p = snap.docs[0].data();
        const existente = carrinho.find(i => i.codigo === code);
        if (existente) {
            existente.qtd += 1;
            existente.subtotal = existente.qtd * existente.preco;
        } else {
            carrinho.push({ nome: p.nome, preco: p.preco, codigo: code, qtd: 1, subtotal: p.preco });
        }
        renderizarCarrinho();
    }
    e.target.value = ""; e.target.focus();
});

function renderizarCarrinho() {
    const lista = document.getElementById('lista-carrinho');
    const totalElt = document.getElementById('total-venda-valor');
    lista.innerHTML = carrinho.map(item => `<div class="item-carrinho"><span>${item.qtd}x ${item.nome}</span> <span>R$ ${item.subtotal.toFixed(2)}</span></div>`).join('');
    totalElt.innerText = `R$ ${carrinho.reduce((acc, i) => acc + i.subtotal, 0).toFixed(2)}`;
}

window.finalizarVenda = async () => {
    const cliente = document.getElementById('identificacaoCliente').value;
    const pagamento = document.getElementById('metodoPagamento').value;
    const total = carrinho.reduce((acc, i) => acc + i.subtotal, 0);
    if (!cliente || total === 0) return alert("Falta Cliente/Itens!");
    await addDoc(collection(db, "vendas"), { cliente: cliente.toUpperCase(), pagamento, total, data: new Date() });
    carrinho = []; renderizarCarrinho(); document.getElementById('identificacaoCliente').value = "";
};

// --- ATUALIZAÇÃO DO RELATÓRIO E LISTA COM BOTÃO RECEBER ---
onSnapshot(collection(db, "vendas"), (snap) => {
    let totais = { Pix: 0, Dinheiro: 0, Cartão: 0, Pendura: 0 };
    const listaPenduras = document.getElementById('lista-penduras');
    listaPenduras.innerHTML = "";

    snap.forEach(vDoc => {
        const v = vDoc.data();
        if (totais[v.pagamento] !== undefined) totais[v.pagamento] += v.total;
        if (v.pagamento === "Pendura") {
            listaPenduras.innerHTML += `
                <li style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
                    <span>${v.cliente}: R$ ${v.total.toFixed(2)}</span>
                    <button onclick="receberPagamento('${vDoc.id}', '${v.cliente}')" style="background:#3498db; padding:4px 8px; font-size:12px;">RECEBER</button>
                </li>`;
        }
    });

    document.getElementById('faturamento-pix').innerText = `R$ ${totais.Pix.toFixed(2)}`;
    document.getElementById('faturamento-dinheiro').innerText = `R$ ${totais.Dinheiro.toFixed(2)}`;
    document.getElementById('faturamento-cartao').innerText = `R$ ${totais.Cartão.toFixed(2)}`;
    document.getElementById('faturamento-pendura').innerText = `R$ ${totais.Pendura.toFixed(2)}`;
});

window.salvarProduto = async () => {
    const nome = document.getElementById('nomeProduto').value;
    const preco = document.getElementById('precoProduto').value;
    const codigo = document.getElementById('codigoBarra').value.trim();
    await addDoc(collection(db, "estoque"), { nome: nome.toUpperCase(), preco: parseFloat(preco), codigo, data: new Date() });
    alert("Salvo!");
};
