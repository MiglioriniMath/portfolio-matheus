# V11.8 — CSS review pass

Esta versão é propositalmente conservadora.

## NÃO alterado
- `pets-v11.js`
- estrutura dos componentes
- imagens
- lazy loading / preload
- sprites / comportamento dos porquinhos
- piada Goku / Math
- grid HTML
- SEO

## CSS alterado
1. `--accent` virou a fonte única do vermelho de assinatura.
2. O antigo card flutuante `Anotações` virou uma faixa ancorada no rodapé do card da foto.
   O conteúdo ainda é o antigo; título/data do último post ficam para a etapa estrutural.
3. Porquinhos agora ficam atrás dos cards no stacking context, evitando a sensação de colisão.
   O raio real de movimento ainda NÃO foi alterado; isso será um passo JS isolado.
4. Os três primeiros itens do grid recebem hierarquia visual de case.
   Os três últimos ficam mais leves como categorias/arquivo.
5. A tagline existente no rodapé ganhou mais presença sem duplicar DOM.
6. Hovers continuam apenas em transform/background/border, sem animar blur/sombra.

## Próxima etapa sugerida, depois da revisão desta
- JS isolado para limitar o raio de movimento dos porquinhos.
- depois HTML mínimo: transformar Anotações em preview real (título + data).
- por último, se aprovado, thumbnails leves apenas nos 3 cases.
