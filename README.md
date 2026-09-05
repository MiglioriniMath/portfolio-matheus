# Portfolio Matheus Migliorini — V9.1

Correção rápida da V9.

## Corrigido
- Hamtaro e Totoro voltam a aparecer.
- Mantidos: tamanho menor, movimentação pela tela inteira, sono, brincadeira entre eles e perseguição do cursor.

## Motivo do bug
A V9 reorganizou corretamente as folhas de sprite em uma grade 4×4, mas o CSS/JS ainda tratava cada quadro como se tivesse 320 px na tela.
Como os personagens são exibidos com cerca de 60 px, o navegador mostrava apenas a área transparente do quadro.

Agora a animação usa posicionamento percentual sobre a grade 4×4, que acompanha corretamente o tamanho visual de cada porquinho.

## Commit sugerido
`Fix pet sprite rendering`
