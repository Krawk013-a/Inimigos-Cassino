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
    
    // Obtém o saldo atual e garante que é um número
    let saldoAtual = parseFloat(localStorage.getItem('saldo')) || 0;

    // Aplica taxa sobre ganhos
    if (isGanho && valorBruto > 0) {
        taxa = parseFloat((valorBruto * TAXA_APOSTAS).toFixed(2));
        valorLiquido = parseFloat((valorBruto - taxa).toFixed(2));

        // Registra a taxa como transação separada
        adicionarAoExtrato(`Taxa sobre ${descricao.toLowerCase()}`, -taxa, saldoAtual);
    }

    // Atualiza saldo
    let novoSaldo = parseFloat((saldoAtual + valorLiquido).toFixed(2));
    localStorage.setItem('saldo', novoSaldo.toString());

    // Adiciona ao extrato
    adicionarAoExtrato(descricao, valorLiquido, novoSaldo);

    // Atualiza a tela
    updateSaldo();

    return {
        liquido: valorLiquido,
        taxa: taxa
    };
}

/**
 * Adiciona uma entrada ao extrato de transações
 * @param {string} descricao - Descrição da transação
 * @param {number} valor - Valor da transação
 * @param {number} saldoAtualizado - Saldo após a transação
 */
function adicionarAoExtrato(descricao, valor, saldoAtualizado) {
    const extrato = JSON.parse(localStorage.getItem('extrato')) || [];
    
    extrato.push({
        data: new Date().toLocaleString('pt-BR'),
        descricao: descricao,
        valor: valor,
        saldo: saldoAtualizado
    });

    localStorage.setItem('extrato', JSON.stringify(extrato));
}

/**
 * Atualiza o display de saldo na página
 */
function updateSaldo() {
    let saldo = parseFloat(localStorage.getItem('saldo')) || 0;
    const saldoDisplay = document.getElementById('saldo-value');

    if (saldoDisplay) {
        saldoDisplay.textContent = saldo.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
    } else {
        console.warn("Elemento saldo-value não encontrado! Verifique se o ID está correto no HTML.");
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
    
    // Atualiza a mensagem de resultado se existir na página
    const resultadoElement = document.getElementById('resultado');
    if (resultadoElement) {
        resultadoElement.innerHTML = 
            `🎉 ${nomeJogo}: Ganho de R$${resultado.liquido.toFixed(2)}<br>` +
            `<small>Taxa de 12.5%: R$${resultado.taxa.toFixed(2)}</small>`;
        resultadoElement.className = 'ganho';
    }
    
    updateSaldo();
}

// Garante que updateSaldo() só será executado após o carregamento da página
document.addEventListener('DOMContentLoaded', updateSaldo);
