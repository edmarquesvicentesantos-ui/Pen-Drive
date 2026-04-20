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

// --- FUNÇÃO PARA GERAR MENSAGEM WHATSAPP ---
function enviarWhatsApp(cliente, itens, total, tipo) {
    let mensagem = `*Boteco 934 - Recibo*%0A`;
    mensagem += `Cliente: ${cliente}%0A`;
    mensagem += `--------------------------%0A`;
    
    itens.forEach(item => {
        mensagem += `${item.qtd}x ${item.nome} - R$ ${item.subtotal.toFixed(2)}%0A`;
    });

    mensagem += `--------------------------%0A`;
    mensagem += `*Total: R$ ${total.toFixed(2)}*%0A`;
    mensagem += `Pagamento: ${tipo}%0A`;
    mensagem += `%0AObrigado pela preferência! 🍻`;

    window.open(`https://wa.me/?text=${mensagem}`, '_blank');
}

// --- FINALIZAR VENDA E ENVIAR ---
window.finalizarVenda = async () => {
    const cliente = document.getElementById('identificacaoCliente').value;
    const pagamento = document.getElementById('metodoPagamento').value;
    const total = carrinho.reduce((acc, i) => acc + i.subtotal, 0);

    if (!cliente || total === 0) return alert("Falta o Cliente ou Itens!");

    try {
        const dadosVenda = {
            cliente: cliente.toUpperCase(),
            pagamento,
            total,
            itens: carrinho,
            data: new Date()
        };

        await addDoc(collection(db, "vendas"), dadosVenda);
        
        // Pergunta se quer enviar o comprovante
        if (confirm("Venda salva! Deseja enviar o comprovante por WhatsApp?")) {
            enviarWhatsApp(dadosVenda.cliente, dadosVenda.itens, dadosVenda.total, dadosVenda.pagamento);
        }

        carrinho = [];
        renderizarCarrinho();
        document.getElementById('identificacaoCliente').value = "";
    } catch (e) { alert("Erro ao fechar venda: " + e.message); }
};

// --- O RESTANTE DO CÓDIGO (BIPAR E RELATÓRIOS) SEGUE IGUAL ---
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

onSnapshot(collection(db, "vendas"), (snap) => {
    let totais = { Pix: 0, Dinheiro: 0, Cartão: 0, Pendura: 0 };
    const listaPenduras = document.getElementById('lista-penduras');
    listaPenduras.innerHTML = "";
    snap.forEach(vDoc => {
        const v = vDoc.data();
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

window.salvarProduto = async () => {
    const nome = document.getElementById('nomeProduto').value;
    const preco = document.getElementById('precoProduto').value;
    const codigo = document.getElementById('codigoBarra').value.trim();
    await addDoc(collection(db, "estoque"), { nome: nome.toUpperCase(), preco: parseFloat(preco), codigo, data: new Date() });
    alert("Salvo!");
};
