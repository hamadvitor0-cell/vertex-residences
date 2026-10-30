# VERTEX RESIDENCES

Experiência imobiliária cinematográfica e responsiva, criada para o portfólio da [Viham Dev](https://vitorhamad.me). Empreendimento fictício; todas as imagens, plantas, configurações e informações comerciais são conceituais.

**[Abrir a experiência](https://vertex-residences.vercel.app)** · [Apresentação do empreendimento](https://vertex-residences.vercel.app/apresentacao.html) · [Validação](docs/VALIDATION.md)

Publicado na Vercel, com o repositório GitHub conectado para deploys automáticos da branch `main`.

## Executar

Requer Node.js 22.12+ (validado com Node 24).

```sh
npm ci
npm run dev
```

Abra o endereço informado pelo Vite. Para a versão de produção:

```sh
npm run lint
npm test
npm run build
npm run preview
```

## Experiência

- Torre procedural de 22 pavimentos em Three.js: fundação, lajes, pilares, vidros, brises, iluminação e rooftop são elementos separados.
- Scroll reversível com câmera contínua: subida, órbita, aproximação de uma abertura real no 14º pavimento e entrada em um living modelado em 3D.
- Final híbrido: após atravessar a abertura, o living 3D dá lugar a uma renderização de alta qualidade. O render é ilustrativo e não reproduz cada detalhe do modelo procedural.
- Três plantas SVG selecionáveis, com navegação por setas, ampliação e interesse pré-preenchido.
- Quatro renderizações originais em WebP, galeria com filtros e lightbox navegável por teclado.
- Mapa artístico com pontos selecionáveis; não utiliza coordenadas ou endereços reais.
- Formulário com validação, escolha de data e horário, confirmação de simulação e apresentação imprimível.
- Menu mobile em diálogo nativo, gerenciamento de foco, Escape, skip link, foco visível e preferência de movimento reduzido.

## Formulário demonstrativo

O formulário **não envia nem armazena dados**, não cria agendamentos e não aciona WhatsApp ou e-mail. A apresentação abre localmente em `/apresentacao.html`, com opção de imprimir ou salvar em PDF pelo navegador. Para uma operação comercial real, conectar um serviço de leads e substituir o fluxo de sucesso e os textos de demonstração. Não incluir segredos em variáveis `VITE_*`.

## Arquitetura

```text
src/
  components/
    hero/          # Sticky, capítulos e fallback arquitetônico
    scene/         # Modelo, câmera, interior, materiais e luz
    sections/      # Projeto, plantas, ambientes, localização e contato
    forms/         # Captação demonstrativa
    layout/        # Navegação e rodapé
    ui/            # Logo SVG e diálogos acessíveis
  data/            # Conteúdo do empreendimento
  hooks/           # Scroll e preferências de movimento
  lib/             # Timeline determinística e validação
public/
  images/          # Renders otimizados locais
  apresentacao.html
tests/             # Construção reversível e regras do formulário
```

O Three.js é carregado em um módulo separado. O renderizador só redesenha quando o progresso ou o tamanho muda e suspende os desenhos fora da área visível. Mobile limita a resolução, reduz objetos e desativa sombras. Se o WebGL falhar, a representação SVG preserva a construção por etapas; todo o conteúdo comercial continua disponível. Com movimento reduzido, a torre é exibida completa e a experiência longa de scroll é removida.

## Deploy na Vercel

O projeto inclui `vercel.json`. Importe este repositório na Vercel com o preset **Vite**, build `npm run build` e saída `dist`, ou execute:

```sh
npx vercel --prod
```

Não exige variáveis de ambiente nem backend. As fontes são distribuídas localmente via Fontsource. Atualize as URLs absolutas de Open Graph ao vincular um domínio próprio.

## Identidade e imagens

Logo principal: `public/vertex-logo.svg`; favicon: `public/favicon.svg`. Fontes: Cormorant Garamond e Manrope, distribuídas com suas licenças pelos respectivos pacotes. Ícones: Lucide. Renders originais gerados pela ferramenta integrada de imagens e otimizados em WebP. Os prompts e destinos constam em [docs/ASSETS.md](docs/ASSETS.md).
