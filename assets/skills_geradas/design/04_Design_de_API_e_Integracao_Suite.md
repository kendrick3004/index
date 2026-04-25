# 🔌 Design de API e Integração: Projeto Suite

Este documento descreve como o projeto "Suite" se integra com APIs externas e como o back-end Flask expõe rotas para o front-end.

## 1. Integração com APIs Externas

O front-end do Suite consome serviços de terceiros para enriquecer a experiência do usuário.

### 1.1. WeatherAPI (Clima)
- **Endpoint**: `https://api.weatherapi.com/v1/forecast.json`
- **Método**: `GET`
- **Autenticação**: Chave de API enviada via query parameter `key`.
- **Tratamento**: Os dados são filtrados para exibir apenas: Temperatura atual, Condição (ícone), Umidade e Probabilidade de Chuva.

### 1.2. Firebase Realtime DB
- **Protocolo**: WebSockets (via SDK Firebase).
- **Fluxo**: O front-end mantém uma conexão aberta para receber atualizações "push" de mudanças no progresso das orações.
- **Segurança**: Regras de segurança no Firebase garantem que um usuário só possa ler/escrever no seu próprio nó `oracoes/{uid}`.

## 2. API Interna (Flask Back-end)

O back-end Python atua principalmente como um servidor de arquivos, mas expõe comportamentos lógicos via rotas.

### 2.1. Rotas de Erro e Manutenção
- `/404`: Retorna a página de erro personalizada.
- `/429`: Retorna a página de bloqueio por excesso de requisições.
- `/api/status`: (No modo manutenção) Retorna um JSON informando a saúde do sistema.

### 2.2. Rate Limiting (Proteção de Endpoint)
O servidor Flask implementa um limite de taxa para proteger o processamento:
- **Limite**: 10 requisições por 10 segundos por IP.
- **Resposta**: HTTP 429 com corpo HTML customizado.

## 3. Padrões de Requisição no Front-end

O projeto utiliza a API `fetch` com padrões modernos:

```javascript
const response = await fetch(url, {
    method: 'GET',
    headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
    }
});
```

### 3.1. Burlar Cache (Cache Busting)
Para requisições críticas como `version.json` e `file_structure.json`, o sistema anexa um timestamp para garantir que o dado venha do servidor e não do cache do navegador:
`fetch('/src/app/version.json?t=' + Date.now())`

## 4. Segurança e Autenticação

1.  **Firebase Auth**: O login é gerido inteiramente pelo Firebase (E-mail/Senha ou Google). O token de autenticação (JWT) é armazenado de forma segura pelo SDK.
2.  **CORS**: O servidor Flask é configurado para aceitar requisições apenas da origem permitida (geralmente o próprio domínio via Cloudflare).
3.  **Sanitização de Respostas**: Antes de exibir qualquer dado vindo de uma API externa na tela, o valor é passado por uma função de escape para prevenir ataques de injeção de script.

---
*Documento adaptado para descrever os fluxos de integração e comunicação do projeto Suite.*
