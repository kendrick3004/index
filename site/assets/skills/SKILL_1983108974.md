---
name: css-expert
description: Use when styling web pages with CSS3, focusing on responsive design, layout techniques (Flexbox, Grid), animations, and maintainable stylesheets. Generates clean, optimized, and cross-browser compatible CSS, utilizes pre-processors (Sass/Less), and ensures visual consistency across devices. Invoke for modern web styling, UI/UX implementation, and performance optimization of visual elements.
license: MIT
metadata:
  author: Manus AI
  version: "1.0.0"
  domain: frontend
  triggers: CSS3, responsive design, Flexbox, CSS Grid, animations, SASS, LESS, web styling, UI/UX, performance CSS
  role: specialist
  scope: implementation
  output-format: code
  related-skills: html-expert, javascript-pro, ui-ux-designer, web-performance-optimizer
---

# CSS Expert

Especialista em CSS3, focado na criação de estilos visuais atraentes, responsivos e de alta performance para aplicações web.

## Quando Usar Esta Skill

- Ao estilizar qualquer elemento HTML para criar a interface do usuário.
- Para implementar layouts complexos e responsivos que se adaptam a diferentes tamanhos de tela.
- Ao adicionar animações e transições para melhorar a experiência do usuário.
- Para organizar e manter grandes bases de código CSS usando metodologias e pré-processadores.
- Para otimizar o desempenho visual de uma página web.

## Core Workflow

1.  **Analisar Design** — Compreender os mockups, wireframes e guias de estilo para traduzir o design em CSS.
2.  **Estruturar CSS** — Organizar o CSS usando metodologias (BEM, OOCSS, SMACSS) ou pré-processadores (Sass, Less).
3.  **Implementar Layout** — Utilizar Flexbox e CSS Grid para criar layouts flexíveis e responsivos.
4.  **Estilizar Componentes** — Aplicar cores, tipografia, espaçamento, bordas e sombras aos elementos.
5.  **Garantir Responsividade** — Usar Media Queries para adaptar o layout e estilos a diferentes dispositivos.
6.  **Adicionar Interatividade Visual** — Implementar transições e animações para feedback visual e dinamismo.
7.  **Otimizar e Validar** — Minificar CSS, remover código não utilizado e verificar compatibilidade entre navegadores.

## Reference Guide

Carregar orientações detalhadas com base no contexto:

| Tópico             | Referência                               | Carregar Quando                                    |
|--------------------|------------------------------------------|----------------------------------------------------|
| Seletores e Especificidade | `references/selectors-specificity.md`    | Seleção de elementos, ordem de aplicação de estilos |
| Box Model e Layout | `references/box-model-layout.md`         | `margin`, `padding`, `border`, `width`, `height`   |
| Flexbox            | `references/flexbox.md`                  | Layouts unidimensionais, alinhamento, distribuição |
| CSS Grid           | `references/css-grid.md`                 | Layouts bidimensionais, áreas, linhas e colunas    |
| Responsividade     | `references/responsive-css.md`           | Media Queries, `viewport`, unidades relativas      |
| Animações e Transições | `references/animations-transitions.md`   | `transition`, `animation`, `@keyframes`            |
| Pré-processadores  | `references/preprocessors.md`            | Sass, Less, variáveis, mixins, aninhamento         |

## Constraints

### MUST DO
- Utilizar unidades relativas (`em`, `rem`, `vw`, `vh`, `%`) para responsividade.
- Priorizar Flexbox e CSS Grid para construção de layouts.
- Usar variáveis CSS (`--var-name`) para temas e valores reutilizáveis.
- Organizar o CSS de forma modular e escalável.
- Adicionar prefixos de navegador (`-webkit-`, `-moz-`, etc.) quando necessário para compatibilidade.
- Otimizar imagens e fontes para carregamento rápido.
- Garantir que o contraste de cores atenda aos padrões de acessibilidade (WCAG).

### MUST NOT DO
- Usar `!important` indiscriminadamente.
- Estilizar elementos com IDs excessivamente (preferir classes).
- Escrever CSS repetitivo; buscar reutilização de código.
- Usar pixels para tamanhos de fonte e espaçamentos em layouts responsivos.
- Ignorar a compatibilidade entre navegadores.
- Criar animações que causem jank (quedas de frame rate).

## Code Examples

### Layout Responsivo com Flexbox
```css
.container {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    justify-content: center;
}

.item {
    flex: 1 1 300px; /* Cresce, encolhe, base de 300px */
    padding: 20px;
    background-color: #f0f0f0;
    border-radius: 8px;
    text-align: center;
}

@media (max-width: 600px) {
    .item {
        flex-basis: 100%; /* Em telas pequenas, ocupa a largura total */
    }
}
```

### Animação Simples com `@keyframes`
```css
.fade-in {
    animation: fadeIn 1s ease-in-out forwards;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
```

### Uso de Variáveis CSS para Temas
```css
:root {
    --primary-color: #007bff;
    --secondary-color: #6c757d;
    --text-color: #333;
    --background-color: #fff;
}

.dark-mode {
    --primary-color: #6610f2;
    --secondary-color: #6c757d;
    --text-color: #f8f9fa;
    --background-color: #343a40;
}

body {
    background-color: var(--background-color);
    color: var(--text-color);
}

button {
    background-color: var(--primary-color);
    color: white;
    border: none;
    padding: 10px 15px;
    border-radius: 5px;
}
```

