import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

window.abrirModal = () => document.getElementById('modalCadastro').style.display = 'flex';
window.fecharModal = () => document.getElementById('modalCadastro').style.display = 'none';

window.toggleCategorias = () => {
    const lista = document.getElementById('lista-categorias');
    const seta = document.getElementById('seta-cortina');
    if (lista.style.display === "block") {
        lista.style.display = "none";
        seta.innerText = "▼";
    } else {
        lista.style.display = "block";
        seta.innerText = "▲";
    }
};

window.calcularCusto = () => {
    const preco = parseFloat(document.getElementById('calcPrecoCaixa').value) || 0;
    const qtd = parseFloat(document.getElementById('calcQtdCaixa').value) || 0;
    if (qtd > 0) document.getElementById('cadCustoUn').value = (preco / qtd).toFixed(2);
};

window.salvarNovoProduto = async () => {
    const p = {
        codigo: document.getElementById('cadCodigo').value,
        nome: document.getElementById('cadNome').value.toUpperCase(),
        foto: document.getElementById('cadFoto').value,
        custoUn: parseFloat(document.getElementById('cadCustoUn').value) || 0,
        precoVenda: parseFloat(document.getElementById('cadPreco').value) || 0
    };
    await addDoc(collection(db, "estoque"), p);
    alert("🚀 Produto salvo com sucesso!");
    fecharModal();
};

window.adicionarPorNome = async (nome) => {
    const q = query(collection(db, "estoque"), where("nome", "==", nome.toUpperCase()));
    const snap = await getDocs(q);
    if (!snap.empty) {
        const p = snap.docs[0].data();
        carrinho.push({ ...p });
        renderizar();
    } else {
        alert("Ops! Produto não cadastrado com este nome exato.");
    }
};

async function buscarPorCodigo(codigo) {
    const q = query(collection(db, "estoque"), where("codigo", "==", codigo));
    const snap = await getDocs(q);
    if (!snap.empty) {
        carrinho.push(snap.docs[0].data());
        renderizar();
    } else {
        alert("Código não encontrado!");
    }
}

function renderizar() {
    const corpo = document.getElementById('corpo-carrinho');
    corpo.innerHTML = carrinho.map(i => `
        <tr>
            <td><img src="${i.foto}" class="img-tabela" onerror="this.src='https://via.placeholder.com/45'"></td>
            <td>${i.nome}</td>
            <td style="text-align:center">1</td>
            <td style="text-align:right">R$ ${i.precoVenda.toFixed(2)}</td>
        </tr>
    `).join('');
    const total = carrinho.reduce((acc, obj) => acc + obj.precoVenda, 0);
    document.getElementById('total-venda-valor').innerText = total.toFixed(2);
}

document.getElementById('biparVenda').addEventListener('change', (e) => {
    buscarPorCodigo(e.target.value);
    e.target.value = "";
});

window.finalizarVenda = () => {
    if (carrinho.length === 0) return alert("Carrinho vazio!");
    window.print();
    carrinho = [];
    renderizar();
};
