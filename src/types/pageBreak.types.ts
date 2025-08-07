export interface QuestionPart {
  questaoId: string;
  numeroQuestao: number;
  enunciado?: string;
  alternativas?: Array<{ id: string; texto: string; correta: boolean }>;
  afirmativas?: Array<{ id: string; texto: string; resposta: 'V' | 'F' }>;
  linhasResposta?: number;
  imagem?: string;
  isPartial: boolean;
  partNumber?: number;
  totalParts?: number;
  tipo: 'multipla_escolha' | 'dissertativa' | 'verdadeiro_falso';
}

export interface PageContent {
  parts: QuestionPart[];
  height: number;
}

export interface BreakConfiguration {
  pageHeight: number;
  safetyMargin: number;
  maxQuestionHeight: number;
  breakMode: 'smart' | 'paragraph' | 'sentence';
}

export interface MeasurementResult {
  totalHeight: number;
  enunciadoHeight: number;
  alternativasHeight: number;
  componentHeights: { [key: string]: number };
}