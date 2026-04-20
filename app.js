import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Suas chaves que pegamos nos prints
const firebaseConfig = {
  apiKey: "AIzaSyAZf_RpFnTCS3DxqKIxpK7CEh5aTrLMEs4",
  authDomain: "pdv-dre.firebaseapp.com",
  projectId: "pdv-dre",
  storageBucket: "pdv-dre.firebasestorage.app",
  messagingSenderId: "1001196115131",
  appId: "1:1001196115131:web:0d91b192727ae694f6459e"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Atualiza o status na tela
document.getElementById('status-firebase').innerText = "Online 🟢";

// Função para Salvar Produto
window.salvarProduto = async () => {
    const nome = document.getElementById('nomeProduto').value;
    const custo = document.getElementById('custoProduto').value;
    const preco = document.getElementById('precoProduto').value;

    if (!nome || !preco) return alert("Por favor, preencha o nome e o preço!");

    try {
        await addDoc(collection(db, "produtos"), {
            nome: nome,
            custo: parseFloat(custo) || 0,
            preco: parseFloat(preco),
            data: new Date()
        });
        
        // Limpar campos
        document.getElementById('nomeProduto').value = "";
        document.getElementById('custoProduto').value = "";
        document.getElementById('precoProduto').value = "";
        
    } catch (e) {
        alert("Erro ao salvar: " + e);
    }
};

// Função para Listar Cards em Tempo Real
const q = query(collection(db, "produtos"), orderBy("data", "desc"));
onSnapshot(q, (snapshot) => {
    const grid = document.getElementById('grid-produtos');
    grid.innerHTML = "";
    
    snapshot.forEach((doc) => {
        const p = doc.data();
        const lucroCalculado = p.preco - p.custo;
        
        grid.innerHTML += `
            <div class="card" onclick="alert('Venda registrada: ${p.nome}')">
                <h4>${p.nome}</h4>
                <span class="preco">R$ ${p.preco.toFixed(2)}</span>
                <span class="lucro">Lucro: R$ ${lucroCalculado.toFixed(2)}</span>
            </div>
        `;
    });
});