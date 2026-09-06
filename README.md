# Portfolio Matheus Migliorini — V12.2 Mobile Polish

Ajustado a partir do print real do iPhone.

## Cabeçalho mobile
- todos os 5 itens aparecem: Trabalhos, Anotações, Álbum, Sobre Mim e CV;
- removida a regra antiga que escondia Álbum;
- navegação realmente centralizada;
- botão Fale comigo fica oculto no mobile para não apertar o menu.

## Meus últimos trabalhos
- um único trabalho visível por vez;
- já abre assim antes mesmo do JS terminar de carregar;
- troca automática a cada ~3,3 segundos;
- atual sobe e próximo entra por baixo;
- somente transform + opacity;
- pausa em aba oculta;
- reduced-motion desativa a animação.

## Onde me encontrar
- o footer existente vira um popup real;
- fica fixo/flutuando na parte inferior;
- só aparece quando o visitante chega próximo ao fim da página;
- contém apenas Instagram, LinkedIn e WhatsApp;
- os três links usam SVG inline, sem biblioteca de ícones;
- nenhum DOM de contatos foi duplicado.

## Performance
- nenhuma imagem nova;
- nenhum framework;
- um JS pequeno e isolado do `pets-v11.js`;
- porquinhos permanecem intactos;
- desktop não foi redesenhado.

## Commit sugerido
`Polish iPhone navigation rotating work and contact popup`
