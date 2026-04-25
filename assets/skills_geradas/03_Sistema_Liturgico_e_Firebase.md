# 📖 Sistema Litúrgico e Sincronização Firebase

Este documento analisa o sistema de acompanhamento de orações litúrgicas do projeto "Suite", detalhando a arquitetura de armazenamento local e a sincronização em tempo real com o Firebase.

## 1. Visão Geral do Sistema Litúrgico

O sistema litúrgico é composto por dois módulos principais no front-end:
1.  **Santo do Dia (`santo-do-dia.js`)**: Exibe o santo ou celebração litúrgica do dia, buscando dados em um arquivo JSON local (`calendario.json`).
2.  **Liturgia das Horas (`liturgy.js` e `calendar.js`)**: Permite ao usuário marcar quais orações (Laudes, Hora Média, Vésperas, Completas) foram realizadas no dia, persistindo esse progresso no `localStorage`.

## 2. Santo do Dia (`SaintModule`)

O módulo `SaintModule` opera de forma autônoma e atualiza a interface com a celebração do dia.

### 2.1. Cálculo da Data Litúrgica
Uma funcionalidade importante é a função `getLiturgicalDate()`. Ela ajusta a data atual baseada em regras litúrgicas específicas:
*   Se for Sábado ou Domingo, e a hora atual for posterior às 15:00, o sistema avança a data para o dia seguinte (considerando o início das Vésperas I do Domingo ou da Solenidade).
*   Para os demais dias e horários, utiliza a data normal do sistema.

### 2.2. Busca e Formatação de Dados
O módulo faz um `fetch` no arquivo `database/assets/dev/DATA/calendario.json`. Este arquivo contém um array de objetos, onde cada objeto mapeia uma data (ex: `2026-01-01`) para as informações do santo (nome, tipo, descrição e cor litúrgica).
*   A função `formatSaintName(name)` lida com dias que possuem múltiplos santos (separados por ` / ` no JSON), dividindo a string e formatando-a com tags `<br>` para exibição em múltiplas linhas, sempre sanitizando o texto para evitar XSS.

## 3. Acompanhamento de Orações (`liturgy.js`)

Este módulo gerencia o estado das quatro orações diárias.

### 3.1. Estrutura de Dados Local
O progresso é armazenado no `localStorage` sob a chave `prayerData`. A estrutura é um objeto JSON onde as chaves são as datas (formato `YYYY-MM-DD`) e os valores são objetos booleanos representando cada oração:
```json
{
  "2026-04-24": {
    "laudes": true,
    "hora-media": false,
    "vesperas": true,
    "completas": false
  }
}
```

### 3.2. Fluxo de Interação
1.  **Carregamento**: Ao iniciar (`DOMContentLoaded`), a função `loadPrayerStatus()` lê o `prayerData` para o dia atual e atualiza visualmente os botões (adicionando a classe `done`).
2.  **Alternância (Toggle)**: Quando um botão de oração é clicado, `togglePrayer()` inverte o estado booleano no objeto `prayerData` para a data atual.
3.  **Persistência e Eventos**: Após salvar no `localStorage`, o módulo dispara um evento customizado `prayerDataChanged`. Isso permite que outros módulos (como o calendário anual ou o sincronizador do Firebase) reajam à mudança sem acoplamento direto.

## 4. Sincronização em Tempo Real (`FirebaseSync`)

Para garantir que o progresso das orações não seja perdido e possa ser acessado em múltiplos dispositivos, o projeto integra o Firebase Realtime Database através do módulo `firebase-sync.js`.

### 4.1. Inicialização e Autenticação
A função `startSync()` aguarda ativamente (`setInterval`) até que as bibliotecas do Firebase (`firebaseAuth` e `firebaseDb`) estejam carregadas e um usuário esteja autenticado. Quando o `user.uid` está disponível, ela inicia o ouvinte em tempo real.

### 4.2. Escuta de Mudanças Remotas (Download)
A função `setupRealtimeListener()` cria uma referência no banco de dados no caminho `oracoes/{userId}`. O evento `on('value')` é acionado sempre que os dados no servidor mudam.
*   **Merge de Dados**: Quando novos dados chegam do servidor, eles são mesclados (`...localData, ...remoteData`) com os dados locais existentes. Isso garante que orações feitas offline não sejam sobrescritas imediatamente por dados antigos do servidor, embora a lógica atual favoreça os dados remotos em caso de conflito direto na mesma chave.
*   Após o merge, os dados são salvos no `localStorage` e um evento `prayerDataUpdated` é disparado para que a interface (botões e calendário) se atualize visualmente.

### 4.3. Envio de Mudanças Locais (Upload)
O módulo `FirebaseSync` escuta o evento `prayerDataChanged` (disparado pelo `liturgy.js`). Quando o usuário clica em uma oração, a função `saveData()` é chamada. Ela pega o objeto `prayerData` inteiro do `localStorage` e o envia para o Firebase usando o método `.set()` na referência `oracoes/{userId}`.

## 5. Calendário Anual (`calendar.js`)

A página de calendário (`pages/calendar.html`) consome o mesmo `prayerData` para renderizar uma visão anual do progresso.
*   **Renderização**: Ela gera 12 meses, calculando os dias de cada mês e preenchendo uma grade. Para cada dia, ela verifica o status das 4 orações e renderiza pequenas barras indicadoras (`.day-bar`).
*   **Resumo**: Calcula estatísticas (Dias Completos, Parciais, Vazios) iterando sobre o `prayerData`.
*   **Importação/Exportação**: Permite que o usuário baixe seu progresso como um arquivo JSON ou importe um backup antigo, validando a estrutura antes de mesclar com os dados atuais e enviar para o Firebase.

---
*Documento gerado automaticamente pela IA de análise de código.*
