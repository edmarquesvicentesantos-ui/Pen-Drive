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

// MODAL E ABAS (CORRIGIDO)
window.abrirModal = () => { document.getElementById('modalCadastro').style.display = 'flex'; };
window.fecharModal = () => { document.getElementById('modalCadastro').style.display = 'none'; };

window.mudarAba = (aba) => {
    document.querySelectorAll('.aba-conteudo').forEach(a => a.style.display = 'none');
    document.querySelectorAll('.aba-btn').forEach(b => b.classList.remove('ativa'));
    if(aba === 'produtos') {
        document.getElementById('aba-produtos').style.display = 'block';
        document.getElementById('btn-aba-prod').classList.add('ativa');
    } else {
        document.getElementById('aba-contas').style.display = 'block';
        document.getElementById('btn-aba-fin').classList.add('ativa');
        atualizarResumoFinanceiro();
    }
};

// CARRINHO E VENDAS
async function adicionar(valor, porNome = false) {
    const q = porNome ? query(collection(db, "estoque"), where("nome", "==", valor)) : query(collection(db, "estoque"), where("codigo", "==", valor));
    const snap = await getDocs(q);
    if (!snap.empty) {
        const d = snap.docs[0]; const p = d.data();
        const ex = carrinho.find(i => i.idBanco === d.id);
        if (ex) { ex.qtd++; ex.subtotal = ex.qtd * Number(p.precoVenda); }
        else { carrinho.push({ nome: p.nome, preco: Number(p.precoVenda), custoUn: Number(p.custoUn || 0), foto: p.foto || '', qtd: 1, subtotal: Number(p.precoVenda), idBanco: d.id }); }
        renderizar();
    } else {
        if(!porNome) {
            if(confirm("Produto não encontrado. Buscar no Google?")) {
                window.open(`https://www.google.com.br/search?q=${valor}&tbm=isch`, '_blank');
                abrirModal();
                document.getElementById('cadCodigo').value = valor;
            }
        }
    }
}

function renderizar() {
    document.getElementById('corpo-carrinho').innerHTML = carrinho.map(i => `
        <tr>
            <td><img src="${i.foto}" class="img-tabela" onerror="this.src='https://via.placeholder.com/40'"></td>
            <td>${i.nome}</td>
            <td>${i.qtd}x</td>
            <td style="text-align:right">R$ ${i.subtotal.toFixed(2)}</td>
        </tr>`).join('');
    document.getElementById('total-venda-valor').innerText = carrinho.reduce((a, b) => a + b.subtotal, 0).toFixed(2);
    document.getElementById('data-cupom').innerText = new Date().toLocaleString();
}

window.adicionarPorNome = (n) => adicionar(n, true);
document.getElementById('biparVenda').addEventListener('change', (e) => { adicionar(e.target.value.trim()); e.target.value = ""; e.target.focus(); });

window.finalizarVenda = async () => {
    if (carrinho.length === 0) return;
    const totalVenda = carrinho.reduce((a, b) => a + b.subtotal, 0);
    const custoTotalVenda = carrinho.reduce((a, b) => a + (b.custoUn * b.qtd), 0);
    const cliente = document.getElementById('identificacaoCliente').value.toUpperCase() || "CONSUMIDOR";
    const pag = document.getElementById('metodoPagamento').value;

    for (const item of carrinho) {
        const ref = doc(db, "estoque", item.idBanco);
        const s = await getDoc(ref);
        if (s.exists()) await updateDoc(ref, { estoqueAtual: Number(s.data().estoqueAtual) - item.qtd });
    }

    await addDoc(collection(db, "vendas"), { cliente, pagamento: pag, total: totalVenda, custoTotal: custoTotalVenda, data: new Date() });
    window.print();
    carrinho = []; renderizar();
    document.getElementById('identificacaoCliente').value = "";
};

// ESTOQUE E FINANCEIRO
window.salvarNovoProduto = async () => {
    const p = {
        codigo: document.getElementById('cadCodigo').value,
        nome: document.getElementById('cadNome').value.toUpperCase(),
        foto: document.getElementById('cadFoto').value,
        custoUn: parseFloat(document.getElementById('cadCustoUn').value) || 0,
        precoVenda: parseFloat(document.getElementById('cadPreco').value) || 0,
        estoqueAtual: parseInt(document.getElementById('cadEstoque').value) || 0
    };
    await addDoc(collection(db, "estoque"), p);
    alert("Salvo!");
    fecharModal();
};

window.salvarFinanceiro = async () => {
    const desc = document.getElementById('finDescricao').value.toUpperCase();
    const valor = parseFloat(document.getElementById('finValor').value);
    if (!desc || isNaN(valor)) return;
    await addDoc(collection(db, "financeiro"), { descricao: desc, valor, tipo: "Saída", data: new Date() });
    alert("Despesa salva!");
    atualizarResumoFinanceiro();
};

async function atualizarResumoFinanceiro() {
    const hoje = new Date().setHours(0,0,0,0);
    const snapV = await getDocs(collection(db, "vendas"));
    let fat = 0; let custo = 0;
    snapV.forEach(d => { if(d.data().data.toDate() >= hoje) { fat += d.data().total; custo += (d.data().custoTotal || 0); } });
    const snapF = await getDocs(collection(db, "financeiro"));
    let desp = 0;
    snapF.forEach(d => { if(d.data().data.toDate() >= hoje) desp += d.data().valor; });
    document.getElementById('resumo-vendas').innerText = `R$ ${fat.toFixed(2)}`;
    document.getElementById('resumo-custo-total').innerText = `R$ ${custo.toFixed(2)}`;
    document.getElementById('resumo-despesas').innerText = `R$ ${desp.toFixed(2)}`;
    document.getElementById('resumo-saldo').innerText = `R$ ${(fat - custo - desp).toFixed(2)}`;
}

onSnapshot(collection(db, "estoque"), (s) => {
    const lista = document.getElementById('lista-reposicao'); lista.innerHTML = "";
    s.forEach(d => { if (Number(d.data().estoqueAtual) <= 5) lista.innerHTML += `<div>${d.data().nome} (${d.data().estoqueAtual})</div>`; });
});

window.exportarEstoque = async () => {
    const snap = await getDocs(collection(db, "estoque"));
    const dados = []; snap.forEach(doc => dados.push(doc.data()));
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([JSON.stringify(dados, null, 2)], {type:"application/json"})); a.download=`backup_boteco.json`; a.click();
};
