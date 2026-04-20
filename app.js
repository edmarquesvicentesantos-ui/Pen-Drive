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

// SALVAR PRODUTO
window.salvarProduto = async () => {
    const nome = document.getElementById('nomeProduto').value;
    const preco = document.getElementById('precoProduto').value;
    const custo = document.getElementById('custoProduto').value;
    const codigo = document.getElementById('codigoBarra').value.trim();

    if (!nome || !preco || !codigo) return alert("Preencha todos os campos!");

    try {
        await addDoc(collection(db, "estoque"), {
            nome: nome.toUpperCase(),
            preco: parseFloat(preco),
            custo: parseFloat(custo) || 0,
            codigo: codigo,
            data: new Date()
        });
        alert("Cadastrado com sucesso! ✅");
        document.getElementById('codigoBarra').value = "";
        document.getElementById('nomeProduto').value = "";
    } catch (e) { alert("Erro ao salvar: " + e); }
};

// BUSCAR E VENDER
document.getElementById('biparVenda').addEventListener('change', async (e) => {
    const code = e.target.value.trim();
    if (!code) return;

    console.log("Buscando código:", code); // Isso ajuda a ver o que o leitor enviou

    try {
        const q = query(collection(db, "estoque"), where("codigo", "==", code));
        const snap = await getDocs(q);

        if (!snap.empty) {
            const p = snap.docs[0].data();
            const itemExistente = carrinho.find(item => item.codigo === code);
            
            if (itemExistente) {
                itemExistente.qtd += 1;
                itemExistente.subtotal = itemExistente.qtd * itemExistente.preco;
            } else {
                carrinho.push({ nome: p.nome, preco: p.preco, codigo: code, qtd: 1, subtotal: p.preco });
            }
            renderizarCarrinho();
        } else {
            alert("Produto não encontrado no estoque! Código lido: " + code);
        }
    } catch (error) {
        alert("Erro na busca: " + error.message);
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

window.finalizarVenda = async () => {
    const cliente = document.getElementById('identificacaoCliente').value;
    const pagamento = document.getElementById('metodoPagamento').value;
    if (!cliente || carrinho.length === 0) return alert("Carrinho vazio ou sem nome de cliente!");

    try {
        await addDoc(collection(db, "vendas"), {
            cliente, pagamento, total: carrinho.reduce((acc, i) => acc + i.subtotal, 0), itens: carrinho, data: new Date()
        });
        alert("Venda Finalizada! 🍻");
        carrinho = [];
        renderizarCarrinho();
        document.getElementById('identificacaoCliente').value = "";
    } catch (e) { alert("Erro: " + e); }
};
