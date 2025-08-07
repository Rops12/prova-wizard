import { QuestionPart, PageContent, BreakConfiguration, MeasurementResult } from '../types/pageBreak.types';
import { Questao } from '../types'; // seus tipos existentes
import { MeasurementUtils } from './measurementUtils';

export class PageBreakManager {
  private config: BreakConfiguration;

  constructor(config: Partial<BreakConfiguration> = {}) {
    this.config = {
      pageHeight: 800,
      safetyMargin: 50,
      maxQuestionHeight: 400,
      breakMode: 'smart',
      ...config
    };
  }

  // Método principal para calcular páginas
  calculatePages(questoes: Questao[]): PageContent[] {
    const pages: PageContent[] = [];
    let currentPage: QuestionPart[] = [];
    let currentPageHeight = 0;
    let questaoCounter = 1;

    questoes.forEach(questao => {
      const availableHeight = this.config.pageHeight - currentPageHeight - this.config.safetyMargin;
      
      // Se não há espaço suficiente, criar nova página
      if (availableHeight < 100 && currentPage.length > 0) {
        pages.push({ parts: currentPage, height: currentPageHeight });
        currentPage = [];
        currentPageHeight = 0;
      }

      // Quebrar questão se necessário
      const parts = this.breakQuestion(questao, questaoCounter, this.config.pageHeight - this.config.safetyMargin);
      
      parts.forEach(part => {
        const partHeight = this.estimatePartHeight(part);

        if (currentPageHeight + partHeight > this.config.pageHeight - this.config.safetyMargin && currentPage.length > 0) {
          pages.push({ parts: currentPage, height: currentPageHeight });
          currentPage = [part];
          currentPageHeight = partHeight;
        } else {
          currentPage.push(part);
          currentPageHeight += partHeight;
        }
      });

      questaoCounter++;
    });

    // Adicionar última página
    if (currentPage.length > 0) {
      pages.push({ parts: currentPage, height: currentPageHeight });
    }

    return pages.length > 0 ? pages : [{ parts: [], height: 0 }];
  }

  // Quebrar questão individualmente
  private breakQuestion(questao: Questao, numeroQuestao: number, availableHeight: number): QuestionPart[] {
    const measurements = this.measureQuestion(questao, numeroQuestao);

    if (measurements.totalHeight <= availableHeight) {
      // Questão cabe inteira
      return [{
        questaoId: questao.id,
        numeroQuestao,
        enunciado: questao.enunciado,
        alternativas: questao.alternativas,
        afirmativas: questao.afirmativas,
        linhasResposta: questao.linhasResposta,
        isPartial: false,
        tipo: questao.tipo
      }];
    }

    // Quebrar por tipo
    switch (questao.tipo) {
      case 'multipla_escolha':
        return this.breakMultipleChoice(questao, numeroQuestao, availableHeight, measurements);
      case 'dissertativa':
        return this.breakEssay(questao, numeroQuestao, availableHeight, measurements);
      case 'verdadeiro_falso':
        return this.breakTrueFalse(questao, numeroQuestao, availableHeight, measurements);
      default:
        return [];
    }
  }

  // Medir questão completa
  private measureQuestion(questao: Questao, numeroQuestao: number): MeasurementResult {
    const measurements: MeasurementResult = {
      totalHeight: 0,
      enunciadoHeight: 0,
      alternativasHeight: 0,
      componentHeights: {}
    };

    // Header da questão
    measurements.componentHeights.header = 40;

    // Medir enunciado
    if (questao.enunciado) {
      measurements.enunciadoHeight = MeasurementUtils.measureTextHeight(
        `<div class="text-sm">${questao.enunciado}</div>`
      ) + 20; // margem
    }

    // Medir alternativas/afirmativas/linhas
    if (questao.alternativas) {
      measurements.alternativasHeight = this.measureAlternatives(questao.alternativas);
    } else if (questao.afirmativas) {
      measurements.alternativasHeight = this.measureAfirmativas(questao.afirmativas);
    } else if (questao.linhasResposta) {
      measurements.alternativasHeight = questao.linhasResposta * 24; // 24px por linha
    }

    measurements.totalHeight = 
      measurements.componentHeights.header +
      measurements.enunciadoHeight +
      measurements.alternativasHeight +
      20; // margem inferior

    return measurements;
  }

