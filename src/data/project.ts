export const navigation = [
  { href: '#inicio', label: 'Início' },
  { href: '#projeto', label: 'O projeto' },
  { href: '#plantas', label: 'Plantas' },
  { href: '#ambientes', label: 'Ambientes' },
  { href: '#localizacao', label: 'Localização' },
  { href: '#contato', label: 'Contato' },
];

export const plans = [
  {
    id: 'essencial',
    name: 'Essencial',
    area: 98,
    suites: 2,
    bathrooms: 3,
    parking: 2,
    description: 'Espaços conectados. Uma rotina mais leve.',
    detail:
      'Living e jantar integrados, cozinha aberta, lavabo e varanda contínua. Duas suítes preservam a privacidade de cada morador.',
    terrace: 'Varanda integrada',
    type: 'Apartamento',
  },
  {
    id: 'panorama',
    name: 'Panorama',
    area: 128,
    suites: 3,
    bathrooms: 4,
    parking: 2,
    description: 'Amplitude para viver no seu ritmo.',
    detail:
      'Três suítes, living com duas frentes de luz e varanda gourmet. Circulação independente entre os espaços sociais e a área íntima.',
    terrace: 'Varanda gourmet',
    type: 'Apartamento',
  },
  {
    id: 'horizonte',
    name: 'Horizonte',
    area: 196,
    suites: 3,
    bathrooms: 5,
    parking: 3,
    description: 'Uma perspectiva reservada da cidade.',
    detail:
      'Cobertura com três suítes, estar ampliado e terraço privativo. Espaço para reunir, receber e aproveitar a cidade do alto.',
    terrace: 'Terraço privativo',
    type: 'Cobertura',
  },
] as const;

export const gallery = [
  {
    src: '/images/living.webp',
    alt: 'Living com sofá claro, painéis de madeira, mesa de travertino e iluminação acolhedora.',
    title: 'Living integrado',
    category: 'Interiores',
    note: 'Luz, matéria e espaço em equilíbrio.',
  },
  {
    src: '/images/suite.webp',
    alt: 'Suíte em tons de areia e madeira, com janelas amplas e vista da cidade ao entardecer.',
    title: 'Suíte principal',
    category: 'Interiores',
    note: 'O silêncio também faz parte do projeto.',
  },
  {
    src: '/images/rooftop.webp',
    alt: 'Piscina no rooftop com paisagismo, espreguiçadeiras e horizonte urbano ao anoitecer.',
    title: 'Rooftop & piscina',
    category: 'Áreas comuns',
    note: 'Um respiro acima do movimento.',
  },
  {
    src: '/images/facade.webp',
    alt: 'Perspectiva da torre Vertex ao entardecer, com varandas de cantos arredondados, vidro e detalhes em bronze.',
    title: 'Arquitetura em perspectiva',
    category: 'Arquitetura',
    note: 'Uma silhueta que acolhe o horizonte.',
  },
] as const;

export const chapters = [
  { name: 'Origem', progress: 0 },
  { name: 'Estrutura', progress: 0.34 },
  { name: 'Fachada', progress: 0.68 },
  { name: 'Interior', progress: 1 },
];
