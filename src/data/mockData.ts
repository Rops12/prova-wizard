import { Instituicao, Template } from "@/types";

// Mock da instituição
export const instituicaoMock: Instituicao = {
  id: "inst-1",
  nome: "Colégio Exemplo",
  logo: "/placeholder.svg",
  disciplinas: [
    "Português",
    "Matemática", 
    "História",
    "Geografia",
    "Ciências",
    "Inglês",
    "Educação Física",
    "Artes",
    "Filosofia",
    "Sociologia",
    "Física",
    "Química",
    "Biologia"
  ],
  series: [
    "1º Ano",
    "2º Ano", 
    "3º Ano",
    "4º Ano",
    "5º Ano",
    "6º Ano",
    "7º Ano",
    "8º Ano",
    "9º Ano",
    "1ª Série",
    "2ª Série",
    "3ª Série"
  ],
  turmas: [
    "A",
    "B", 
    "C",
    "D",
    "E",
    "Matutino A",
    "Matutino B",
    "Vespertino A",
    "Vespertino B",
    "Noturno A"
  ]
};

// Templates para provas
export const templatesProva: Template[] = [
  {
    id: "prova-global",
    nome: "Prova Global",
    tipo: "prova",
    descricao: "Template padrão para provas bimestrais e semestrais",
    configuracao: {
      colunas: 1,
      incluiCapa: false,
      incluiContracapa: false,
      paginacaoMultipla4: false,
      cabecalho: true,
      rodape: true
    }
  },
  {
    id: "microteste",
    nome: "Microteste",
    tipo: "prova", 
    descricao: "Template compacto para avaliações rápidas",
    configuracao: {
      colunas: 1,
      incluiCapa: false,
      incluiContracapa: false,
      paginacaoMultipla4: false,
      cabecalho: true,
      rodape: true
    }
  },
  {
    id: "atividade",
    nome: "Atividade",
    tipo: "prova",
    descricao: "Template para atividades e exercícios",
    configuracao: {
      colunas: 1,
      incluiCapa: false,
      incluiContracapa: false,
      paginacaoMultipla4: false,
      cabecalho: true,
      rodape: false
    }
  }
];

// Templates para simulados
export const templatesSimulado: Template[] = [
  {
    id: "simulado-enem",
    nome: "Simulado ENEM",
    tipo: "simulado",
    descricao: "Template no formato ENEM com múltiplas disciplinas",
    configuracao: {
      colunas: 2,
      incluiCapa: true,
      incluiContracapa: true,
      paginacaoMultipla4: true,
      cabecalho: false,
      rodape: true
    }
  },
  {
    id: "simulado-tradicional", 
    nome: "Simulado Tradicional",
    tipo: "simulado",
    descricao: "Template tradicional para simulados gerais",
    configuracao: {
      colunas: 2,
      incluiCapa: true,
      incluiContracapa: true,
      paginacaoMultipla4: true,
      cabecalho: true,
      rodape: true
    }
  },
  {
    id: "simuladinho",
    nome: "Simuladinho", 
    tipo: "simulado",
    descricao: "Template compacto para simulados menores",
    configuracao: {
      colunas: 2,
      incluiCapa: false,
      incluiContracapa: false,
      paginacaoMultipla4: false,
      cabecalho: true,
      rodape: true
    }
  }
];

// Questões exemplo
export const questoesExemplo = [
  {
    id: "q1",
    tipo: "multipla_escolha" as const,
    enunciado: "Qual é a capital do Brasil?",
    alternativas: [
      { id: "a1", texto: "São Paulo", correta: false },
      { id: "a2", texto: "Rio de Janeiro", correta: false },
      { id: "a3", texto: "Brasília", correta: true },
      { id: "a4", texto: "Salvador", correta: false },
      { id: "a5", texto: "Belo Horizonte", correta: false }
    ],
    disciplina: "Geografia",
    dificuldade: "facil" as const
  },
  {
    id: "q2", 
    tipo: "dissertativa" as const,
    enunciado: "Explique a importância da fotossíntese para os ecossistemas terrestres.",
    linhasResposta: 8,
    disciplina: "Biologia",
    dificuldade: "medio" as const
  },
  {
    id: "q3",
    tipo: "verdadeiro_falso" as const,
    enunciado: "Analise as afirmativas sobre a Segunda Guerra Mundial:",
    afirmativas: [
      { id: "af1", texto: "A guerra começou em 1939 com a invasão da Polônia", resposta: "V" as const },
      { id: "af2", texto: "O Brasil não participou do conflito", resposta: "F" as const },
      { id: "af3", texto: "As bombas atômicas foram lançadas no Japão", resposta: "V" as const },
      { id: "af4", texto: "A guerra terminou em 1944", resposta: "F" as const }
    ],
    disciplina: "História",
    dificuldade: "medio" as const
  }
];