/**
 * Registra uma transação financeira com taxa de 12.5% sobre ganhos
 * @param {string} descricao - Descrição da transação
 * @param {number} valorBruto - Valor bruto da transação
 * @param {boolean} isGanho - Se é um ganho (aplica taxa)
 * @returns {object} { liquido: number, taxa: number }
 */
function registrarTransacao(descricao, valorBruto, isGanho = false) {
    const TAXA_APOSTAS = 0.125;
    let valorLiquido = valorBruto;
    let taxa = 0;
    
    // Aplica taxa sobre ganhos
    if (isGanho && valorBruto > 0) {
        taxa = valorBruto * TAXA_APOSTAS;
        valorLiquido = valorBruto - taxa;
        
        // Registra a taxa como transação separada
        registrarTransacao(`Taxa sobre ${descricao.toLowerCase()}`, -taxa);
    }
    
    // Atualiza saldo
    const saldoAtual = Number(localStorage.getItem('saldo')) || 0;
    const novoSaldo = saldoAtual + valorLiquido;
    localStorage.setItem('saldo', novoSaldo);
    
    // Adiciona ao extrato
    const extrato = JSON.parse(localStorage.getItem('extrato')) || [];
    extrato.push({
        data: new Date().toISOString(),
        descricao: descricao,
        valor: valorLiquido,
        taxa: isGanho ? taxa : null,
        saldo: novoSaldo
    });
    
    localStorage.setItem('extrato', JSON.stringify(extrato));
    
    return {
        liquido: valorLiquido,
        taxa: taxa
    };
}

/**
 * Atualiza o display de saldo na página
 */
function updateSaldo() {
    const saldo = Number(localStorage.getItem('saldo')) || 0;
    const saldoDisplay = document.getElementById('saldo-display') || document.getElementById('saldo-value');
    
    if (saldoDisplay) {
        saldoDisplay.textContent = saldo.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
    }
}

/**
 * Finaliza um jogo com vitória, aplicando as taxas
 * @param {number} ganhoBruto - Valor bruto do ganho
 * @param {string} nomeJogo - Nome do jogo (Mines, Foguete, etc)
 */
function finalizarJogoComVitória(ganhoBruto, nomeJogo) {
    const resultado = registrarTransacao(`Ganho no ${nomeJogo}`, ganhoBruto, true);
    
    const mensagem = `🎉 Você ganhou R$${ganhoBruto.toFixed(2)}!\n` +
                     `(Taxa de 12.5%: -R$${resultado.taxa.toFixed(2)})\n` +
                     `Valor creditado: R$${resultado.liquido.toFixed(2)}`;
    
    alert(mensagem);
    updateSaldo();
    
    // Atualiza a mensagem de resultado se existir na página
    const resultadoElement = document.getElementById('resultado');
    if (resultadoElement) {
        resultadoElement.innerHTML = 
            `Você ganhou R$${resultado.liquido.toFixed(2)}<br>` +
            `<small>Taxa de 12.5%: R$${resultado.taxa.toFixed(2)}</small>`;
    }
}