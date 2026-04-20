// FUNÇÃO PARA IMPRESSÃO TÉRMICA
function imprimirReciboTermico(cliente, itens, total, tipo) {
    const janelaImpressao = window.open('', '', 'width=300,height=600');
    
    let conteudoItens = itens.map(i => `
        <tr>
            <td style="font-size: 12px;">${i.qtd}x ${i.nome}</td>
            <td style="font-size: 12px; text-align: right;">${i.subtotal.toFixed(2)}</td>
        </tr>
    `).join('');

    janelaImpressao.document.write(`
        <html>
        <head>
            <style>
                body { font-family: 'Courier New', Courier, monospace; width: 100%; margin: 0; padding: 10px; }
                .topo { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 10px; }
                table { width: 100%; margin-top: 10px; border-bottom: 1px dashed #000; padding-bottom: 10px; }
                .total { font-weight: bold; font-size: 16px; margin-top: 10px; text-align: right; }
                .rodape { text-align: center; margin-top: 20px; font-size: 10px; }
            </style>
        </head>
        <body onload="window.print(); window.close();">
            <div class="topo">
                <strong style="font-size: 18px;">BOTECO 934</strong><br>
                Petrolina - PE<br>
                Cliente: ${cliente}
            </div>
            <table>
                ${conteudoItens}
            </table>
            <div class="total">TOTAL: R$ ${total.toFixed(2)}</div>
            <div style="font-size: 12px; margin-top: 5px;">PAGAMENTO: ${tipo}</div>
            <div class="rodape">🍻 Obrigado pela preferência! 🍻</div>
        </body>
        </html>
    `);
    janelaImpressao.document.close();
}
