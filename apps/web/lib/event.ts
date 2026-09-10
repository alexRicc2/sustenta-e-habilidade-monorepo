export const event = {
  name: 'Sustenta & Habilidade',
  edition: 'II',
  year: 2026,
  tagline: 'Ações e Inovações em Química na Busca dos ODS',
  datesLabel: '05 e 06 de outubro de 2026',
  datesShort: '05 e 06 DE OUTUBRO DE 2026',
  startsAt: '2026-10-05T07:30:00-03:00',
  endsAt: '2026-10-06T18:00:00-03:00',
  location: 'Auditório A',
  campus: 'UNESP/IBILCE — São José do Rio Preto/SP',
  address: 'Rua Cristóvão Colombo, 2265, Jardim Nazareth, CEP 15054-000',
  department: 'Departamento de Química (DQ)',
  coordinator: {
    name: 'Prof. Dr. Mario Henrique Gonzalez',
    role: 'Coordenador',
  },
} as const

export const siteSeo = {
  title: 'II Sustenta & Habilidade — 2026',
  description:
    'Inscreva-se no II Sustenta & Habilidade: ações e inovações em Química na busca dos ODS. 05 e 06 de outubro de 2026, Auditório A, UNESP/IBILCE. Vagas abertas com pagamento via Pix.',
} as const

export const coordination = [
  {
    id: 'mario',
    name: 'Prof. Dr. Mario Henrique Gonzalez',
    role: 'Coordenador',
    photo: '/coordenacao/mario.jpeg',
    imagePosition: 'center 28%',
  },
  {
    id: 'paulo',
    name: 'Prof. Dr. Paulo Clairmont Feitosa de Lima Gomes',
    role: 'Colaborador externo',
    photo: '/coordenacao/paulo.jpeg',
    imagePosition: 'center 18%',
  },
  {
    id: 'clarice',
    name: 'Profa. Dra. Clarice Dias Britto do Amaral',
    role: 'Colaborador externo',
    photo: '/coordenacao/clarice.jpeg',
    imagePosition: 'center 18%',
  },
] as const

export const odsCopy = {
  intro:
    'Em 25 de setembro de 2015, 193 líderes mundiais se comprometeram com 17 Metas Globais para alcançar 3 objetivos extraordinários nos próximos 15 anos:',
  goals: [
    'Erradicar a pobreza extrema',
    'Combater a desigualdade e a injustiça',
    'Conter as mudanças climáticas',
  ],
  body: 'Esses objetivos são conhecidos como os Objetivos de Desenvolvimento Sustentável (ODS) e fazem parte da Agenda 2030 da Organização das Nações Unidas (ONU). Os ODS funcionam como um plano de ação integrado, reconhecendo que o desenvolvimento humano e tecnológico deve equilibrar a viabilidade econômica com a preservação ambiental e a justiça social.',
}

export const aboutCopy = {
  intro:
    'O Sustenta & Habilidade surge da parceria entre o Grupo de Inovação em Química Analítica Verde (GIQAV) e o Programa de Educação Tutorial em Química Ambiental (PET QA), ambos vinculados à UNESP/IBILCE e coordenados pelo Prof. Dr. Mario Henrique Gonzalez.',
  quemSomos:
    'A proposta reúne duas frentes que se complementam na formação acadêmica: o GIQAV, voltado à pesquisa em Química Analítica Verde e ao desenvolvimento de métodos e tecnologias mais sustentáveis, e o PET QA, que atua na formação dos estudantes por meio da integração entre ensino, pesquisa e extensão.',
  oQueOferecemos:
    'Conferências, palestras, minicursos e uma mesa de discussão com pesquisadoras e pesquisadores de instituições do Brasil, de Portugal e da Espanha — um espaço para inovar, aprender e conectar ciência à sociedade.',
  oQueBuscamos:
    'Acreditamos que a sustentabilidade vai além do que é desenvolvido dentro do laboratório. Unimos ciência, sustentabilidade e desenvolvimento de habilidades para discutir os desafios do presente e pensar, juntos, nas possibilidades para o futuro.',
}

export function publicSrc(path: string) {
  return path.split('/').map(encodeURIComponent).join('/')
}

export const pix = {
  key: '48.031.918/0011-04',
  recipient: 'CAMPUS DE SÃO JOSÉ DO RIO PRETO',
  qrSrc: '/qrcode-pix.png',
} as const

