import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, where, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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
let contaAtual = [];

// BUSCAR PRODUTO E ADICIONAR NA CONTA DA MESA
document.getElementById('biparVenda').addEventListener('change', async (e) => {
    const code = e.target.value.trim();
    if (!code) return;

    const q = query(collection(db, "estoque"), where("codigo", "==", code));
    const snap = await getDocs(q);

    if (!snap.empty) {
        const p = snap.docs[0].data();
        contaAtual.push(p);
        renderizarCarrinho();
    } else { alert("Produto não cadastrado!"); }
    e.target.value = ""; 
});

function renderizarCarrinho() {
    const lista = document.getElementById('lista-carrinho');
    lista.innerHTML = contaAtual.map(i => `<div class="item"><span>${i.nome}</span> <span>R$ ${i.preco.toFixed(2)}</span></div>`).join('');
}

// FINALIZAR E SALVAR NO CAIXA
window.finalizarVenda = async () => {
    const cliente = document.getElementById('identificacaoCliente').value;
    const pagamento = document.getElementById('metodoPagamento').value;
    const total = contaAtual.reduce((acc, i) => acc + i.preco, 0);

    if (!cliente || total === 0) return alert("Identifique a mesa e adicione itens!");

    await addDoc(collection(db, "vendas"), {
        cliente, pagamento, total, data: new Date(), itens: contaAtual
    });

    alert(`Conta da ${cliente} fechada: R$ ${total.toFixed(2)}`);
    contaAtual = [];
    renderizarCarrinho();
    document.getElementById('identificacaoCliente').value = "";
};

// ATUALIZAR RESUMO DO CAIXA DO DIA
onSnapshot(collection(db, "vendas"), (snap) => {
    let totalDia = 0;
    snap.forEach(doc => totalDia += doc.data().total);
    document.getElementById('total-caixa-dia').innerText = `R$ ${totalDia.toFixed(2)}`;
});
