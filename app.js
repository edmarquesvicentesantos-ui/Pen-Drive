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
        custoUn: parseFloat(document.getElementById('cadCustoUn').value),
        precoVenda: parseFloat(document.getElementById('cadPreco').value)
    };
    await addDoc(collection(db, "estoque"), p);
    alert("Produto Salvo!");
    fecharModal();
};

async function adicionarAoCarrinho(codigo) {
    const q = query(collection(db, "estoque"), where("codigo", "==", codigo));
    const snap = await getDocs(q);
    if (!snap.empty) {
        const p = snap.docs[0].data();
        carrinho.push({ ...p, subtotal: p.precoVenda });
        renderizar();
    } else {
        alert("Produto não cadastrado!");
    }
}

function renderizar() {
    const corpo = document.getElementById('corpo-carrinho');
    corpo.innerHTML = carrinho.map(i => `
        <tr>
            <td><img src="${i.foto}" class="img-tabela"></td>
            <td>${i.nome}</td>
            <td>1x</td>
            <td style="text-align:right">R$ ${i.precoVenda.toFixed(2)}</td>
        </tr>
    `).join('');
    const total = carrinho.reduce((acc, obj) => acc + obj.precoVenda, 0);
    document.getElementById('total-venda-valor').innerText = total.toFixed(2);
}

document.getElementById('biparVenda').addEventListener('change', (e) => {
    adicionarAoCarrinho(e.target.value);
    e.target.value = "";
});

window.finalizarVenda = () => {
    if (carrinho.length > 0) {
        window.print();
        carrinho = [];
        renderizar();
        alert("Venda Concluída!");
    }
};
