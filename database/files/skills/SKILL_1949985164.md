---
name: html-expert
description: Use when building web pages with semantic HTML5, focusing on accessibility, SEO, and proper document structure. Generates well-formed, valid HTML, ensures ARIA attributes are correctly applied, optimizes for search engine visibility, and integrates with modern web standards. Invoke for creating robust, maintainable, and universally accessible web content.
license: MIT
metadata:
  author: Manus AI
  version: "1.0.0"
  domain: frontend
  triggers: HTML5, semantic HTML, web accessibility, SEO, document structure, web standards
  role: specialist
  scope: implementation
  output-format: code
  related-skills: css-expert, javascript-pro, web-accessibility-auditor, seo-specialist
---

# HTML Expert

Especialista em HTML5 semântico, focado na criação de estruturas de documentos web robustas, acessíveis e otimizadas para motores de busca.

## Quando Usar Esta Skill

- Ao criar a estrutura fundamental de qualquer página web.
- Para garantir que o conteúdo web seja acessível a todos os usuários, incluindo aqueles com deficiências.
- Para otimizar páginas para melhor ranqueamento em motores de busca (SEO).
- Ao integrar HTML com CSS para estilização e JavaScript para interatividade.
- Para validar a conformidade do HTML com os padrões W3C.

## Core Workflow

1.  **Analisar Requisitos** — Entender o propósito da página, público-alvo e conteúdo principal.
2.  **Estruturar Conteúdo** — Utilizar elementos HTML5 semânticos (`<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<footer>`, etc.) para organizar o conteúdo de forma lógica.
3.  **Garantir Acessibilidade** — Aplicar atributos ARIA, texto alternativo para imagens, rótulos para formulários e estrutura de cabeçalhos adequada.
4.  **Otimizar para SEO** — Usar meta tags relevantes, títulos descritivos, URLs amigáveis e estrutura de conteúdo hierárquica.
5.  **Validar HTML** — Verificar a conformidade com os padrões W3C e corrigir erros.
6.  **Integrar** — Preparar o HTML para fácil integração com CSS e JavaScript.

## Reference Guide

Carregar orientações detalhadas com base no contexto:

| Tópico             | Referência                               | Carregar Quando                                    |
|--------------------|------------------------------------------|----------------------------------------------------|
| Semântica HTML5    | `references/semantic-html.md`            | Estrutura de documentos, novos elementos HTML5     |
| Acessibilidade Web | `references/web-accessibility.md`        | ARIA, WCAG, navegação por teclado, leitores de tela |
| SEO Básico         | `references/basic-seo.md`                | Meta tags, estrutura de conteúdo, URLs canônicas   |
| Formulários HTML   | `references/html-forms.md`               | Validação, tipos de input, acessibilidade de formulários |
| Multimídia         | `references/html-multimedia.md`          | `<img>`, `<video>`, `<audio>`, `<iframe>`         |

## Constraints

### MUST DO
- Utilizar HTML5 semântico para toda a estrutura do documento.
- Incluir `lang` atributo na tag `<html>`.
- Fornecer `alt` texto descritivo para todas as imagens (`<img>`).
- Usar elementos de cabeçalho (`<h1>` a `<h6>`) de forma hierárquica e lógica.
- Associar rótulos (`<label>`) a todos os controles de formulário.
- Garantir que a navegação por teclado seja funcional para todos os elementos interativos.
- Utilizar meta tags essenciais para SEO e responsividade (`viewport`, `charset`, `description`, `title`).
- Fechar todas as tags corretamente.

### MUST NOT DO
- Usar elementos não semânticos (`<div>`, `<span>`) onde um elemento semântico mais apropriado existe.
- Deixar imagens sem `alt` texto (a menos que sejam puramente decorativas e tratadas com `alt=""`).
- Pular níveis de cabeçalho (ex: `<h1>` direto para `<h3>`).
- Usar tabelas para layout.
- Inserir estilos CSS inline excessivamente (preferir folhas de estilo externas).
- Usar JavaScript para gerar conteúdo HTML estático que poderia ser escrito diretamente no HTML.

## Code Examples

### Estrutura Básica de Documento HTML5 Semântico
```html
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Descrição concisa da página para SEO">
    <title>Título da Página - Exemplo</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header>
        <nav>
            <ul>
                <li><a href="/">Início</a></li>
                <li><a href="/sobre">Sobre</a></li>
                <li><a href="/contato">Contato</a></li>
            </ul>
        </nav>
    </header>
    <main>
        <article>
            <h1>Título Principal do Artigo</h1>
            <p>Este é um parágrafo de exemplo.</p>
            <section>
                <h2>Subseção do Artigo</h2>
                <p>Mais conteúdo aqui.</p>
            </section>
        </article>
        <aside>
            <h3>Conteúdo Relacionado</h3>
            <ul>
                <li><a href="#">Link 1</a></li>
                <li><a href="#">Link 2</a></li>
            </ul>
        </aside>
    </main>
    <footer>
        <p>&copy; 2023 Meu Site. Todos os direitos reservados.</p>
    </footer>
    <script src="script.js"></script>
</body>
</html>
```

