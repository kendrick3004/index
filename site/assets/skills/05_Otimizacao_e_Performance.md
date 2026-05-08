# PWA para Android: Otimização e Performance

## Introdução
Esta skill foca em como tornar sua PWA extremamente rápida e eficiente no Android. A performance é o que separa uma PWA de um site comum.

## Glossário Técnico
*   **Lighthouse**: Ferramenta de auditoria do Google.
*   **Core Web Vitals**: Métricas de performance (LCP, FID, CLS).
*   **Lazy Loading**: Carregamento sob demanda de recursos.

## Conceitos Fundamentais
A performance no Android é crucial, especialmente em dispositivos de entrada. O modelo **RAIL** (Response, Animation, Idle, Load) deve ser seguido à risca.

### Subtópico 1.1: Métricas de Performance (Core Web Vitals)
*   **LCP (Largest Contentful Paint)**: Tempo para o maior elemento de conteúdo carregar.
*   **FID (First Input Delay)**: Tempo para o app responder ao primeiro clique.
*   **CLS (Cumulative Layout Shift)**: Estabilidade visual da página.

### Subtópico 1.2: Otimização de Imagens e Recursos
*   **WebP/AVIF**: Formatos de imagem modernos e leves.
*   **Code Splitting**: Dividir o JavaScript em pedaços menores.
*   **Tree Shaking**: Remover código não utilizado.

## Exemplos Práticos
```javascript
// Exemplo de Lazy Loading de imagens
<img src="imagem.jpg" loading="lazy" alt="Descrição da imagem">
```

## Referências Cruzadas
*   A performance depende de `[[Front-end: CSS Otimização]]`.
*   O carregamento rápido exige `[[Back-end: Caching e CDN]]`.
