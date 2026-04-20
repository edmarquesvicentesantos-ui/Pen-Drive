7891149010509
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

// --- FUNÇÃO PARA CADASTRAR PRODUTO NO BANCO ---
window.salvarProduto = async () => {
    const nome = document.getElementById('nomeProduto').value;
    const preco = document.getElementById('precoProduto').value;
    const custo = document.getElementById('custoProduto').value;
    const codigo = document.getElementById('codigoBarra').value;

    if (!nome || !preco || !codigo) return alert("Preencha Nome, Preço e Código!");

    try {
        await addDoc(collection(db, "estoque"), {
            nome: nome.toUpperCase(),
            preco: parseFloat(preco),
            custo: parseFloat(custo) || 0,
            codigo: codigo.trim(),
            data: new Date()
        });
        alert("Produto salvo no estoque! ✅");
        // Limpa os campos
        document.getElementById('nomeProduto').value = "";
        document.getElementById('precoProduto').value = "";
        document.getElementById('custoProduto').value = "";
        document.getElementById('codigoBarra').value = "";
    } catch (e) {
        alert("Erro ao salvar: " + e);
    }
};

// --- FUNÇÃO PARA BIPAR E VENDER (BUSCA NO MESMO BANCO) ---
document.getElementById('biparVenda').addEventListener('change', async (e) => {
    const code = e.target.value.trim();
    if (!code) return;

    // Procura na coleção "estoque" pelo código bipado
    const q = query(collection(db, "estoque"), where("codigo", "==", code));
    const snap = await getDocs(q);

    if (!snap.empty) {
        const p = snap.docs[0].data();
        
        // Se o produto já estiver no carrinho, apenas aumenta a quantidade
        const itemExistente = carrinho.find(item => item.codigo === code);
        
        if (itemExistente) {
            itemExistente.qtd += 1;
            itemExistente.subtotal = itemExistente.qtd * itemExistente.preco;
        } else {
            carrinho.push({ 
                nome: p.nome, 
                preco: p.preco, 
                codigo: code, 
                qtd: 1, 
                subtotal: p.preco 
            });
        }
        renderizarCarrinho();
    } else { 
        alert("Produto não encontrado! Verifique se cadastrou com este código: " + code); 
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
        lista.innerHTML += `
            <div class="item-carrinho">
                <span>${item.qtd}x ${item.nome}</span>
                <span>R$ ${item.subtotal.toFixed(2)}</span>
            </div>`;
    });
    totalElt.innerText = `R$ ${totalGeral.toFixed(2)}`;
}

window.finalizarVenda = async () => {
    const cliente = document.getElementById('identificacaoCliente').value;
    const pagamento = document.getElementById('metodoPagamento').value;
    const total = carrinho.reduce((acc, i) => acc + i.subtotal, 0);

    if (!cliente || total === 0) return alert("Identifique a mesa/cliente e adicione produtos!");

    try {
        await addDoc(collection(db, "vendas"), {
            cliente, 
            pagamento, 
            total, 
            itens: carrinho, 
            data: new Date()
        });
        alert("Venda finalizada com sucesso!");
        carrinho = [];
        renderizarCarrinho();
        document.getElementById('identificacaoCliente').value = "";
    } catch (e) { alert("Erro ao fechar venda: " + e); }
};

// MOSTRAR PRODUTOS CADASTRADOS (Opcional, para conferência)
onSnapshot(query(collection(db, "estoque"), orderBy("data", "desc")), (snap) => {
    const grid = document.getElementById('grid-produtos');
    if(grid) {
        grid.innerHTML = "";
        snap.forEach(doc => {
            const p = doc.data();
            grid.innerHTML += `<div class="card"><h4>${p.nome}</h4><p>R$ ${p.preco.toFixed(2)}</p></div>`;
        });
    }
});
