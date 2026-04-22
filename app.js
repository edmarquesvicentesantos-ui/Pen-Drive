:root { --verde: #1fcc7d; --bg: #0d0d0d; --card: #1a1a1a; --texto: #ffffff; }
body { margin: 0; background: var(--bg); color: var(--texto); font-family: sans-serif; overflow: hidden; }

.pdv-layout { display: grid; grid-template-columns: 1fr 380px; height: 100vh; padding: 15px; gap: 15px; box-sizing: border-box; }

.area-cupom { background: #fff; color: #333; border-radius: 20px; padding: 25px; display: flex; flex-direction: column; }
.cabecalho-loja { text-align: center; border-bottom: 2px dashed #ddd; margin-bottom: 15px; }
.cabecalho-loja h1 { margin: 0; color: #000; }

.tabela-venda { flex-grow: 1; overflow-y: auto; }
table { width: 100%; border-collapse: collapse; }
td { padding: 12px 5px; border-bottom: 1px solid #f0f0f0; font-weight: 600; }
.img-tabela { width: 45px; height: 45px; object-fit: cover; border-radius: 8px; }

.painel-total { background: #000; color: var(--verde); padding: 20px; border-radius: 15px; text-align: right; margin-top: 15px; }
.painel-total span { font-size: 45px; font-weight: 900; }

.area-comandos { display: flex; flex-direction: column; gap: 12px; height: 100%; }
.card-comando { background: var(--card); padding: 12px; border-radius: 10px; border: 1px solid #333; }
.titulo-secao { font-size: 10px; font-weight: bold; color: var(--verde); margin-bottom: 5px; text-transform: uppercase; }

#biparVenda, .input-moderno { width: 100%; padding: 12px; background: #000; border: 1px solid #444; color: #fff; border-radius: 8px; box-sizing: border-box; }
.btn-finalizar { background: var(--verde); color: #000; border: none; padding: 15px; font-weight: bold; font-size: 18px; border-radius: 10px; cursor: pointer; }

/* CATEGORIAS POSICIONADAS */
.container-categorias { background: var(--card); border-radius: 10px; padding: 10px; border: 1px solid #333; flex-grow: 1; display: flex; flex-direction: column; overflow: hidden; }
.filtro-abas { display: flex; gap: 5px; margin-bottom: 10px; }
.aba-filtro { flex: 1; padding: 8px; background: #222; border: 1px solid #444; color: #fff; border-radius: 5px; cursor: pointer; font-size: 10px; }
.aba-filtro.ativa { background: var(--verde); color: #000; font-weight: bold; }
.vitrine-scroll { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; overflow-y: auto; padding-right: 5px; }

.card-vitrine { background: #111; padding: 5px; border-radius: 8px; border: 1px solid #222; text-align: center; cursor: pointer; }
.img-vitrine { width: 100%; height: 60px; object-fit: cover; border-radius: 4px; }

.btn-config-flutuante { position: fixed; bottom: 20px; right: 20px; background: #000; color: var(--verde); border: 1px solid var(--verde); width: 50px; height: 50px; border-radius: 50%; cursor: pointer; z-index: 100; }
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); display: none; align-items: center; justify-content: center; z-index: 2000; }
.modal-card { background: #111; padding: 20px; border-radius: 15px; width: 350px; border: 1px solid #333; }
