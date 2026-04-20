import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, where, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

// --- BUSCA PRODUTO E SOMA NO CARRINHO ---
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
    } else {
        alert("Produto não encontrado: " + code);
    }
    e.target.value = "";
    e.target.focus();
});

function renderizarCarrinho() {
    const lista = document.getElementById('lista-carrinho');
    const totalElt = document.getElementById('total-venda-valor');
    lista.innerHTML = "";
    let totalGeral = 0;

    carrinho.forEach((item) => {
        totalGeral += item.subtotal;
        lista.innerHTML += `<div class="item-carrinho"><span>${item.qtd}x ${item.nome}</span> <span>R$ ${item.subtotal.toFixed(2)}</span></div>`;
    });
    totalElt.innerText = `R$ ${totalGeral.toFixed(2)}`;
}

// --- FINALIZAR VENDA ---
window.finalizarVenda = async () => {
    const cliente = document.getElementById('identificacaoCliente').value;
    const pagamento = document.getElementById('metodoPagamento').value;
    const total = carrinho.reduce((acc, i) => acc + i.subtotal, 0);

    if (!cliente || carrinho.length === 0) return alert("Falta o Cliente ou Itens!");

    try {
        await addDoc(collection(db, "vendas"), {
            cliente: cliente.toUpperCase(),
            pagamento,
            total,
            itens: carrinho,
            data: new Date()
        });
        
        alert("Venda Registrada! 🍻");
        carrinho = [];
        renderizarCarrinho();
        document.getElementById('identificacaoCliente').value = "";
    } catch (e) { alert("Erro ao fechar: " + e.message); }
};

// --- RELATÓRIO EM TEMPO REAL ---
onSnapshot(collection(db, "vendas"), (snap) => {
    let totais = { Pix: 0, Dinheiro: 0, Cartão: 0, Pendura: 0 };
    let pendurasHTML = "";

    snap.forEach(doc => {
        const v = doc.data();
        if (totais[v.pagamento] !== undefined) {
            totais[v.pagamento] += v.total;
        }
        
        if (v.pagamento === "Pendura") {
            pendurasHTML += `<li>${v.cliente}: R$ ${v.total.toFixed(2)}</li>`;
        }
    });

    // Atualize seu HTML com esses valores se você criar os campos abaixo
    console.log("Totais do Dia:", totais);
});

// CADASTRO (Mantenha o que já funciona)
window.salvarProduto = async () => {
    const nome = document.getElementById('nomeProduto').value;
    const preco = document.getElementById('precoProduto').value;
    const custo = document.getElementById('custoProduto').value;
    const codigo = document.getElementById('codigoBarra').value.trim();
    await addDoc(collection(db, "estoque"), {
        nome: nome.toUpperCase(), preco: parseFloat(preco), custo: parseFloat(custo), codigo, data: new Date()
    });
    alert("Produto Salvo!");
};
