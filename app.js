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

// Seleção de Pagamento
window.definirPag = (metodo) => {
    document.getElementById('metodoPagamento').value = metodo;
    document.querySelectorAll('.btn-pag').forEach(b => b.classList.remove('ativo'));
    event.target.classList.add('ativo');
};

// Bipar Produto
document.getElementById('biparVenda').addEventListener('change', async (e) => {
    const code = e.target.value.trim();
    if (!code) return;

    const q = query(collection(db, "estoque"), where("codigo", "==", code));
    const snap = await getDocs(q);

    if (!snap.empty) {
        const d = snap.docs[0];
        const p = d.data();
        const ex = carrinho.find(i => i.codigo === code);
        
        if (ex) {
            ex.qtd++;
            ex.subtotal = ex.qtd * p.precoVenda;
        } else {
            carrinho.push({ nome: p.nome, preco: p.precoVenda, codigo: code, qtd: 1, subtotal: p.precoVenda, idBanco: d.id });
        }
        renderizar();
    } else { alert("Produto não encontrado!"); }
    e.target.value = ""; e.target.focus();
});

function renderizar() {
    const corpo = document.getElementById('corpo-carrinho');
    corpo.innerHTML = carrinho.map(i => `
        <tr>
            <td>${i.qtd}x</td>
            <td style="font-weight: bold;">${i.nome}</td>
            <td>R$ ${i.preco.toFixed(2)}</td>
            <td style="text-align: right;">R$ ${i.subtotal.toFixed(2)}</td>
        </tr>
    `).join('');
    document.getElementById('total-venda-valor').innerText = carrinho.reduce((a, b) => a + b.subtotal, 0).toFixed(2);
}

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
    
    await addDoc(collection(db, "vendas"), { cliente, pagamento: pag, total, itens: carrinho, data: new Date() });
    
    alert(`VENDA CONCLUÍDA!\nCliente: ${cliente}\nTotal: R$ ${total.toFixed(2)}`);
    carrinho = []; renderizar();
    document.getElementById('identificacaoCliente').value = "";
};

// Monitor Financeiro
onSnapshot(collection(db, "vendas"), (s) => {
    let t = { Pix: 0, Dinheiro: 0 };
    s.forEach(d => { if (t[d.data().pagamento] !== undefined) t[d.data().pagamento] += d.data().total; });
    document.getElementById('faturamento-pix').innerText = t.Pix.toFixed(2);
    document.getElementById('faturamento-dinheiro').innerText = t.Dinheiro.toFixed(2);
});