export const organizers = [
  {
    id: 'giqav',
    name: 'GIQAV',
    fullName: 'Grupo de Inovação em Química Analítica Verde',
    description:
      'Pesquisa em Química Analítica Verde e desenvolvimento de métodos e tecnologias mais sustentáveis.',
    logo: '/logos/Logo GIQAV.jpeg',
  },
  {
    id: 'pet-qa',
    name: 'PET QA',
    fullName: 'Programa de Educação Tutorial em Química Ambiental',
    description:
      'Formação de estudantes pela integração entre ensino, pesquisa e extensão, aproximando a universidade das demandas da sociedade.',
    logo: '/logos/pet-quimica.avif',
  },
] as const

export const sponsorTiers = [
  {
    name: 'Diamante',
    sponsors: [
      { name: 'Beyond Benign', src: '/patrocinadores/diamond/beyondbenign.jpg' },
      { name: 'Mustang', src: '/patrocinadores/diamond/mustang.jpg' },
      { name: 'IBILCE', src: '/patrocinadores/bronze/ibilce.jpeg' },
    ],
  },
  {
    name: 'Prata',
    sponsors: [{ name: 'OxiTEM', src: '/patrocinadores/prata/Logo oxitem.jpeg' }, {
      name: 'GIQAV', src: '/logos/Logo GIQAV.jpeg'
    }],
  },
  {
    name: 'Colaboradores',
    sponsors: [
      { name: 'Arco Íris', src: '/patrocinadores/bronze/arco-iris.jpg' },
     
      { name: 'DM Costura Criativa', src: '/patrocinadores/bronze/Logo DM costura criativa.jpeg' },
      { name: 'Nathália Risso', src: '/patrocinadores/bronze/Logo nathália risso.jpeg' },
      { name: 'Sistema CFQ/CRQs', src: '/patrocinadores/bronze/Logo sistema CFQ_CRQs.jpeg' },
      { name: 'Pós-Graduação em Química UNESP', src: '/patrocinadores/bronze/pos-quimica.jpg' },
      {name: 'Brauni', src: '/patrocinadores/bronze/brauni.jpeg'}
    ],
  },
] as const

export const ticketTypes = [
  {
    id: 'permanencia-estudantil',
    title: 'Permanência estudantil',
    description: 'Estudantes da permanência estudantil. É necessário anexar um comprovante.',
    priceCents: 3000,
  },
  {
    id: 'graduacao-unesp',
    title: 'Graduação UNESP',
    description: 'Estudantes de graduação da UNESP.',
    priceCents: 4000,
  },
  {
    id: 'pos',
    title: 'Pós-graduação',
    description: 'Mestrado, doutorado e pós-doutorado.',
    priceCents: 5000,
  },
  {
    id: 'publico-externo',
    title: 'Público externo',
    description: 'Estudantes de outras instituições, docentes, pesquisadores e demais participantes.',
    priceCents: 6000,
  },
] as const

export type TicketTypeId = (typeof ticketTypes)[number]['id']

export const dietaryPreferences = [
  { id: 'onivoro', title: 'Onívoro' },
  { id: 'vegano', title: 'Vegano' },
  { id: 'vegetariano', title: 'Vegetariano' },
] as const

export type DietaryPreferenceId = (typeof dietaryPreferences)[number]['id']

export function isDietaryPreference(value: string): value is DietaryPreferenceId {
  return dietaryPreferences.some((item) => item.id === value)
}

export function ticketRequiresProof(categoria: string) {
  return categoria === 'permanencia-estudantil'
}

export function requiresManualApproval(categoria: string, metodoPagamento: 'pix' | 'cartao') {
  return metodoPagamento === 'pix' || ticketRequiresProof(categoria)
}

export type SessionKind =
  | 'logistica'
  | 'abertura'
  | 'conferencia'
  | 'palestra'
  | 'coffee'
  | 'almoco'
  | 'minicurso'
  | 'empresa'
  | 'mesa'

export type DayId = 'segunda' | 'terca'

export type Session = {
  id: string
  day: DayId
  time: string
  kind: SessionKind
  title: string
  speaker?: string
  affiliation?: string
  remote?: boolean
}