  // Quebrar questão de múltipla escolha
  private breakMultipleChoice(
    questao: Questao, 
    numeroQuestao: number, 
    availableHeight: number, 
    measurements: MeasurementResult
  ): QuestionPart[] {
    const parts: QuestionPart[] = [];
    
    if (!questao.alternativas) return parts;

    let currentHeight = measurements.componentHeights.header + measurements.enunciadoHeight;
    let currentAlternatives: typeof questao.alternativas = [];
    let partNumber = 1;

    questao.alternativas.forEach((alternativa, index) => {
      const altHeight = MeasurementUtils.measureTextHeight(
        `${String.fromCharCode(65 + index)}) ${alternativa.texto}`
      ) + 8;

      if (currentHeight + altHeight > availableHeight && currentAlternatives.length > 0) {
        // Criar parte atual
        parts.push({
          questaoId: questao.id,
          numeroQuestao,
          enunciado: partNumber === 1 ? questao.enunciado : undefined,
          alternativas: currentAlternatives,
          isPartial: true,
          partNumber,
          totalParts: -1, // será atualizado
          tipo: questao.tipo
        });

        // Reset para próxima parte
        currentAlternatives = [alternativa];
        currentHeight = (partNumber === 1 ? 0 : 80) + altHeight;
        partNumber++;
      } else {
        currentAlternatives.push(alternativa);
        currentHeight += altHeight;
      }
    });

    // Última parte
    if (currentAlternatives.length > 0) {
      parts.push({
        questaoId: questao.id,
        numeroQuestao,
        alternativas: currentAlternatives,
        isPartial: true,
        partNumber,
        totalParts: -1,
        tipo: questao.tipo
      });
    }

    // Atualizar totalParts
    parts.forEach(part => {
      if (part.questaoId === questao.id) {
        part.totalParts = partNumber;
      }
    });

    return parts;
  }

  // Implementar métodos similares para outros tipos...
  private breakEssay(questao: Questao, numeroQuestao: number, availableHeight: number, measurements: MeasurementResult): QuestionPart[] {
    // Implementação similar para dissertativa
    const parts: QuestionPart[] = [];
    
    const linhas = questao.linhasResposta || 5;
    const alturaLinha = 24;
    const totalHeight = measurements.enunciadoHeight + (linhas * alturaLinha) + 40;

    if (totalHeight <= availableHeight) {
      parts.push({
        questaoId: questao.id,
        numeroQuestao,
        enunciado: questao.enunciado,
        linhasResposta: questao.linhasResposta,
        isPartial: false,
        tipo: questao.tipo
      });
    } else {
      // Quebrar linhas
      const linhasDisponiveis = Math.floor((availableHeight - measurements.enunciadoHeight - 40) / alturaLinha);
      const linhasRestantes = linhas - linhasDisponiveis;

      if (linhasDisponiveis > 0) {
        parts.push({
          questaoId: questao.id,
          numeroQuestao,
          enunciado: questao.enunciado,
          linhasResposta: linhasDisponiveis,
          isPartial: true,
          partNumber: 1,
          totalParts: 2,
          tipo: questao.tipo
        });

        if (linhasRestantes > 0) {
          parts.push({
            questaoId: questao.id,
            numeroQuestao,
            linhasResposta: linhasRestantes,
            isPartial: true,
            partNumber: 2,
            totalParts: 2,
            tipo: questao.tipo
          });
        }
      }
    }

    return parts;
  }

  private breakTrueFalse(questao: Questao, numeroQuestao: number, availableHeight: number, measurements: MeasurementResult): QuestionPart[] {
    // Similar ao múltipla escolha, mas para afirmativas
    // ... implementação aqui
    return [];
  }

  // Métodos auxiliares
  private measureAlternatives(alternativas: any[]): number {
    return alternativas.reduce((total, alt, index) => {
      return total + MeasurementUtils.measureTextHeight(
        `${String.fromCharCode(65 + index)}) ${alt.texto}`
      ) + 8;
    }, 0);
  }

  private measureAfirmativas(afirmativas: any[]): number {
    return afirmativas.reduce((total, afirm, index) => {
      return total + MeasurementUtils.measureTextHeight(
        `${index + 1}. ${afirm.texto}`
      ) + 12;
    }, 0);
  }

  private estimatePartHeight(part: QuestionPart): number {
    let height = 80; // base
    
    if (part.enunciado) {
      height += MeasurementUtils.measureTextHeight(part.enunciado);
    }
    
    if (part.alternativas) {
      height += part.alternativas.length * 25;
    }
    
    if (part.afirmativas) {
      height += part.afirmativas.length * 30;
    }
    
    if (part.linhasResposta) {
      height += part.linhasResposta * 24;
    }

    return height;
  }

  // Atualizar configuração
  updateConfig(newConfig: Partial<BreakConfiguration>): void {
    this.config = { ...this.config, ...newConfig };
  }
}