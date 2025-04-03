// db.js
let db;

async function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("CassinoTCC", 1);
        
        request.onupgradeneeded = (event) => {
            db = event.target.result;
            
            if (!db.objectStoreNames.contains("usuarios")) {
                const userStore = db.createObjectStore("usuarios", { keyPath: "id", autoIncrement: true });
                userStore.createIndex("username", "username", { unique: true });
            }
            
            if (!db.objectStoreNames.contains("transacoes")) {
                const transactionStore = db.createObjectStore("transacoes", { keyPath: "id", autoIncrement: true });
                transactionStore.createIndex("userId", "userId", { unique: false });
                transactionStore.createIndex("date", "date", { unique: false });
            }
        };
        
        request.onsuccess = (event) => {
            db = event.target.result;
            resolve(db);
        };
        
        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
}

async function registerTransaction(userId, description, value) {
    const saldoAtual = await getSaldo(userId);
    const novoSaldo = saldoAtual + value;
    
    const transaction = {
        userId: userId,
        date: new Date().toISOString(),
        description: description,
        value: value,
        balance: novoSaldo
    };
    
    const tx = db.transaction("transacoes", "readwrite");
    const store = tx.objectStore("transacoes");
    store.add(transaction);
    
    return new Promise((resolve) => {
        tx.oncomplete = () => resolve(novoSaldo);
    });
}

async function getSaldo(userId) {
    const tx = db.transaction("transacoes", "readonly");
    const store = tx.objectStore("transacoes");
    const index = store.index("userId");
    const request = index.getAll(userId);
    
    return new Promise((resolve) => {
        request.onsuccess = () => {
            const transacoes = request.result;
            if (transacoes.length > 0) {
                resolve(transacoes[transacoes.length - 1].balance);
            } else {
                resolve(0);
            }
        };
    });
}

function aplicarTaxa(valorGanho) {
    const TAXA_IMPOSTO = 0.125; // 12.5%
    const taxa = valorGanho * TAXA_IMPOSTO;
    const valorLiquido = valorGanho - taxa;
    
    return {
        taxa: taxa,
        liquido: valorLiquido
    };
}