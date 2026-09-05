# Portfolio Matheus Migliorini — V10.1

Correção da V10.

O problema visto no print era uma mistura de versões:
o navegador carregou o HTML novo da V10, mas continuou usando o CSS antigo em cache.
Por isso a foto apareceu gigante e os cards/cabeçalho não receberam o novo visual.

## Correções
- CSS renomeado para `style-v10-1.css`;
- JavaScript dos porquinhos renomeado para `pets-v10-1.js`;
- todas as páginas apontam para os arquivos novos;
- `_headers` adicionado para reduzir problemas de cache nas próximas versões;
- corrigido `overflow:hidden` herdado da versão antiga no desktop;
- adicionada trava de segurança no tamanho da foto do hero;
- Hamtaro e Totoro continuam preservados.

## Commit sugerido
`Fix V10 cached assets and desktop layout`
