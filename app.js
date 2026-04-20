import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Suas configurações do Boteco934 do print image_091cfd.jpg
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

// FUNÇÃO PARA SALVAR O PRODUTO
window.salvarProduto = async () => {
    const codigo = document.getElementById('codigoBarra').value;
    const nome = document.getElementById('nomeProduto').value;
    const custo = document.getElementById('custoProduto').value;
    const preco = document.getElementById('precoProduto').value;

    if (!nome || !preco) return alert("Por favor, preencha o Nome e o Preço de Venda!");

    try {
        await addDoc(collection(db, "estoque"), {
            codigo: codigo || "S/C",
            nome: nome.toUpperCase(),
            custo: parseFloat(custo) || 0,
            preco: parseFloat(preco) || 0,
            data: new Date()
        });
        
        // Limpa os campos e volta o foco para o código de barras
        document.getElementById('codigoBarra').value = "";
        document.getElementById('nomeProduto').value = "";
        document.getElementById('custoProduto').value = "";
        document.getElementById('precoProduto').value = "";
        document.getElementById('codigoBarra').focus();
        
    } catch (e) {
        alert("Erro ao salvar no banco de dados: " + e);
    }
};

// MOSTRAR O ESTOQUE COM LUCRO E MARGEM EM TEMPO REAL
const q = query(collection(db, "estoque"), orderBy("data", "desc"));
onSnapshot(q, (snapshot) => {
    const grid = document.getElementById('grid-produtos');
    grid.innerHTML = "";
    
    snapshot.forEach((doc) => {
        const p = doc.data();
        
        // CÁLCULO DO LUCRO QUE REALMENTE VAI PARA O BOLSO
        const custoReal = p.custo || 0;
        const vendaReal = p.preco || 0;
        const lucroValor = vendaReal - custoReal;
        
        // CÁLCULO DA MARGEM REAL (%)
        const margemReal = vendaReal > 0 ? (lucroValor / vendaReal) * 100 : 0;

        grid.innerHTML += `
            <div class="card">
                <span class="barcode">COD: ${p.codigo}</span>
                <h4>${p.nome}</h4>
                <span class="preco">VENDA: R$ ${vendaReal.toFixed(2)}</span>
                
                <div style="background: rgba(46, 204, 113, 0.1); padding: 8px; border-radius: 8px; margin-top: 10px; border: 1px solid #222;">
                    <small style="color: #2ecc71; display: block; font-weight: bold;">
                        Lucro Real: R$ ${lucroValor.toFixed(2)}
                    </small>
                    <small style="color: #3498db; display: block; font-weight: bold;">
                        Margem: ${margemReal.toFixed(1)}%
                    </small>
                </div>
            </div>
        `;
    });
});
