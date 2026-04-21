# PWA para Android: Capacidades Nativas e Trusted Web Activities (TWA)

## Introdução
Esta skill explora como as PWAs no Android podem acessar hardware nativo e como podem ser publicadas na Google Play Store usando **Trusted Web Activities (TWA)**.

## Glossário Técnico
*   **TWA (Trusted Web Activity)**: Protocolo para abrir PWAs a partir de apps Android nativos.
*   **Project Fugu**: Iniciativa para trazer APIs nativas para a web.
*   **Web Bluetooth API**: Acesso a dispositivos Bluetooth via navegador.

## Conceitos Fundamentais
As PWAs não estão mais limitadas a apenas exibir conteúdo. Elas podem acessar GPS, Câmera, Microfone, Bluetooth, USB e até o sistema de arquivos local.

### Subtópico 1.1: Acesso a Hardware no Android
O Android permite que PWAs acessem recursos como:
*   **Geolocalização**: Localização precisa do usuário.
*   **Câmera e Microfone**: Captura de mídia.
*   **Sensores**: Acelerômetro, giroscópio e sensor de luz.

### Subtópico 1.2: Publicação na Google Play Store (TWA)
O TWA permite que você empacote sua PWA em um arquivo APK/AAB e o envie para a Play Store. Isso dá ao seu app visibilidade na loja, enquanto o conteúdo continua sendo servido pela web.

## Exemplos Práticos
```javascript
// Exemplo de acesso à geolocalização
navigator.geolocation.getCurrentPosition(position => {
  console.log('Latitude:', position.coords.latitude);
  console.log('Longitude:', position.coords.longitude);
});
```

## Referências Cruzadas
*   O acesso a hardware exige permissões de `[[Web Security: Permissões]]`.
*   O empacotamento TWA requer conhecimentos de `[[Android: Build Systems]]`.
