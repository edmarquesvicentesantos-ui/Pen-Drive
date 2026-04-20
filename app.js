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

    if (!nome || !preco) return alert("Por favor, preencha Nome e Preço!");

    try {
        await addDoc(collection(db, "estoque"), {
            codigo: codigo || "S/C",
            nome: nome,
            custo: parseFloat(custo) || 0,
            preco: parseFloat(preco),
            data: new Date()
        });
        
        // Limpa campos e volta o foco para o leitor
        document.getElementById('codigoBarra').value = "";
        document.getElementById('nomeProduto').value = "";
        document.getElementById('custoProduto').value = "";
        document.getElementById('precoProduto').value = "";
        document.getElementById('codigoBarra').focus();
        
    } catch (e) {
        alert("Erro ao salvar no Firebase: " + e);
    }
};

onSnapshot(query(collection(db, "estoque"), orderBy("data", "desc")), (snap) => {
    const grid = document.getElementById('grid-produtos');
    grid.innerHTML = "";
    snap.forEach(doc => {
        const p = doc.data();
        grid.innerHTML += `
            <div class="card">
                <span class="barcode">COD: ${p.codigo}</span>
                <h4>${p.nome}</h4>
                <span class="preco">R$ ${p.preco.toFixed(2)}</span>
            </div>
        `;
    });
});
