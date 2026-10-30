# Validação

Verificações executadas em 30/10/2026, com Node.js 24.22.1.

## Automáticas

- `npm run lint`: sem erros.
- `npm test`: 8 testes aprovados (sequência de construção, reversibilidade, limites de progresso, formulário, datas e consentimento).
- `npm run build`: TypeScript e build de produção aprovados.
- `npm audit`: nenhuma vulnerabilidade encontrada.

O módulo de Three.js é carregado separadamente e tem aproximadamente 141 kB comprimidos em gzip. O Vite informa que o módulo excede 500 kB sem compressão. Ele não faz parte do bundle principal da interface.

## Navegador

Verificação visual em desktop, em 390 × 844 e em larguras de 320 e 768 px. Sem rolagem horizontal nos tamanhos inspecionados.

- Fundação, estrutura, fachada e interior acessíveis pelos capítulos e pelo scroll.
- Torre enquadrada no mobile e aproximação para o living.
- Menu mobile abre como diálogo, navega e devolve o foco ao fechar.
- Troca e ampliação das plantas; interesse pré-selecionado no formulário.
- Formulário vazio mostra erros; dados fictícios válidos, data, horário e consentimento concluem a simulação.
- Filtro de interiores mostra duas imagens; lightbox avança para a suíte e fecha com Escape.
- Seleção de áreas verdes no mapa atualiza o painel.
- Controle de movimento reduzido troca a narrativa longa por uma torre completa em uma única tela.
- Fontes e quatro imagens servidas localmente. Galeria e seções posteriores utilizam imagens com lazy loading.

Não foram feitos testes em dispositivos físicos nem uma auditoria completa de tecnologias assistivas. O formulário é uma demonstração e não transmite dados.

## Publicação

- Código publicado em `https://github.com/hamadvitor0-cell/vertex-residences`, com branch padrão `main`.
- Deploy de produção concluído pela Vercel com estado `READY`.
- URL pública: `https://vertex-residences.vercel.app`.
- Respostas HTTP 200 verificadas sem autenticação na página inicial, apresentação, favicon e imagens do living e da fachada.
- Repositório conectado à Vercel para atualizações automáticas.
- Arquivos de ambiente e dados locais da Vercel ignorados pelo Git e pelo upload de deploy.
