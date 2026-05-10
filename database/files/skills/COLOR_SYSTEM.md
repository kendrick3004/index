# 🎨 Sistema de Cores Dinâmico em JavaScript

Este arquivo detalha a lógica de manipulação de cores e temas, conectando-se diretamente com as [Variáveis CSS](../../css/references/ADVANCED_LAYOUTS.md) e o [Gerenciamento de Temas](../../css/07_Variaveis_CSS_e_Gerenciamento_de_Temas.md).

## 🧠 Lógica de Temas (Dark/Light)

A interconectividade entre o estado do sistema e a interface é gerenciada por JavaScript, ouvindo as preferências do usuário e do sistema operacional.

- **Detecção de Preferência**: Utiliza `window.matchMedia('(prefers-color-scheme: dark)')`.
- **Aplicação de Classe**: Manipula `document.body.classList` para alternar entre temas.
    - *Referência*: [Manipulação de DOM](../04_Manipulacao_de_DOM_e_Eventos.md)

## ⚡ Manipulação de Cores em Tempo Real

JavaScript pode calcular e aplicar cores dinamicamente, criando efeitos de aura e brilho.

```javascript
function applyAura(color, intensity) {
  const root = document.documentElement;
  root.style.setProperty('--primary-glow', color);
  root.style.setProperty('--aura-intensity', `${intensity}px`);
}
```

## 🔗 Conexões Externas

- **Eventos**: Veja [Eventos e Interatividade](../04_Manipulacao_de_DOM_e_Eventos.md) para disparar mudanças de cor.
- **Armazenamento**: Conecte com [LocalStorage](../07_Web_Storage_API_e_Persistencia_de_Dados.md) para salvar a preferência de tema.

---
*Parte do sistema de conhecimento interconectado [Brain Core](../../../BRAIN_CORE.md).*
