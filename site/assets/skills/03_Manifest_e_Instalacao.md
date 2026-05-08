# PWA para Android: Manifest Web App e Instalação

## Introdução
Esta skill detalha o arquivo JSON que define a identidade visual e o comportamento de instalação da sua PWA no Android. O **Manifest Web App** é o que faz o site ser reconhecido como um app instalável.

## Glossário Técnico
*   **Manifest Web App**: Arquivo JSON com metadados do app.
*   **Short Name**: Nome exibido abaixo do ícone no launcher.
*   **Display Mode**: Define se o app abre em tela cheia ou com barra de endereço.

## Conceitos Fundamentais
O Manifest permite controlar como o app é exibido ao usuário: ícones, cores de tema, splash screen e orientação da tela.

### Subtópico 1.1: Configuração do Manifest
```json
{
  "name": "Meu Super App PWA",
  "short_name": "SuperApp",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

### Subtópico 1.2: Instalação no Android
No Android, o navegador Chrome verifica se o site atende aos critérios de PWA (HTTPS, Service Worker com fetch event, Manifest válido). Se sim, ele exibe o banner de instalação.

## Referências Cruzadas
*   A aparência do app depende de `[[Front-end: Design UI/UX]]`.
*   O ícone deve seguir as diretrizes de `[[Android: Design Systems]]`.
