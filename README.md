# Portfolio Matheus Migliorini — V11.7

## Visual
- manchas ambientais ficaram levemente mais azuis;
- azul continua acinzentado e pouco saturado;
- bege foi reduzido, permanecendo apenas como calor de fundo;
- cards continuam brancos/off-white e translúcidos;
- bordas brancas finas e sombras quase imperceptíveis;
- o efeito de glassmorphism fica mais evidente pelo contraste com o fundo.

## Performance
A principal mudança desta versão é técnica:
- removidos os dois `filter: blur()` gigantes da tela;
- o efeito desfocado agora vem diretamente de radial gradients com falloff longo;
- backdrop blur removido dos cards;
- somente o header usa blur real no desktop;
- no mobile nenhum card/header usa backdrop blur;
- hover caiu para ~80–105 ms;
- removida a animação de sombra/filter nos botões;
- removido o `:has()` que diminuía todos os outros links do menu durante hover;
- animação do `Math` agora usa somente `transform`.

Isso reduz repaints e recalculações de estilo durante o movimento do mouse.

## Mantido
- foto atual;
- rabisco artesanal;
- Hamtaro e Totoro;
- layout;
- responsividade;
- SEO e links.

## Commit sugerido
`Improve blue ambient glass and hover performance`
