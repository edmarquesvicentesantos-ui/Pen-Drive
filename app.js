<script>
    // --- CONFIGURAÇÃO FIREBASE ---
    const firebaseConfig = {
        databaseURL: "https://boteco934-music-default-rtdb.firebaseio.com",
        projectId: "boteco934-music"
    };
    firebase.initializeApp(firebaseConfig);
    const db = firebase.database();

    const audioPlayer = document.getElementById('audio-player');
    const btnPlay = document.getElementById('btn-play-radio');
    const selectRadio = document.getElementById('select-radio');

    // --- CARREGAR RÁDIOS (VERSÃO BLINDADA) ---
    db.ref('radios').on('value', (snapshot) => {
        const data = snapshot.val();
        selectRadio.innerHTML = '<option value="">-- Selecione a Rádio --</option>';
        
        if (data) {
            Object.keys(data).forEach(key => {
                const item = data[key];
                // Tenta encontrar o nome e a URL de várias formas para evitar o "undefined"
                const nomeFinal = item.nome || item.Nome || item.radio || "Rádio " + key;
                const urlFinal = item.url || item.URL || item.link || item.Link;

                if (urlFinal) {
                    let opt = document.createElement('option');
                    opt.value = urlFinal;
                    opt.innerHTML = nomeFinal;
                    selectRadio.appendChild(opt);
                }
            });
        }
    });

    // --- LOGICA DE TROCA DE ESTAÇÃO ---
    selectRadio.addEventListener('change', function() {
        if (!this.value) return;
        
        audioPlayer.pause();
        audioPlayer.src = this.value;
        audioPlayer.load(); // Força o carregamento do streaming

        // Tenta dar play automaticamente
        audioPlayer.play().then(() => {
            btnPlay.innerText = "⏸";
        }).catch(() => {
            console.log("Clique no play manualmente");
            btnPlay.innerText = "▶";
        });
    });

    btnPlay.addEventListener('click', () => {
        if (audioPlayer.paused) {
            if(!audioPlayer.src && selectRadio.value) audioPlayer.src = selectRadio.value;
            audioPlayer.play();
            btnPlay.innerText = "⏸";
        } else {
            audioPlayer.pause();
            btnPlay.innerText = "▶";
        }
    });

    // --- LÓGICA DO PDV ---
    let carrinho = [];
    let totalGeral = 0;

    // Exemplo de banco de produtos (Ajuste os links das imagens aqui)
    const produtosDB = [
        { ean: "789123", nome: "Cerveja Heineken 600ml", preco: 15.00, img: "https://images.tcdn.com.br/img/img_prod/735694/cerveja_heineken_600ml_267_1_20200722152342.jpg" },
        { ean: "789456", nome: "Coca-Cola Lata 350ml", preco: 5.50, img: "https://m.media-amazon.com/images/I/51v8nyS19vL._AC_SL1000_.jpg" }
    ];

    function renderizarVitrine() {
        const vitrine = document.getElementById('vitrine-produtos');
        vitrine.innerHTML = produtosDB.map(p => `
            <div class="card-produto" onclick="adicionarAoCarrinho('${p.ean}')">
                <img src="${p.img}" class="img-produto" onerror="this.src='https://via.placeholder.com/70?text=Sem+Foto'">
                <div class="nome-prod">${p.nome}</div>
                <div class="preco-prod">R$ ${p.preco.toFixed(2)}</div>
            </div>
        `).join('');
    }

    function adicionarAoCarrinho(codigo) {
        const produto = produtosDB.find(p => p.ean === codigo);
        if (produto) {
            carrinho.push(produto);
            atualizarTabela();
        }
    }

    function atualizarTabela() {
        const corpo = document.getElementById('corpo-carrinho');
        totalGeral = 0;
        corpo.innerHTML = carrinho.map((p) => {
            totalGeral += p.preco;
            return `<tr><td><img src="${p.img}" class="img-tabela"></td><td>${p.nome}</td><td align="center">1</td><td align="right">R$ ${p.preco.toFixed(2)}</td></tr>`;
        }).join('');
        document.getElementById('total-venda-valor').innerText = totalGeral.toLocaleString('pt-BR', {minimumFractionDigits: 2});
    }

    document.getElementById('biparVenda').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') { adicionarAoCarrinho(e.target.value); e.target.value = ""; }
    });

    function finalizarVenda() {
        if (carrinho.length === 0) return alert("Carrinho vazio!");
        alert(`Venda finalizada! Total: R$ ${totalGeral.toFixed(2)}`);
        carrinho = [];
        atualizarTabela();
    }

    renderizarVitrine();
</script>
