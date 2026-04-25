# PWA: Capacidades Nativas

## Introdução

As capacidades nativas de um Progressive Web App (PWA) referem-se às APIs web modernas que permitem acesso a funcionalidades de hardware e sistema operacional anteriormente restritas a aplicativos compilados (nativos). Isso inclui acesso a câmeras, microfones, sensores de movimento, geolocalização e notificações push. Essas capacidades são fundamentais para criar experiências imersivas e funcionais em dispositivos móveis, como o Android. Para entender a integração com o ambiente nativo, consulte `[[Desenvolvimento Android: Fundamentos]]`.

## Glossário Técnico

*   **Web Share API**: Permite que o PWA use o menu de compartilhamento nativo do sistema operacional.
*   **Contact Picker API**: API para que o PWA selecione contatos da agenda do usuário de forma segura.
*   **Web Bluetooth API**: Permite a comunicação com dispositivos Bluetooth de baixa energia (BLE) diretamente do navegador.
*   **Geolocation API**: Fornece a localização geográfica precisa do dispositivo (latitude e longitude).
*   **MediaDevices API**: Acesso a câmeras e microfones para captura de áudio e vídeo.
*   **Vibration API**: Permite que o PWA acione o motor de vibração do dispositivo para feedback tátil.

## Conceitos Fundamentais

As capacidades nativas de um PWA são estendidas através de APIs web modernas, permitindo que a web "fale" com o hardware do dispositivo de forma segura.

### APIs de Engajamento e Hardware

*   **Notificações Push**: Usando a Push API e a Notifications API, Service Workers podem receber mensagens de um servidor e exibir notificações ao usuário, mesmo quando o PWA não está em uso ativo.
*   **Geolocalização**: A Geolocation API permite que o PWA obtenha a localização geográfica do dispositivo, essencial para mapas e serviços baseados em localização.
*   **Acesso a Câmera e Microfone**: A MediaDevices API permite a captura de áudio e vídeo, fundamental para aplicativos de videoconferência, leitura de QR codes e realidade aumentada.
*   **Feedback Tátil**: A Vibration API permite que o PWA forneça feedback tátil ao usuário através do motor de vibração do dispositivo.

## Exemplos Práticos

### Exemplo: Usando a Web Share API

Este código demonstra como compartilhar conteúdo usando o menu nativo do Android.

```javascript
const shareData = {
  title: 'Meu PWA Incrível',
  text: 'Confira este conteúdo incrível!',
  url: 'https://meu-pwa.com'
};

const btn = document.querySelector('button');

btn.addEventListener('click', async () => {
  try {
    if (navigator.share) {
      await navigator.share(shareData);
      console.log('Conteúdo compartilhado com sucesso!');
    } else {
      console.log('Web Share API não suportada neste navegador.');
    }
  } catch (err) {
    console.error('Erro ao compartilhar:', err);
  }
});
```

### Exemplo: Obtendo Geolocalização

```javascript
if ('geolocation' in navigator) {
  navigator.geolocation.getCurrentPosition(position => {
    console.log(`Latitude: ${position.coords.latitude}, Longitude: ${position.coords.longitude}`);
  }, error => {
    console.error('Erro ao obter localização:', error.message);
  });
}
```

## Boas Práticas

*   **Verificação de Suporte**: Sempre verifique se a API é suportada no navegador atual antes de tentar usá-la (`if ('share' in navigator)`).
*   **Permissões**: Solicite permissões apenas quando necessário e explique o motivo ao usuário para aumentar as chances de aceitação.
*   **Fallback**: Forneça uma alternativa funcional caso a API nativa não esteja disponível.

## Referências

[1] [Google Developers: Web Capabilities (Project Fugu)](https://web.dev/fugu-status/)
[2] [MDN Web Docs: Web APIs](https://developer.mozilla.org/en-US/docs/Web/API)
