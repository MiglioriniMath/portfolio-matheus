# Portfolio Matheus Migliorini — V11.5

## Cabeçalho
- remove a assinatura temporária `Math`;
- o espaço esquerdo fica visualmente vazio por enquanto;
- navegação centralizada;
- `Fale comigo` continua abrindo o WhatsApp.

## Nomes
- Work → Trabalhos
- Notes → Anotações
- Photos → Álbum
- About → Sobre Mim
- CV permanece CV

Os títulos/metadados das páginas também foram atualizados.

## Performance das interações
- hover dos botões caiu para ~105–165 ms;
- removidas animações de `box-shadow` e `filter` dos botões comuns;
- menos camadas promovidas para GPU;
- removido blur pesado de todos os cards;
- apenas o header mantém um blur leve no desktop.

## Fundo
O mockup enviado foi usado apenas como referência visual.
O novo fundo usa grandes gradientes branco/cinza-azulados já suaves,
sem aplicar um filtro blur de tela cheia. Isso mantém a aparência desfocada
com custo de renderização muito menor.

## Mantido
- foto da V11.4;
- rabisco artesanal;
- hover do `Math`, agora mais rápido;
- Hamtaro e Totoro;
- SEO, sitemap, Open Graph e links reais.

## Commit sugerido
`Refine navigation background and interaction performance`
