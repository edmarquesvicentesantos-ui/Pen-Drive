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

// FUNÇÃO PARA SALVAR (CADASTRO)
window.salvarProduto = async () => {
    const nome = document.getElementById('nomeProduto').value;
    const preco = document.getElementById('precoProduto').value;
    const custo = document.getElementById('custoProduto').value;
    const codigo = document.getElementById('codigoBarra').value.trim();

    if (!nome || !preco || !codigo) {
        alert("Erro: Preencha Nome, Preço e Código!");
        return;
    }

    try {
        await addDoc(collection(db, "estoque"), {
            nome: nome.toUpperCase(),
            preco: parseFloat(preco),
            custo: parseFloat(custo) || 0,
            codigo: codigo,
            data: new Date()
        });
        alert("Cadastrado com sucesso! ✅");
        // Limpa campos e volta o foco
        document.getElementById('nomeProduto').value = "";
        document.getElementById('precoProduto').value = "";
        document.getElementById('custoProduto').value = "";
        document.getElementById('codigoBarra').value = "";
        document.getElementById('codigoBarra').focus();
    } catch (e) {
        console.error(e);
        alert("Erro no Firebase: " + e.message);
    }
};

// FUNÇÃO PARA VENDER (BIPAR)
const inputVenda = document.getElementById('biparVenda');
if (inputVenda) {
    inputVenda.addEventListener('change', async (e) => {
        const code = e.target.value.trim();
        if (!code) return;

        try {
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
            } else {
                alert("Produto não encontrado: " + code);
            }
        } catch (err) {
            alert("Erro na busca: " + err.message);
        }
        e.target.value = "";
        e.target.focus();
    });
}

function renderizarCarrinho() {
    const lista = document.getElementById('lista-carrinho');
    const totalElt = document.getElementById('total-venda-valor');
    if (!lista) return;
    
    lista.innerHTML = "";
    let totalGeral = 0;

    carrinho.forEach((item) => {
        totalGeral += item.subtotal;
        lista.innerHTML += `<div class="item-carrinho" style="color:white; border-bottom:1px solid #333; padding:5px;">
            <span>${item.qtd}x ${item.nome}</span> 
            <span>R$ ${item.subtotal.toFixed(2)}</span>
        </div>`;
    });
    if (totalElt) totalElt.innerText = `R$ ${totalGeral.toFixed(2)}`;
}

window.finalizarVenda = async () => {
    const cliente = document.getElementById('identificacaoCliente').value;
    const pagamento = document.getElementById('metodoPagamento').value;
    
    if (!cliente || carrinho.length === 0) {
        alert("Falta o Nome do Cliente ou o Carrinho está vazio!");
        return;
    }

    try {
        await addDoc(collection(db, "vendas"), {
            cliente: cliente,
            pagamento: pagamento,
            total: carrinho.reduce((acc, i) => acc + i.subtotal, 0),
            itens: carrinho,
            data: new Date()
        });
        alert("Venda Finalizada com Sucesso! 🍻");
        carrinho = [];
        renderizarCarrinho();
        document.getElementById('identificacaoCliente').value = "";
    } catch (e) {
        alert("Erro ao fechar venda: " + e.message);
    }
};
