# PWA: Considerações para Android

## Introdução

As considerações para Android ao desenvolver um Progressive Web App (PWA) são fundamentais para garantir uma experiência de usuário de alta qualidade no ecossistema Android. O Android oferece recursos exclusivos para PWAs, como WebAPKs e Trusted Web Activities (TWAs), que permitem uma integração mais profunda com o sistema operacional. Compreender essas nuances é essencial para criar PWAs que se comportem como aplicativos nativos no Android. Para entender a integração com o ambiente nativo, consulte `[[Desenvolvimento Android: Fundamentos]]`.

## Glossário Técnico

*   **WebAPK**: Formato de pacote Android leve e otimizado gerado automaticamente pelo Chrome para PWAs instaláveis.
*   **Trusted Web Activity (TWA)**: Forma de integrar PWAs em aplicativos Android nativos para publicação na Google Play Store.
*   **Chrome Custom Tabs**: Tecnologia que permite que aplicativos Android abram URLs web em uma guia personalizada do Chrome dentro do próprio aplicativo.
*   **Play Store**: Loja de aplicativos oficial do Android.
*   **Digital Asset Links**: Mecanismo para verificar a propriedade de um domínio web para uso em TWAs.

## Conceitos Fundamentais

O Android oferece várias maneiras de integrar PWAs ao sistema operacional, desde a instalação simples na tela inicial até a publicação na Play Store.

### WebAPKs e TWAs

*   **WebAPK**: Quando um PWA atende aos critérios de instalabilidade no Chrome para Android, o Chrome gera automaticamente um WebAPK. Isso permite que o PWA apareça na gaveta de aplicativos, nas configurações do sistema e ofereça uma experiência de inicialização mais rápida e integrada.
*   **Trusted Web Activity (TWA)**: As TWAs permitem que desenvolvedores publiquem seus PWAs na Google Play Store. Uma TWA executa o PWA em uma guia personalizada do Chrome em tela cheia dentro de um aplicativo Android nativo. Isso permite a distribuição via loja e o acesso a funcionalidades nativas do Android através de código nativo.

## Exemplos Práticos

### Exemplo: Verificando Propriedade de Domínio para TWA

Para usar uma TWA, você deve verificar a propriedade do seu domínio web usando Digital Asset Links. Isso envolve a criação de um arquivo `.well-known/assetlinks.json` no seu servidor web.

```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.exemplo.meu_pwa",
    "sha256_cert_fingerprints": ["SHA256_FINGERPRINT_DO_SEU_APP"]
  }
}]
```

## Boas Práticas

*   **Otimize para Android**: Garanta que o PWA funcione perfeitamente em diferentes versões do Android e em dispositivos com diferentes tamanhos de tela.
*   **Use WebAPKs**: Certifique-se de que seu PWA atenda aos critérios de instalabilidade para que o Chrome possa gerar um WebAPK.
*   **Considere TWAs para a Play Store**: Se você deseja que seu PWA seja descoberto na Google Play Store, considere o uso de Trusted Web Activities.

## Referências

[1] [Google Developers: Trusted Web Activities](https://developer.chrome.com/docs/android/trusted-web-activity/)
[2] [Web.dev: PWAs on Android](https://web.dev/pwa-on-android/)
