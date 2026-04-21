# PWA: Manifest Web App

## Introdução

O Manifest Web App é um componente essencial de qualquer Progressive Web App (PWA), servindo como o arquivo de metadados que informa ao navegador e ao sistema operacional como a aplicação web deve se comportar quando instalada. Ele é um arquivo JSON que define propriedades visuais e operacionais, como o nome do aplicativo, ícones, cores de tema e a URL de início. Sem um manifest válido, o navegador não pode oferecer a experiência de instalação ("Add to Home Screen") e o PWA não pode ser tratado como uma entidade independente no dispositivo. Para entender como o Manifest se integra ao ecossistema Android, consulte `[[PWA: Considerações para Android]]`.

## Glossário Técnico

*   **Manifest Web App**: Um arquivo JSON (geralmente `manifest.json`) que fornece metadados sobre um PWA.
*   **Web App Manifest Specification**: O padrão da W3C que define a estrutura e o comportamento do arquivo manifest.
*   **Standalone**: Um modo de exibição onde o PWA abre sem a interface do navegador (barra de URL, botões de navegação), parecendo um aplicativo nativo.
*   **Splash Screen**: A tela de carregamento inicial exibida enquanto o PWA está sendo iniciado a partir da tela inicial.
*   **Short Name**: O nome curto do aplicativo, usado em locais com espaço limitado, como abaixo do ícone na tela inicial.
*   **Start URL**: A página que o PWA deve carregar inicialmente quando aberto a partir do ícone instalado.

## Conceitos Fundamentais

O Manifest Web App permite que os desenvolvedores controlem a "identidade" da sua aplicação web fora das abas do navegador.

### Propriedades Essenciais

*   **Identidade**: `name` (nome completo) e `short_name` (nome para a tela inicial).
*   **Visual**: `icons` (array de ícones em diferentes tamanhos), `background_color` (cor da splash screen) e `theme_color` (cor da barra de status).
*   **Comportamento de Exibição**: `display` (pode ser `fullscreen`, `standalone`, `minimal-ui` ou `browser`) e `orientation` (e.g., `portrait`, `landscape`).
*   **Ponto de Entrada**: `start_url` define onde a experiência do usuário começa. Deve ser uma URL relativa à localização do manifest.

## Exemplos Práticos

### manifest.json Completo

```json
{
  "name": "Gerenciador de Tarefas Pro",
  "short_name": "Tarefas Pro",
  "description": "Um PWA avançado para gestão de produtividade offline.",
  "start_url": "/index.html?utm_source=pwa",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2196F3",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

**Nota Técnica**: O uso de `purpose: "any maskable"` permite que o Android adapte o ícone a diferentes formatos (círculo, quadrado, esquilo) sem cortar partes importantes da imagem.

## Boas Práticas

*   **Validação**: Use ferramentas como o Lighthouse ou o validador do Chrome DevTools para garantir que o manifest não tenha erros de sintaxe.
*   **Ícones de Alta Qualidade**: Forneça pelo menos um ícone de 192x192px e um de 512x512px para garantir nitidez em telas de alta densidade (Retina/AMOLED).
*   **Tema Coeso**: Combine a `theme_color` do manifest com a tag `<meta name="theme-color">` no seu HTML para uma transição visual suave.

## Referências

[1] [W3C Web App Manifest Standard](https://www.w3.org/TR/appmanifest/)
[2] [MDN Web Docs: Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