export const kindLabels: Record<SessionKind, string> = {
  logistica: 'Logística',
  abertura: 'Abertura',
  conferencia: 'Conferência',
  palestra: 'Palestra',
  coffee: 'Coffee',
  almoco: 'Intervalo',
  minicurso: 'Minicurso',
  empresa: 'Empresa',
  mesa: 'Mesa-redonda',
}

export const days: { id: DayId; label: string; date: string }[] = [
  { id: 'segunda', label: 'Segunda', date: '05/10' },
  { id: 'terca', label: 'Terça', date: '06/10' },
]

export const schedule: Session[] = [
  {
    id: 's-material',
    day: 'segunda',
    time: '07:30',
    kind: 'logistica',
    title: 'Entrega de material',
  },
  {
    id: 's-abertura',
    day: 'segunda',
    time: '08:00',
    kind: 'abertura',
    title: 'Mesa de abertura',
  },
  {
    id: 's-c1',
    day: 'segunda',
    time: '08:30',
    kind: 'conferencia',
    title:
      'Deep Eutectic Solvents (DES): uma solução sustentável para a extração de contaminantes emergentes',
    speaker: 'Dra. Sara Cunha',
    affiliation: 'Universidade do Porto',
    remote: true,
  },
  {
    id: 's-c2',
    day: 'segunda',
    time: '09:30',
    kind: 'conferencia',
    title: 'Química Verde e sustentabilidade: histórico e evolução',
    speaker: 'Prof. Dr. Mario H. Gonzalez',
    affiliation: 'DQ/UNESP — Rio Preto',
  },
  {
    id: 's-coffee-1',
    day: 'segunda',
    time: '10:30',
    kind: 'coffee',
    title: 'Coffee',
  },
  {
    id: 's-p1',
    day: 'segunda',
    time: '10:50',
    kind: 'palestra',
    title:
      'MRM Profiling: uma ferramenta ambientalmente amigável para análises de amostras ambientais e de fluidos biológicos',
    speaker: 'Prof. Dr. Paulo Clairmont',
    affiliation: 'IQ/UNESP — Araraquara',
  },
  {
    id: 's-p2',
    day: 'segunda',
    time: '11:40',
    kind: 'palestra',
    title:
      'Solventes eutéticos naturais profundos (NADES): tecnologias verdes para inovação e sustentabilidade em Química de Alimentos',
    speaker: 'Prof. Dr. Stanislau Bogusz Junior',
    affiliation: 'IQSC/USP — São Carlos',
  },
  {
    id: 's-almoco',
    day: 'segunda',
    time: '12:30',
    kind: 'almoco',
    title: 'Almoço',
  },
  {
    id: 's-p3',
    day: 'segunda',
    time: '14:00',
    kind: 'palestra',
    title:
      'Produção e aplicação do jogo “Emergência Climática” para conscientização sobre mudanças climáticas e ações sustentáveis',
    speaker: 'Prof. Dr. Alex Virgilio',
    affiliation: 'CENA/USP — Piracicaba',
  },
  {
    id: 's-p4',
    day: 'segunda',
    time: '14:50',
    kind: 'palestra',
    title:
      'Single Cell e Single Particle ICP-MS: ferramentas analíticas para a avaliação de interações entre nanomateriais e sistemas biológicos',
    speaker: 'Profa. Dra. Ana Beatriz Santos',
    affiliation: 'DQ/UFSCar — São Carlos',
  },
  {
    id: 's-coffee-2',
    day: 'segunda',
    time: '15:40',
    kind: 'coffee',
    title: 'Coffee',
  },
  {
    id: 's-m1',
    day: 'segunda',
    time: '16:00',
    kind: 'minicurso',
    title: 'Preparo de membranas adsorventes oriundas de biomassas agroindustriais',
    speaker: 'Ms. Gabriela Aparecida Nogueira',
    affiliation: 'DQ/UNESP — Rio Preto',
  },
  {
    id: 's-m2',
    day: 'segunda',
    time: '16:30',
    kind: 'minicurso',
    title: 'Fundamentos de eletrostática para tratamento de efluentes',
    speaker: 'Prof. Dr. Thiago A. Lima Burgo',
    affiliation: 'DQ/UNESP — Rio Preto',
  },
  {
    id: 's-m3',
    day: 'segunda',
    time: '17:00',
    kind: 'minicurso',
    title: 'Servidores online aplicados à predição de toxicidade em compostos orgânicos',
    speaker: 'Prof. Dr. Otavio Augusto Chaves',
    affiliation: 'DQ/UNESP — Rio Preto',
  },
  {
    id: 't-c3',
    day: 'terca',
    time: '08:30',
    kind: 'conferencia',
    title:
      'Magnetic Deep Eutectic Solvents: advancing in the green sample preparation portability',
    speaker: 'Profa. Dra. Lorena Vidal',
    affiliation: 'Universidade de Alicante',
    remote: true,
  },
  {
    id: 't-c4',
    day: 'terca',
    time: '09:30',
    kind: 'conferencia',
    title: 'Metabolômica: decifrando a química da vida para um futuro sustentável',
    speaker: 'Profa. Dra. Ana Valéria Colnaghi',
    affiliation: 'IQ/UNICAMP — Campinas',
  },
  {
    id: 't-coffee-1',
    day: 'terca',
    time: '10:30',
    kind: 'coffee',
    title: 'Coffee',
  },
  {
    id: 't-p5',
    day: 'terca',
    time: '10:50',
    kind: 'palestra',
    title: 'Terapia gênica não viral: fundamentos e aplicações',
    speaker: 'Prof. Dr. Márcio Tiera',
    affiliation: 'DQ/UNESP — Rio Preto',
  },
  {
    id: 't-p6',
    day: 'terca',
    time: '11:40',
    kind: 'palestra',
    title:
      'Desafios da catálise aplicada à conversão de biomassa vegetal em produtos de alto valor agregado',
    speaker: 'Prof. Dr. Gustavo Metsker',
    affiliation: 'DQ/UNESP — Rio Preto',
  },
  {
    id: 't-almoco',
    day: 'terca',
    time: '12:30',
    kind: 'almoco',
    title: 'Almoço',
  },
  {
    id: 't-e1',
    day: 'terca',
    time: '14:00',
    kind: 'empresa',
    title: 'Empresa 01 — programação a confirmar',
  },
  {
    id: 't-e2',
    day: 'terca',
    time: '14:50',
    kind: 'empresa',
    title: 'Empresa 02 — programação a confirmar',
  },
  {
    id: 't-coffee-2',
    day: 'terca',
    time: '15:40',
    kind: 'coffee',
    title: 'Coffee final',
  },
  {
    id: 't-mesa',
    day: 'terca',
    time: '16:00',
    kind: 'mesa',
    title: 'Mesa de discussão',
    speaker:
      'Química Verde: entre mitos, fatos e desafios — Cintia Milagre (IQ/UNESP Araraquara). Preparando futuros cientistas para um desenvolvimento sustentável — Juliana Vidal (Beyond Benign, remoto).',
  },
]

