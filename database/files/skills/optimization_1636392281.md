# PWA: Otimização e Performance

## Introdução

A otimização de um Progressive Web App (PWA) é crucial para garantir que ele seja rápido, confiável e envolvente. PWAs bem otimizados oferecem uma experiência de usuário superior, reduzindo o tempo de carregamento inicial, garantindo uma interação fluida e proporcionando funcionalidades offline consistentes. Ferramentas como o Lighthouse e métricas como as Core Web Vitals são fundamentais para identificar e corrigir gargalos de performance. Para mais detalhes sobre otimização de performance web, consulte `[[Performance Web: Otimização e Métricas]]`.

## Glossário Técnico

*   **Lighthouse**: Ferramenta de auditoria automatizada do Google para melhorar a qualidade de páginas web, incluindo métricas de performance, acessibilidade, SEO e PWA.
*   **Core Web Vitals**: Conjunto de métricas de performance web focadas na experiência do usuário, incluindo Largest Contentful Paint (LCP), First Input Delay (FID) e Cumulative Layout Shift (CLS).
*   **Largest Contentful Paint (LCP)**: Tempo de carregamento do maior elemento visível na tela.
*   **First Input Delay (FID)**: Tempo de resposta do navegador à primeira interação do usuário.
*   **Cumulative Layout Shift (CLS)**: Medida da estabilidade visual da página durante o carregamento.
*   **Lazy Loading**: Técnica de adiar o carregamento de recursos não críticos até que sejam necessários.
*   **Minificação**: Processo de remover caracteres desnecessários (espaços, comentários) do código para reduzir o tamanho do arquivo.

## Conceitos Fundamentais

A otimização de um PWA envolve a melhoria de diversos aspectos da aplicação, desde o carregamento inicial até a interação contínua.

### Estratégias de Otimização

*   **Otimização de Imagens**: Use formatos modernos (e.g., WebP), comprima imagens e forneça diferentes tamanhos para diferentes resoluções de tela.
*   **Minificação e Compressão**: Minifique CSS, JavaScript e HTML. Use compressão Gzip ou Brotli no servidor para reduzir o tamanho dos arquivos transferidos.
*   **Lazy Loading**: Implemente *lazy loading* para imagens e vídeos fora da tela inicial para acelerar o carregamento da página.
*   **Priorização de Recursos**: Use `<link rel="preload">` e `<link rel="preconnect">` para priorizar o carregamento de recursos críticos.
*   **Monitoramento de Core Web Vitals**: Acompanhe as métricas de performance para garantir que o PWA atenda aos padrões de experiência do usuário.

## Exemplos Práticos

### Exemplo: Implementando Lazy Loading para Imagens

```html
<img src="imagem-pequena.jpg" data-src="imagem-grande.jpg" alt="Exemplo de Lazy Loading" class="lazy">

<script>
  document.addEventListener("DOMContentLoaded", function() {
    var lazyImages = [].slice.call(document.querySelectorAll("img.lazy"));

    if ("IntersectionObserver" in window) {
      let lazyImageObserver = new IntersectionObserver(function(entries, observer) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            let lazyImage = entry.target;
            lazyImage.src = lazyImage.dataset.src;
            lazyImage.classList.remove("lazy");
            lazyImageObserver.unobserve(lazyImage);
          }
        });
      });

      lazyImages.forEach(function(lazyImage) {
        lazyImageObserver.observe(lazyImage);
      });
    }
  });
</script>
```

## Boas Práticas

*   **Use Lighthouse**: Realize auditorias regulares com o Lighthouse para identificar oportunidades de melhoria.
*   **Otimize para Core Web Vitals**: Foque em melhorar LCP, FID e CLS para garantir uma experiência de usuário de alta qualidade.
*   **Teste em Redes Lentas**: Use as ferramentas de desenvolvedor do navegador para simular conexões de rede lentas e garantir que o PWA ainda seja utilizável.

## Referências

[1] [Google Developers: Lighthouse Overview](https://developer.chrome.com/docs/lighthouse/overview/)
[2] [Web.dev: Core Web Vitals](https://web.dev/vitals/)