### Formulário Acessível com Validação Básica
```html
<form action="/submit" method="post">
    <p>
        <label for="nome">Nome:</label>
        <input type="text" id="nome" name="nome" required aria-required="true">
    </p>
    <p>
        <label for="email">Email:</label>
        <input type="email" id="email" name="email" required aria-required="true">
    </p>
    <p>
        <label for="mensagem">Mensagem:</label>
        <textarea id="mensagem" name="mensagem" rows="5" required aria-required="true"></textarea>
    </p>
    <button type="submit">Enviar</button>
</form>
```

## Knowledge Reference

HTML5 Specification, W3C Standards, WHATWG HTML Living Standard, WCAG (Web Content Accessibility Guidelines), ARIA (Accessible Rich Internet Applications), SEO best practices for HTML, Responsive Web Design principles.

## Output Templates

Ao implementar recursos HTML, fornecer:
1.  Arquivo `.html` com estrutura semântica completa.
2.  Breve explicação sobre as escolhas semânticas e de acessibilidade.
3.  Confirmação de validação W3C (se aplicável).

## Ferramentas e Recursos

*   **Documentação Oficial**:
    *   [MDN Web Docs - HTML](https://developer.mozilla.org/pt-BR/docs/Web/HTML)
    *   [W3C HTML Standard](https://html.spec.whatwg.org/multipage/)
*   **Ferramentas de Validação**:
    *   [W3C HTML Validator](https://validator.w3.org/)
    *   [Lighthouse (Google Developers)](https://developer.chrome.com/docs/lighthouse/overview/)
*   **Cursos e Tutoriais**:
    *   [freeCodeCamp - Responsive Web Design](https://www.freecodecamp.org/learn/responsive-web-design/)

## Tópicos Avançados e Pesquisa Futura

- **Web Components**: Criação de componentes reutilizáveis e encapsulados usando Custom Elements, Shadow DOM e HTML Templates.
- **HTML Semântico para Microdados/Schema.org**: Integração de vocabulários de microdados para enriquecer o SEO e a apresentação em resultados de busca.
- **Performance HTML**: Otimização do carregamento de recursos, `async` e `defer` para scripts, lazy loading de imagens e iframes.
- **HTML e PWA**: Como a estrutura HTML interage com Service Workers e Manifest para criar Progressive Web Apps.

## Perguntas Frequentes (FAQ)

*   **P: Qual a diferença fundamental entre `<div>` e `<section>` e quando devo usar cada um?**
    *   R: Enquanto `<div>` é um elemento genérico de agrupamento sem significado semântico intrínseco, `<section>` é um elemento semântico que representa uma seção genérica de conteúdo tematicamente agrupado. Use `<div>` para fins puramente estilísticos ou de script sem significado estrutural, e `<section>` para agrupar conteúdo relacionado que faria sentido em um índice de um documento. Por exemplo, um `<section>` pode conter um capítulo de um livro, um grupo de notícias ou uma aba de um aplicativo. Um `<div>` pode ser usado para agrupar elementos para aplicar um estilo CSS específico sem adicionar significado estrutural.

*   **P: Por que é importante usar `alt` texto em imagens?**
    *   R: O `alt` texto (texto alternativo) é crucial para a acessibilidade e SEO. Para acessibilidade, ele descreve a imagem para usuários com deficiência visual que utilizam leitores de tela. Para SEO, ele fornece contexto para os motores de busca, ajudando a indexar e classificar a imagem e a página. Se a imagem falhar ao carregar, o `alt` texto é exibido em seu lugar.

## Cenários de Aplicação Real (Case Studies)

*   **Case Study 1: Google Search e HTML Semântico**
    *   **Desafio**: Indexar e compreender bilhões de páginas web de forma eficiente para fornecer resultados de busca relevantes.
    *   **Solução**: O Google incentiva fortemente o uso de HTML semântico e microdados (Schema.org) para que seus algoritmos possam interpretar melhor o conteúdo e a estrutura das páginas. Isso inclui o uso correto de cabeçalhos, listas, parágrafos e elementos específicos como `<article>` e `<nav>`.
    *   **Resultados**: Melhor compreensão do conteúdo, resultados de busca mais precisos, e a capacidade de gerar Rich Snippets (resultados de busca aprimorados com informações adicionais).
    *   **Referências**: [Google Search Central - Guia de SEO para Iniciantes](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)

## Referências

[1] [MDN Web Docs - HTML: Elementos HTML](https://developer.mozilla.org/pt-BR/docs/Web/HTML/Element)
[2] [W3C HTML Standard - Seções e Estrutura](https://html.spec.whatwg.org/multipage/sections-and-outlines.html)
[3] [Google Search Central - Guia de SEO para Iniciantes](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
[4] [Web Content Accessibility Guidelines (WCAG) Overview](https://www.w3.org/WAI/standards-guidelines/wcag/)
[5] [ARIA Authoring Practices Guide (APG)](https://www.w3.org/WAI/ARIA/apg/)
