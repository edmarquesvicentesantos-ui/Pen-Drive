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

// --- FUNÇÕES DE INTERFACE (AGORA LIGADAS AO WINDOW PARA O BOTÃO FUNCIONAR) ---

window.abrirModal = () => {
    console.log("Abrindo modal...");
    document.getElementById('modalCadastro').style.display = 'flex';
};

window.fecharModal = () => {
    document.getElementById('modalCadastro').style.display = 'none';
};

window.calcular = () => {
    const p = parseFloat(document.getElementById('calcPreco').value) || 0;
    const q = parseFloat(document.getElementById('calcQtd').value) || 0;
    if(q > 0) {
        document.getElementById('cadCustoUn').value = (p/q).toFixed(2);
    }
};

window.salvarNovoProduto = async () => {
    const prod = {
        codigo: document.getElementById('cadCodigo').value,
        nome: document.getElementById('cadNome').value.toUpperCase(),
        foto: document.getElementById('cadFoto').value,
        categoria: document.getElementById('cadCategoria').value,
        custoUn: parseFloat(document.getElementById('cadCustoUn').value) || 0,
        precoVenda: parseFloat(document.getElementById('cadPreco').value) || 0
    };
    try {
        await addDoc(collection(db, "estoque"), prod);
        alert("✅ Produto salvo no Boteco 934!");
        window.fecharModal();
        window.carregar('TUDO');
    } catch (e) {
        alert("Erro ao salvar: " + e);
    }
};

window.carregar = async (cat) => {
    const vitrine = document.getElementById('vitrine-produtos');
    const snap = await getDocs(collection(db, "estoque"));
    vitrine.innerHTML = "";
    snap.forEach(doc => {
        const p = doc.data();
        if(cat === 'TUDO' || p.categoria === cat) {
            vitrine.innerHTML += `
                <div class="card-vitrine" onclick="window.add('${p.codigo}')">
                    <img src="${p.foto}" class="img-vitrine" onerror="this.src='https://via.placeholder.com/60'">
                    <div style="font-size:9px; color:#fff; font-weight:bold">${p.nome}</div>
                    <div style="font-size:10px; color:#1fcc7d">R$ ${p.precoVenda.toFixed(2)}</div>
                </div>`;
        }
    });
};

window.filtrar = (cat, btn) => {
    document.querySelectorAll('.aba-filtro').forEach(b => b.classList.remove('ativa'));
    btn.classList.add('ativa');
    window.carregar(cat);
};

window.add = async (cod) => {
    const q = query(collection(db, "estoque"), where("codigo", "==", cod));
    const snap = await getDocs(q);
    if(!snap.empty) {
        carrinho.push(snap.docs[0].data());
        render();
    } else {
        console.log("Produto não encontrado: " + cod);
    }
};

function render() {
    const corpo = document.getElementById('corpo-carrinho');
    corpo.innerHTML = carrinho.map(i => `
        <tr>
            <td><img src="${i.foto}" class="img-tabela"></td>
            <td>${i.nome}</td>
            <td align="center">1</td>
            <td align="right">R$ ${i.precoVenda.toFixed(2)}</td>
        </tr>
    `).join('');
    const total = carrinho.reduce((a, b) => a + b.precoVenda, 0);
    document.getElementById('total-venda-valor').innerText = total.toFixed(2);
}

document.getElementById('biparVenda').addEventListener('change', (e) => { 
    window.add(e.target.value); 
    e.target.value = ""; 
});

window.finalizarVenda = () => {
    if(carrinho.length === 0) return alert("Carrinho vazio!");
    window.print();
    carrinho = [];
    render();
};

// Carregar catálogo ao abrir
window.onload = () => window.carregar('TUDO');
