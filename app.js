import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

// FUNÇÃO PARA BUSCAR NA INTERNET
window.buscarProduto = async () => {
    const code = document.getElementById('codigoBarra').value.trim();
    const status = document.getElementById('status-busca');
    
    if (code.length < 8) return alert("Bipe um código válido!");

    status.innerText = "Buscando na Internet... 🔍";
    
    try {
        const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${code}.json`);
        const data = await res.json();
        
        if (data.status === 1) {
            document.getElementById('nomeProduto').value = data.product.product_name || "";
            document.getElementById('fotoProduto').value = data.product.image_url || "";
            status.innerText = "Encontrado! ✅";
        } else {
            status.innerText = "Não encontrado. Digite manual.";
        }
    } catch (e) {
        status.innerText = "Erro na busca.";
    }
};

// SALVAR NO FIREBASE
window.salvarProduto = async () => {
    const codigo = document.getElementById('codigoBarra').value;
    const nome = document.getElementById('nomeProduto').value;
    const custo = document.getElementById('custoProduto').value;
    const preco = document.getElementById('precoProduto').value;
    const categoria = document.getElementById('categoriaProduto').value;
    const foto = document.getElementById('fotoProduto').value;

    if (!nome || !preco) return alert("Nome e Preço são obrigatórios!");

    try {
        await addDoc(collection(db, "estoque"), {
            codigo: codigo || "S/C",
            nome: nome.toUpperCase(),
            custo: parseFloat(custo) || 0,
            preco: parseFloat(preco) || 0,
            categoria: categoria,
            foto: foto || "https://via.placeholder.com/150?text=Boteco+934",
            data: new Date()
        });
        
        // Limpar campos
        ['codigoBarra', 'nomeProduto', 'custoProduto', 'precoProduto', 'fotoProduto'].forEach(id => {
            document.getElementById(id).value = "";
        });
        document.getElementById('status-busca').innerText = "Salvo com sucesso!";
        document.getElementById('codigoBarra').focus();
        
    } catch (e) {
        alert("Erro ao salvar: " + e);
    }
};

// LISTAR PRODUTOS COM LUCRO E MARGEM
onSnapshot(query(collection(db, "estoque"), orderBy("data", "desc")), (snap) => {
    const grid = document.getElementById('grid-produtos');
    grid.innerHTML = "";
    
    snap.forEach(doc => {
        const p = doc.data();
        const lucro = p.preco - p.custo;
        const margem = p.preco > 0 ? (lucro / p.preco) * 100 : 0;

        grid.innerHTML += `
            <div class="card">
                <span class="tag">${p.categoria}</span>
                <img src="${p.foto}" class="img-produto" onerror="this.src='https://via.placeholder.com/150?text=Sem+Foto'">
                <h4>${p.nome}</h4>
                <span class="preco-venda">R$ ${p.preco.toFixed(2)}</span>
                <div class="info-lucro">
                    <span class="lucro-reais">Lucro: R$ ${lucro.toFixed(2)}</span>
                    <span class="margem-percent">Margem: ${margem.toFixed(1)}%</span>
                </div>
            </div>
        `;
    });
});
