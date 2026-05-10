# 🌦️ Módulo de Clima (WeatherModule) - Arquitetura e Implementação

Este documento detalha a arquitetura do módulo de clima presente no projeto "Suite", localizado em `site/pages/suite/weather/weather.js`.

## 1. Visão Geral do Módulo

O `WeatherModule` é responsável por fornecer informações meteorológicas precisas e estilizadas para a interface do usuário. Ele utiliza a API do WeatherAPI para obter dados em tempo real e os armazena no `localStorage` para garantir funcionamento offline e respostas instantâneas.

O módulo é estruturado como uma **IIFE** (Immediately Invoked Function Expression), o que garante o encapsulamento das variáveis e funções internas, expondo apenas o método `init`.

## 2. Configurações Principais (`CONFIG`)

O objeto `CONFIG` centraliza as constantes do módulo:
*   `API_KEY`: Obtida de forma segura através do utilitário `ENV.get('WEATHER_API_KEY')`.
*   `DEFAULT_CITY`: Definida como 'Jacinto Machado'.
*   `UPDATE_INTERVAL`: Configurado para 15 minutos (15 * 60 * 1000 ms).
*   `ENDPOINTS`: URL da API (`https://api.weatherapi.com/v1/forecast.json`).
*   `STORAGE_KEY`: Chave do LocalStorage (`suite_weather_data`).

## 3. Lógica de Atualização e Cache (Offline First)

A função `fetchWeather()` é o coração do sistema de dados:
1.  **Verificação Offline**: Se o navegador estiver offline (`!navigator.onLine`), o módulo tenta carregar os dados cacheados via `loadFromLocal()`. Se existirem, ele renderiza a interface (`updateUI()`) e exibe uma mensagem de alerta (`showOfflineMessage()`).
2.  **Requisição HTTP**: Estando online, ele faz uma requisição `fetch` à API do WeatherAPI, passando a cidade, chave, idioma (pt) e solicitando a previsão de 1 dia.
3.  **Armazenamento**: Após o sucesso da requisição, os dados são salvos no LocalStorage com um timestamp via `saveToLocal()`.
4.  **Tratamento de Erros**: Se a requisição falhar (ex: timeout ou erro de API), o sistema entra em modo de contingência (fallback) carregando os dados do LocalStorage, garantindo que a interface não quebre.

## 4. Renderização da Interface (`updateUI`)

A função `updateUI(data)` é responsável por construir o HTML dinamicamente e injetá-lo no contêiner `.weather-footer`.

### 4.1. Sanitização
Antes de inserir qualquer dado textual vindo da API (nome da cidade, país, condição do tempo), a função auxiliar `sanitize(str)` é utilizada para evitar ataques XSS, convertendo a string através de um elemento temporário `div.textContent`.

### 4.2. Detecção de Dia/Noite
A função `isDayTime()` verifica a hora atual do sistema do usuário para determinar se é dia (entre 06:30 e 18:30) ou noite. Isso influencia diretamente os assets visuais carregados.

### 4.3. Assets Visuais Dinâmicos (`getCustomAssets`)
Com base no código da condição meteorológica (`condition.code`) fornecido pela API e no período do dia (`isDay`), a função `getCustomAssets` mapeia quais arquivos SVG devem ser carregados:
*   **Ícone (`iconPath`)**: Um SVG específico para o clima (ex: Sol, Chuva, Tempestade, Lua).
*   **Template de Fundo (`templatePath`)**: Um SVG maior usado como `background-image` do card de clima (ex: `Weather=Clear, Moment=Day.svg`).

O mapeamento agrupa códigos semelhantes (ex: 1006, 1009 para Nublado) para simplificar a quantidade de assets necessários.

### 4.4. Estrutura do HTML Gerado
O HTML injetado inclui:
*   **Localização**: Cidade e País.
*   **Temperatura Principal**: Ícone do clima, temperatura atual (°C) e sensação térmica.
*   **Detalhes Adicionais**: Máxima, Mínima, Umidade (%), Precipitação (mm) e Probabilidade de Chuva (%).

## 5. Ciclo de Vida (`init`)

O método `init()` é chamado automaticamente quando o DOM está pronto (`DOMContentLoaded`):
1.  Tenta carregar e renderizar os dados em cache imediatamente (para evitar tela em branco).
2.  Inicia a requisição assíncrona para buscar dados novos.
3.  Configura um `setInterval` para buscar novos dados a cada 15 minutos.
4.  Adiciona listeners de eventos globais:
    *   `online`: Dispara uma nova busca de dados.
    *   `offline`: Exibe o banner de aviso de desconexão.

---
*Documento gerado automaticamente pela IA de análise de código.*
