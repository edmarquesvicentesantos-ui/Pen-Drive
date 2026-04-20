import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, where, getDocs, updateDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

// --- FUNÇÃO DE VENDA (BIPAR) ---
document.getElementById('biparVenda').addEventListener('change', async (e) => {
    const code = e.target.value.trim();
    if (!code) return;

    const q = query(collection(db, "estoque"), where("codigo", "==", code));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        const produtoDoc = querySnapshot.docs[0];
        const produto = produtoDoc.data();
        carrinho.push({ id: produtoDoc.id, ...produto });
        atualizarCarrinho();
    } else {
        alert("Produto não cadastrado!");
    }
    e.target.value = "";
    e.target.focus();
});

function atualizarCarrinho() {
    const lista = document.getElementById('lista-carrinho');
    const totalElt = document.getElementById('total-venda');
    lista.innerHTML = "";
    let total = 0;

    carrinho.forEach((item, index) => {
        total += item.preco;
        lista.innerHTML += `<div class="item-carrinho">${item.nome} - R$ ${item.preco.toFixed(2)}</div>`;
    });
    totalElt.innerText = `R$ ${total.toFixed(2)}`;
}

window.finalizarVenda = async () => {
    const metodo = document.getElementById('metodoPagamento').value;
    const cliente = document.getElementById('identificacaoCliente').value || "Consumidor";

    if (carrinho.length === 0) return alert("Carrinho vazio!");

    try {
        await addDoc(collection(db, "vendas"), {
            itens: carrinho,
            total: carrinho.reduce((acc, i) => acc + i.preco, 0),
            metodo: metodo,
            cliente: cliente,
            data: new Date()
        });

        alert(`Venda Finalizada! Cliente: ${cliente}`);
        carrinho = [];
        atualizarCarrinho();
        document.getElementById('identificacaoCliente').value = "";
    } catch (e) {
        alert("Erro ao salvar venda: " + e);
    }
};

// --- FUNÇÕES DE ESTOQUE (MANTER AS ANTERIORES) ---
window.salvarProduto = async () => {
    const nome = document.getElementById('nomeProduto').value;
    const preco = document.getElementById('precoProduto').value;
    const custo = document.getElementById('custoProduto').value;
    const codigo = document.getElementById('codigoBarra').value;

    await addDoc(collection(db, "estoque"), {
        nome: nome.toUpperCase(),
        preco: parseFloat(preco),
        custo: parseFloat(custo),
        codigo: codigo,
        data: new Date()
    });
    alert("Produto Cadastrado!");
};

onSnapshot(query(collection(db, "estoque"), orderBy("data", "desc")), (snap) => {
    const grid = document.getElementById('grid-produtos');
    grid.innerHTML = "";
    snap.forEach(doc => {
        const p = doc.data();
        const lucro = p.preco - p.custo;
        grid.innerHTML += `
            <div class="card">
                <h4>${p.nome}</h4>
                <span class="preco">R$ ${p.preco.toFixed(2)}</span>
                <small>Lucro: R$ ${lucro.toFixed(2)}</small>
            </div>`;
    });
});
