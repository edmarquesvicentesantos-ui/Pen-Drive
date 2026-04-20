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

// BUSCA AUTOMÁTICA NA INTERNET AO BIPAR
document.getElementById('codigoBarra').addEventListener('change', async (e) => {
    const code = e.target.value;
    if (code.length > 8) {
        document.getElementById('status-busca').innerText = "Buscando na Internet... 🔍";
        try {
            const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${code}.json`);
            const data = await res.json();
            if (data.status === 1) {
                document.getElementById('nomeProduto').value = data.product.product_name || "";
                document.getElementById('fotoProduto').value = data.product.image_url || "";
                document.getElementById('status-busca').innerText = "Encontrado! ✅";
            } else {
                document.getElementById('status-busca').innerText = "Não encontrado. Digite manual.";
            }
        } catch (err) {
            document.getElementById('status-busca').innerText = "Erro na busca.";
        }
    }
});

window.salvarProduto = async () => {
    const campos = ['codigoBarra', 'nomeProduto', 'custoProduto', 'precoProduto', 'categoriaProduto', 'fotoProduto'];
    const dados = {};
    campos.forEach(c => dados[c] = document.getElementById(c).value);

    if (!dados.nomeProduto || !dados.precoProduto) return alert("Nome e Preço são obrigatórios!");

    try {
        await addDoc(collection(db, "estoque"), {
            codigo: dados.codigoBarra,
            nome: dados.nomeProduto.toUpperCase(),
            custo: parseFloat(dados.custoProduto) || 0,
            preco: parseFloat(dados.precoProduto) || 0,
            categoria: dados.categoriaProduto,
            foto: dados.fotoProduto || "https://via.placeholder.com/150?text=Boteco+934",
            data: new Date()
        });
        campos.forEach(c => document.getElementById(c).value = "");
        document.getElementById('codigoBarra').focus();
    } catch (e) { alert("Erro ao salvar: " + e); }
};

onSnapshot(query(collection(db, "estoque"), orderBy("data", "desc")), (snap) => {
    const grid = document.getElementById('grid-produtos');
    grid.innerHTML = "";
    snap.forEach(doc => {
        const p = doc.data();
        const lucro = p.preco - p.custo;
        const margem = p.preco > 0 ? (lucro / p.preco) * 100 : 0;

        grid.innerHTML += `
            <div class="card">
                <img src="${p.foto}" style="width:100%; height:100px; object-fit:cover; border-radius:8px;">
                <span class="categoria-tag">${p.categoria}</span>
                <h4>${p.nome}</h4>
                <span class="preco">R$ ${p.preco.toFixed(2)}</span>
                <div class="lucro-info">
                    <small>Lucro: R$ ${lucro.toFixed(2)}</small>
                    <small>Margem: ${margem.toFixed(1)}%</small>
                </div>
            </div>
        `;
    });
});
