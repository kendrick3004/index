# 🎨 Dicionário Atômico de CSS: A Anatomia do Estilo

Este arquivo é um neurônio central que mapeia cada termo técnico do CSS, explicando sua função biológica no ecossistema do design.

## 1. Seletores: Os Receptores de Sinal
- **`*` (Seletor Universal)**: Seleciona absolutamente todos os elementos. Útil para resetar `margin` e `padding`.
- **`body`**: O tronco principal. Define estilos herdados por quase tudo.
- **`.class`**: Receptor específico para múltiplos elementos.
- **`#id`**: Receptor único. Prioridade máxima de sinal.
- **`:hover`**: Pseudo-classe que detecta a proximidade do cursor (interatividade).

## 2. Propriedades de Espaçamento (O Respiro do Layout)
- **`margin`**: Espaço **externo** à borda. Empurra outros elementos.
    - `margin-top`: Empurra para baixo.
    - `margin-bottom`: Empurra para cima.
    - `margin-left/right`: Empurra lateralmente.
- **`padding`**: Espaço **interno** entre o conteúdo e a borda. Infla o elemento por dentro.
- **`width/height`**: Largura e altura. O tamanho físico da célula.

## 3. Propriedades de Fundo e Cor (A Estética)
- **`background`**: Atalho para cor, imagem, posição e repetição do fundo.
- **`background-color`**: Define a cor sólida de fundo.
- **`color`**: Define a cor do **texto** (foreground).
- **`opacity`**: Transparência de 0 (invisível) a 1 (opaco).

## 4. Tipografia (A Voz do Código)
- **`font-family`**: A linhagem da fonte (ex: Arial, Serif).
- **`font-size`**: O volume da voz (tamanho do texto).
- **`font-weight`**: A espessura (bold = negrito).
- **`text-align`**: Onde o texto se apoia (left, center, right).

## 5. Posicionamento (A Localização Espacial)
- **`position: relative`**: O elemento se move em relação a si mesmo.
- **`position: absolute`**: O elemento flutua em relação ao pai mais próximo que seja `relative`.
- **`position: fixed`**: O elemento gruda na tela, ignorando o scroll.
- **`z-index`**: A profundidade. Valores maiores ficam "na frente".

---
*Conexão Neural: Este dicionário alimenta a lógica de [JAVASCRIPT_ATOMIC_DICTIONARY.md](./JAVASCRIPT_ATOMIC_DICTIONARY.md) quando manipulamos estilos via código.*
