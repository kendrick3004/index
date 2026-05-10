# 🗄️ Design de Banco de Dados: Estrutura de Dados Suite

Este documento detalha como os dados são estruturados e persistidos no projeto "Suite", combinando armazenamento NoSQL (Firebase), cache local (LocalStorage) e arquivos estáticos (JSON).

## 1. Estrutura de Dados NoSQL (Firebase)

O Suite utiliza o **Firebase Realtime Database** para sincronização entre dispositivos. Os dados são estruturados em um formato JSON plano para otimizar a velocidade de leitura.

### Coleção: `oracoes`
Armazena o progresso diário das orações litúrgicas.

```json
{
  "oracoes": {
    "{user_id}": {
      "2026-04-24": {
        "laudes": true,
        "hora-media": false,
        "vesperas": true,
        "completas": false
      },
      "2026-04-25": {
        "laudes": true,
        "hora-media": true,
        "vesperas": true,
        "completas": true
      }
    }
  }
}
```

## 2. Persistência Local (LocalStorage)

O navegador atua como um banco de dados de cache para garantir a experiência "Offline-First".

| Chave | Formato | Descrição |
|-------|---------|-----------|
| `prayerData` | JSON Object | Cópia local do progresso das orações (sincronizada com Firebase). |
| `suite_weather_data` | JSON Object | Cache da última resposta da WeatherAPI com timestamp. |
| `suite_theme_preference` | String | Preferência de tema do usuário (`dark` ou `light`). |
| `suite_last_seen_version` | String | Última versão do sistema processada pelo `update.js`. |

## 3. Bancos de Dados Estáticos (JSON)

Arquivos JSON são usados para dados que mudam raramente ou que são gerados via scripts de build.

### 3.1. `calendario.json`
Localizado em `database/assets/dev/DATA/`. Contém o calendário litúrgico anual.
- **Chave**: Data (`YYYY-MM-DD`).
- **Valores**: Nome do Santo, Tipo de Celebração, Descrição e Cor Litúrgica.

### 3.2. `file_structure.json`
Gerado pelo script `generate_assets_structure.py`.
- **Estrutura**: Árvore de diretórios representando a pasta `assets/`.
- **Metadados**: Tamanho do arquivo, extensão, data de modificação e caminho para preview.

## 4. Estratégia de Sincronização (Merge)

O projeto implementa uma lógica de **Merge Bidirecional** no script `firebase-sync.js`:

1.  **Prioridade Remota**: Ao carregar a página, os dados do Firebase sobrescrevem o LocalStorage para garantir consistência.
2.  **Escuta Ativa**: O sistema usa o evento `.on('value')` do Firebase. Qualquer mudança em outro dispositivo reflete instantaneamente na interface local.
3.  **Fallback Offline**: Se a conexão com o Firebase falhar, o sistema opera 100% sobre o `prayerData` do LocalStorage. Quando a conexão volta, o próximo clique do usuário envia o estado local completo para a nuvem (`.set()`).

## 5. Boas Práticas e Performance

1.  **Denormalização**: Os dados de oração são salvos por data direta (`YYYY-MM-DD`) para evitar cálculos complexos de data no front-end.
2.  **Sanitização**: Todos os campos de texto vindos do `calendario.json` passam por uma função de escape antes de serem inseridos no HTML.
3.  **Atomicidade**: No Firebase, as atualizações são feitas no nível do nó do usuário, garantindo que o histórico completo seja preservado.

---
*Documento adaptado para descrever a arquitetura de dados híbrida do projeto Suite.*
