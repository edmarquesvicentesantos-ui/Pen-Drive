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

window.salvarProduto = async () => {
    const codigo = document.getElementById('codigoBarra').value;
    const nome = document.getElementById('nomeProduto').value;
    const custo = document.getElementById('custoProduto').value;
    const preco = document.getElementById('precoProduto').value;

    if (!nome || !preco) return alert("Preencha Nome e Preço!");

    try {
        await addDoc(collection(db, "estoque"), {
            codigo: codigo || "S/C",
            nome: nome,
            custo: parseFloat(custo) || 0,
            preco: parseFloat(preco),
            data: new Date()
        });
        
        document.getElementById('codigoBarra').value = "";
        document.getElementById('nomeProduto').value = "";
        document.getElementById('custoProduto').value = "";
        document.getElementById('precoProduto').value = "";
        document.getElementById('codigoBarra').focus();
    } catch (e) {
        alert("Erro: " + e);
    }
};

onSnapshot(query(collection(db, "estoque"), orderBy("data", "desc")), (snap) => {
    const grid = document.getElementById('grid-produtos');
    grid.innerHTML = "";
    snap.forEach(doc => {
        const p = doc.data();
        
        // Cálculos de Lucro e Margem
        const lucroValor = p.preco - p.custo;
        const margemPorcentagem = p.preco > 0 ? (lucroValor / p.preco) * 100 : 0;

        grid.innerHTML += `
            <div class="card">
                <span class="barcode">COD: ${p.codigo}</span>
                <h4>${p.nome}</h4>
                <span class="preco">Venda: R$ ${p.preco.toFixed(2)}</span>
                <div style="background: #262626; padding: 5px; border-radius: 5px; margin-top: 8px;">
                    <small style="color: #2ecc71; display: block;">Lucro: R$ ${lucroValor.toFixed(2)}</small>
                    <small style="color: #3498db; display: block;">Margem: ${margemPorcentagem.toFixed(1)}%</small>
                </div>
            </div>
        `;
    });
});
