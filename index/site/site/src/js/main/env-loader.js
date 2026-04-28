/**
 * ARQUIVO: env-loader.js
 * DESCRIÇÃO: Carregador de variáveis de ambiente para o front-end.
 * SEGURANÇA: As chaves abaixo são públicas por necessidade do front-end.
 * IMPORTANTE: Configure restrições de domínio (HTTP Referrer) no Console do Google Cloud/Firebase
 * para garantir que estas chaves só funcionem no seu domínio oficial.
 */

const ENV = (function() {
    'use strict';

    // Estas chaves são necessárias para o funcionamento do Firebase e Clima no navegador.
    // Para máxima segurança, restrinja o uso destas chaves ao seu domínio no painel do provedor.
    const config = {
        FIREBASE_API_KEY: "AIzaSyDYaFrq8MphGFmR-zU00bO9fKBEUIH4UYM",
        WEATHER_API_KEY: "55e2f6c107b54f808f6145707252712"
    };

    return {
        get: (key) => config[key] || null
    };
})();