export const developer = {
  name: 'devAlex',
  url: 'https://www.instagram.com/_dev_alex/',
} as const

export const instagram = {
  handle: 'sustenta_e_habilidade',
  url: 'https://www.instagram.com/sustenta_e_habilidade/',
  posts: [
    {
      src: '/instagram/01-organizadores.jpg',
      alt: 'Conheça os organizadores do II Sustenta & Habilidade',
    },
    {
      src: '/instagram/02-save-the-date.webp',
      alt: 'Save the date: 05 e 06 de outubro de 2026 no Auditório A do IBILCE/UNESP',
    },
    {
      src: '/instagram/03-ultima-edicao.jpg',
      alt: 'Participantes da última edição do Sustenta & Habilidade',
    },
    {
      src: '/instagram/04-primeiro-dia.jpg',
      alt: 'Banner do Sustenta & Habilidade no campus do IBILCE',
    },
    {
      src: '/instagram/05-aviso.jpg',
      alt: 'Aviso: início do evento no Auditório A do IBILCE',
    },
    {
      src: '/instagram/06-patrocinadores.jpg',
      alt: 'Patrocinadores e parceiros do Sustenta & Habilidade',
    },
  ],
} as const

export const navItems = [
  { id: 'inicio', label: 'Início' },
  { id: 'sobre', label: 'Sobre' },
  { id: 'ods', label: 'ODS' },
  { id: 'programacao', label: 'Programação' },
  { id: 'patrocinadores', label: 'Patrocinadores' },
  { id: 'organizacao', label: 'Organização' },
  { id: 'inscricao', label: 'Inscrição' },
  { id: 'instagram', label: 'Instagram' },
] as const
