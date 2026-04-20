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

// --- BUSCAR PRODUTO ---
document.getElementById('biparVenda').addEventListener('change', async (e) => {
    const code = e.target.value.trim();
    if (!code) return;

    const q = query(collection(db, "estoque"), where("codigo", "==", code));
    const snap = await getDocs(q);

    if (!snap.empty) {
        const docRef = snap.docs[0];
        const p = docRef.data();
        const existente = carrinho.find(i => i.codigo === code);
        
        if (existente) {
            existente.qtd += 1;
            existente.subtotal = existente.qtd * p.precoVenda;
        } else {
            carrinho.push({ 
                nome: p.nome, preco: p.precoVenda, codigo: code, 
                qtd: 1, subtotal: p.precoVenda, idBanco: docRef.id 
            });
        }
        renderizarCarrinho();
    } else { alert("Produto não encontrado!"); }
    e.target.value = ""; e.target.focus();
});

function renderizarCarrinho() {
    const lista = document.getElementById('lista-carrinho');
    lista.innerHTML = carrinho.map(item => `
        <div class="item-carrinho">
            <span>${item.qtd}x ${item.nome}</span>
            <span>R$ ${item.subtotal.toFixed(2)}</span>
        </div>`).join('');
    document.getElementById('total-venda-valor').innerText = `R$ ${carrinho.reduce((acc, i) => acc + i.subtotal, 0).toFixed(2)}`;
}

// --- FINALIZAR E BAIXAR ESTOQUE ---
window.finalizarVenda = async () => {
    const cliente = document.getElementById('identificacaoCliente').value;
    const pagamento = document.getElementById('metodoPagamento').value;
    const total = carrinho.reduce((acc, i) => acc + i.subtotal, 0);

    if (!cliente || total === 0) return alert("Preencha o cliente e adicione itens!");

    try {
        for (const item of carrinho) {
            const ref = doc(db, "estoque", item.idBanco);
            const snap = await getDoc(ref);
            if (snap.exists()) {
                await updateDoc(ref, { estoqueAtual: snap.data().estoqueAtual - item.qtd });
            }
        }
        await addDoc(collection(db, "vendas"), {
            cliente: cliente.toUpperCase(), pagamento, total, itens: carrinho, data: new Date()
        });
        alert("Venda realizada! 🍻");
        carrinho = []; renderizarCarrinho();
        document.getElementById('identificacaoCliente').value = "";
    } catch (e) { alert("Erro: " + e.message); }
};

// --- RELATÓRIOS E INVENTÁRIO ---
onSnapshot(collection(db, "vendas"), (snap) => {
    let totais = { Pix: 0, Dinheiro: 0, Cartão: 0, Pendura: 0 };
    const listaPenduras = document.getElementById('lista-penduras');
    listaPenduras.innerHTML = "";
    snap.forEach(doc => {
        const v = doc.data();
        if (totais[v.pagamento] !== undefined) totais[v.pagamento] += v.total;
        if (v.pagamento === "Pendura") {
            listaPenduras.innerHTML += `<li>${v.cliente}: R$ ${v.total.toFixed(2)}</li>`;
        }
    });
    document.getElementById('faturamento-pix').innerText = `R$ ${totais.Pix.toFixed(2)}`;
    document.getElementById('faturamento-dinheiro').innerText = `R$ ${totais.Dinheiro.toFixed(2)}`;
    document.getElementById('faturamento-cartao').innerText = `R$ ${totais.Cartão.toFixed(2)}`;
    document.getElementById('faturamento-pendura').innerText = `R$ ${totais.Pendura.toFixed(2)}`;
});

onSnapshot(collection(db, "estoque"), (snap) => {
    const grid = document.getElementById('grid-estoque');
    grid.innerHTML = "";
    snap.forEach(doc => {
        const p = doc.data();
        const porcentagem = (p.estoqueAtual / p.rendimento) * 100;
        grid.innerHTML += `
            <div class="card-estoque">
                <div class="info-estoque"><span>${p.nome}</span><span>${p.estoqueAtual} doses</span></div>
                <div class="barra-fora"><div class="barra-dentro" style="width:${porcentagem}%; background:${porcentagem < 20 ? '#ff5e5e' : '#1fcc7d'}"></div></div>
            </div>`;
    });
});

window.salvarProduto = async () => {
    const nome = document.getElementById('nomeProduto').value.toUpperCase();
    const precoVenda = parseFloat(document.getElementById('precoProduto').value);
    const custoGarrafa = parseFloat(document.getElementById('custoProduto').value);
    const rendimento = parseInt(document.getElementById('qtdDoses').value) || 1;
    const codigo = document.getElementById('codigoBarra').value.trim();
    await addDoc(collection(db, "estoque"), {
        nome, precoVenda, custoGarrafa, rendimento, estoqueAtual: rendimento, codigo, data: new Date()
    });
    alert("Cadastrado com sucesso!");
};
