# Portfolio Matheus Migliorini — V11.6 Ambient Gradient

## Fundo
Implementação de um ambient gradient inspirado em macOS:
- base predominantemente branca/off-white;
- grandes manchas difusas em azul acinzentado;
- manchas quentes em bege muito suave;
- cores concentradas nas bordas e atrás dos cards;
- sem degradê linear visível;
- somente duas camadas ambientais com blur;
- baixa opacidade e saturação reduzida.

## Glassmorphism
- branco translúcido;
- backdrop blur discreto;
- borda branca fina;
- sombra extremamente leve;
- blur aplicado só nas superfícies principais;
- elementos internos não duplicam o efeito.

## Performance
- somente duas camadas grandes recebem blur;
- botões e elementos pequenos não usam backdrop-filter;
- no mobile o blur é reduzido;
- cards mobile usam transparência sem blur;
- animações continuam curtas e baseadas em transform;
- Hamtaro e Totoro permanecem intactos.

## Commit sugerido
`Add performance-friendly macOS ambient gradient`