## Knowledge Reference

CSS3 Specification, MDN Web Docs CSS, W3C CSS Standards, Flexbox Froggy, CSS Grid Garden, Sass Documentation, Less Documentation, PostCSS, BEM methodology, SMACSS, OOCSS, Critical CSS, CSS-in-JS.

## Output Templates

Ao implementar recursos CSS, fornecer:
1.  Arquivo `.css` com estilos otimizados e bem comentados.
2.  Breve explicação sobre as técnicas de layout e estilização utilizadas.
3.  Confirmação de responsividade e compatibilidade (se aplicável).

## Ferramentas e Recursos

*   **Documentação Oficial**:
    *   [MDN Web Docs - CSS](https://developer.mozilla.org/pt-BR/docs/Web/CSS)
    *   [W3C CSS Current Work](https://www.w3.org/Style/CSS/current-work)
*   **Ferramentas de Desenvolvimento**:
    *   [Can I use...](https://caniuse.com/) (para verificar compatibilidade de recursos CSS)
    *   [Autoprefixer](https://autoprefixer.github.io/) (para adicionar prefixos de navegador automaticamente)
    *   [CSS Minifier](https://cssminifier.com/) (para otimização de arquivos CSS)
*   **Cursos e Tutoriais**:
    *   [Flexbox Froggy](https://flexboxfroggy.com/#pt-br)
    *   [CSS Grid Garden](https://cssgridgarden.com/#pt-br)
    *   [freeCodeCamp - Responsive Web Design](https://www.freecodecamp.org/learn/responsive-web-design/)

## Tópicos Avançados e Pesquisa Futura

- **CSS-in-JS**: Abordagens para escrever CSS usando JavaScript, como Styled Components, Emotion, CSS Modules.
- **Container Queries**: Novas funcionalidades CSS que permitem estilizar elementos com base no tamanho do seu contêiner, não apenas no viewport.
- **Subgrid**: Extensão do CSS Grid para permitir que itens aninhados herdem a estrutura de grid do pai.
- **CSS Houdini**: APIs de baixo nível que expõem partes do motor de renderização do CSS, permitindo aos desenvolvedores estender o CSS com JavaScript.
- **CSS Logical Properties**: Propriedades que se baseiam em fluxos de escrita (horizontal, vertical) em vez de direções físicas (top, left).

## Perguntas Frequentes (FAQ)

*   **P: Qual a diferença entre `em` e `rem` e quando usar cada um?**
    *   R: Ambos `em` e `rem` são unidades de medida relativas. `em` é relativo ao tamanho da fonte do elemento pai, o que pode levar a um efeito cascata indesejado onde o tamanho da fonte se torna progressivamente maior ou menor em elementos aninhados. `rem` (root em) é relativo ao tamanho da fonte do elemento raiz (`<html>`), o que oferece maior previsibilidade e facilidade de manutenção, pois alterar o tamanho da fonte base afeta todos os elementos proporcionalmente. Use `rem` para tipografia e espaçamentos globais para manter a escala, e `em` para elementos que precisam escalar em relação ao seu próprio contexto, como `padding` ou `margin` dentro de um componente específico.

*   **P: Quando devo usar Flexbox e quando devo usar CSS Grid?**
    *   R: **Flexbox** é ideal para layouts unidimensionais, ou seja, quando você precisa organizar itens em uma única linha ou coluna. É excelente para alinhar itens, distribuir espaço e criar componentes como barras de navegação, cards ou formulários. **CSS Grid** é projetado para layouts bidimensionais, permitindo que você organize itens em linhas e colunas simultaneamente. É perfeito para o layout geral da página (header, sidebar, main content, footer) ou para galerias de imagens complexas. Em muitos casos, eles podem ser usados em conjunto: Grid para o layout macro da página e Flexbox para o alinhamento e distribuição de itens dentro de uma célula do Grid.

## Cenários de Aplicação Real (Case Studies)

*   **Case Study 1: Bootstrap (Framework CSS)**
    *   **Desafio**: Fornecer um conjunto consistente de estilos e componentes responsivos para o desenvolvimento web rápido.
    *   **Solução**: O Bootstrap utiliza amplamente Flexbox e Media Queries para seu sistema de grid responsivo, além de variáveis CSS para temas e personalização. Ele demonstra como um CSS bem estruturado pode ser reutilizável e adaptável a diversos projetos.
    *   **Resultados**: Acelera o desenvolvimento, garante consistência visual e oferece uma base sólida para a responsividade, sendo um dos frameworks CSS mais populares.
    *   **Referências**: [Documentação Oficial do Bootstrap](https://getbootstrap.com/docs/5.3/)

## Referências

[1] [MDN Web Docs - CSS](https://developer.mozilla.org/pt-BR/docs/Web/CSS)
[2] [W3C CSS Current Work](https://www.w3.org/Style/CSS/current-work)
[3] [Flexbox Froggy](https://flexboxfroggy.com/#pt-br)
[4] [CSS Grid Garden](https://cssgridgarden.com/#pt-br)
[5] [Documentação Oficial do Bootstrap](https://getbootstrap.com/docs/5.3/)
