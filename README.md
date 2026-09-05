# Portfolio Matheus Migliorini — V11 Performance

Foco: velocidade + Home em uma única visualização.

- Home sem scroll em desktop e mobile;
- layout recalibrado para caber em um viewport;
- avatar AVIF (~34 KB) + WebP (~68 KB), mantendo PNG apenas como fallback;
- sprites dos porquinhos reduzidos de ~1,2 MB para ~100 KB no total;
- Hamtaro e Totoro iniciam sentados juntos no canto inferior direito;
- após ~3,2 segundos, começam a se mover automaticamente;
- dois toques no mobile ainda acordam os dois mais cedo;
- animação limitada a ~30 FPS;
- animação pausa quando a aba fica em segundo plano;
- removidos blurs pesados da maioria dos cards;
- cache longo para assets versionados; HTML continua sem cache;
- botões refinados para um visual macOS mais limpo;
- copy da Home encurtada para ficar mais editorial e leve.

Commit sugerido: `Optimize performance and fit home to one viewport`
