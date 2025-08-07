// Types para o sistema Mecanografia

export interface Instituicao {
  id: string;
  nome: string;
  logo?: string;
  disciplinas: string[];
  series: string[];
  turmas: string[];
}

export interface MetadadosDocumento {
  disciplina: string;
  serie: string;
  turma: string;
  data?: string;
  professor?: string;
  titulo?: string;
}

export interface AlternativaMultiplaEscolha {
  id: string;
  texto: string;
  correta: boolean;
}

export interface AfirmativaVerdadeiroFalso {
  id: string;
  texto: string;
  resposta: 'V' | 'F';
}

export interface Questao {
  id: string;
  tipo: 'multipla_escolha' | 'dissertativa' | 'verdadeiro_falso';
  enunciado: string;
  imagem?: string;
  
  // Para múltipla escolha
  alternativas?: AlternativaMultiplaEscolha[];
  
  // Para dissertativa
  linhasResposta?: number;
  
  // Para verdadeiro ou falso
  afirmativas?: AfirmativaVerdadeiroFalso[];
  
  // Metadados
  disciplina?: string;
  dificuldade?: 'facil' | 'medio' | 'dificil';
  assunto?: string;
}

export interface Template {
  id: string;
  nome: string;
  tipo: 'prova' | 'simulado';
  descricao: string;
  configuracao: {
    colunas: 1 | 2;
    incluiCapa: boolean;
    incluiContracapa: boolean;
    paginacaoMultipla4: boolean;
    cabecalho: boolean;
    rodape: boolean;
  };
}

export interface DocumentoProva {
  id: string;
  tipo: 'prova';
  template: Template;
  metadados: MetadadosDocumento;
  questoes: Questao[];
  criadoEm: Date;
  atualizadoEm: Date;
}

export interface CadernoSimulado {
  disciplina: string;
  questoes: Questao[];
}

export interface DocumentoSimulado {
  id: string;
  tipo: 'simulado';
  template: Template;
  nome: string;
  cadernos: CadernoSimulado[];
  criadoEm: Date;
  atualizadoEm: Date;
}

export type Documento = DocumentoProva | DocumentoSimulado;

export interface ConfiguracaoImpressao {
  margens: {
    superior: number;
    inferior: number;
    esquerda: number;
    direita: number;
  };
  tamanhoFonte: {
    titulo: number;
    subtitulo: number;
    corpo: number;
    rodape: number;
  };
  espacamento: {
    entreQuestoes: number;
    entreLinhas: number;
  };
}