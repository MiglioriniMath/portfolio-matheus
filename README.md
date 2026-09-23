# Portfólio — Matheus Migliorini

Site pessoal em HTML/CSS/JS, publicado pela Cloudflare Pages.

## Estrutura ativa

```txt
/
├─ index.html
├─ work.html
├─ notes.html
├─ about.html
├─ 404.html
├─ posts/
├─ clientes/
│  └─ index.html
├─ assets/
│  └─ portfolio/
├─ styles/
│  ├─ site-shell-v1.css
│  └─ estudio-historias-v1.css
├─ scripts/
│  ├─ site-shell-v1.js
│  └─ estudio-historias-v1.js
├─ style-v12-5.css
├─ blog-v1.css
├─ about-v2.css
├─ portfolio-v13-3.css
├─ portfolio-v13-4.css
├─ portfolio-v13-4.js
├─ pets-v12-5.js
├─ mobile-ui-v12-4.js
├─ _headers
├─ _redirects
├─ sitemap.xml
└─ robots.txt
```

## Páginas principais

- Home: `index.html`
- Portfólio Criativo: `work.html`
- Blog / Anotações: `notes.html`
- Sobre Mim: `about.html`
- Área de clientes: `clientes/index.html`

CV e Álbum foram removidos temporariamente do menu. Os caminhos antigos redirecionam para a Home por meio de `_redirects`.

## Header compartilhado

A base do header compartilhado está em `scripts/site-shell-v1.js`.
Ele monta o menu padrão:

- Portfólio Criativo
- Anotações
- Sobre Mim

O CSS de microinterações do header está em `styles/site-shell-v1.css`.

## Identidade compartilhada

A fase atual começou a consolidar uma identidade visual comum entre as páginas:

- tokens de cor e sombra em `styles/site-shell-v1.css`;
- microinterações padronizadas no header e em CTAs;
- linguagem visual baseada em cards leves, vidro sutil, tipografia limpa e hierarquia editorial;
- blocos comerciais reutilizáveis para a Home e próximas páginas.

## Estúdio de Histórias

A área de clientes começou em `clientes/index.html`.
Ela tem visual próprio, com sidebar flutuante à esquerda e sensação mais premium, mas ainda dentro do mesmo universo visual do site.

Primeiras ferramentas previstas:

- Radar Criativo: biblioteca de referências selecionadas à mão;
- Radar de Perfil: leitura inicial de presença digital para leads/clientes;
- Curadoria semanal: referências e ideias acionáveis para inspirar conteúdos.

Por enquanto, a área está em fase beta e com `noindex` em `_headers`, para não ser indexada enquanto ainda não tem proteção real de acesso.

## SEO

A Home foi reposicionada para termos mais comerciais:

- marketing;
- comunicação;
- storytelling;
- criação de conteúdo;
- fotografia;
- vídeo;
- sites;
- presença digital;
- Sorocaba/SP.

O `sitemap.xml` agora inclui `lastmod`, `changefreq` e `priority` nas URLs principais.

## Performance

- HTML e páginas de post ficam com `no-cache` durante a fase de ajustes rápidos.
- Assets estáveis usam cache forte quando possível.
- Vídeos do portfólio carregam apenas quando o visitante clica para assistir.
- A área de clientes usa cards, texto e miniaturas conceituais; vídeos e mídias pesadas devem ficar fora do GitHub quando o Radar Criativo for implementado.
- Arquivos antigos de versões anteriores foram removidos após criação da branch de backup.

## Backup

Antes da limpeza, foi criada a branch:

`backup-before-cleanup-2026-09-14`
