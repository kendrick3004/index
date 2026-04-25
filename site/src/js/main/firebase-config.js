/**
 * ARQUIVO: firebase-config.js
 * DESCRIÇÃO: Configuração Central do Firebase para a Suite
 * FUNCIONALIDADES: Inicializa Firebase Auth e Realtime Database com as chaves reais do usuário
 * VERSÃO: 1.1.0
 */

// Configuração do Firebase fornecida pelo usuário
const firebaseConfig = {
    apiKey: ENV.get('FIREBASE_API_KEY'), // Carregado de forma segura via env-loader.js
    authDomain: "suite-98ddf.firebaseapp.com",
    projectId: "suite-98ddf",
    storageBucket: "suite-98ddf.firebasestorage.app",
    messagingSenderId: "422570152337",
    appId: "1:422570152337:web:8637be0a4e4fc863570a30",
    measurementId: "G-66TJGMB8JC",
    databaseURL: "https://suite-98ddf-default-rtdb.firebaseio.com" // URL padrão baseada no Project ID
};

// Carregamento dinâmico do SDK do Firebase via CDN (Firebase v10+ Compat)
const FIREBASE_VERSION = "10.8.0";

async function loadFirebase() {
    if (window.firebaseApp) return;

    const modules = [
        `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-app-compat.js`,
        `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-auth-compat.js`,
        `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-database-compat.js`
    ];

    for (const src of modules) {
        await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // Inicializa o Firebase com as chaves reais
    window.firebaseApp = firebase.initializeApp(firebaseConfig);
    window.firebaseAuth = firebase.auth();
    window.firebaseDb = firebase.database();
    
    console.log("🔥 Firebase inicializado com sucesso! (Chave de API carregada de forma segura)");
}

// Inicialização automática
loadFirebase().catch(err => console.error("❌ Erro ao carregar Firebase:", err));
