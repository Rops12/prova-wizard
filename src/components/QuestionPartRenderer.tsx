import React from 'react';
import { QuestionPart } from '../types/pageBreak.types';
import { Questao } from '../types';

interface QuestionPartRendererProps {
  part: QuestionPart;
  exibirGabarito: boolean;
  originalQuestoes: Questao[];
}

export const QuestionPartRenderer: React.FC<QuestionPartRendererProps> = ({
  part,
  exibirGabarito,
  originalQuestoes
}) => {
  const originalQuestao = originalQuestoes.find(q => q.id === part.questaoId);

  return (
    <div className="mb-6 break-inside-avoid questao-container">
      {/* Indicador de continuação */}
      {part.isPartial && part.partNumber && part.partNumber > 1 && (
        <div className="continuation-indicator">
          📄 Continuação da questão {part.numeroQuestao}
        </div>
      )}
      
      <div className="flex items-start gap-3">
        <div className="font-semibold text-sm bg-primary/10 rounded-full w-6 h-6 flex items-center justify-center mt-1 flex-shrink-0">
          {part.numeroQuestao}
        </div>
        <div className="flex-1 space-y-3">
          {/* Enunciado */}
          {part.enunciado && (
            <div className="text-sm leading-relaxed">
              {part.enunciado}
            </div>
          )}
          
          {/* Alternativas - Múltipla Escolha */}
          {part.tipo === 'multipla_escolha' && part.alternativas && (
            <div className="space-y-2">
              {part.alternativas.map((alternativa) => {
                const originalIndex = originalQuestao?.alternativas?.findIndex(a => a.id === alternativa.id) || 0;
                return (
                  <div key={alternativa.id} className="flex items-start gap-2 text-sm alternative">
                    <span className="font-medium mt-0.5 flex-shrink-0">
                      {String.fromCharCode(65 + originalIndex)})
                    </span>
                    <span className={`flex-1 ${
                      exibirGabarito && alternativa.correta 
                        ? "bg-green-100 text-green-800 font-medium rounded px-1" 
                        : ""
                    }`}>
                      {alternativa.texto}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
          
          {/* Linhas - Dissertativa */}
          {part.tipo === 'dissertativa' && part.linhasResposta && (
            <div className="space-y-2">
              {Array.from({ length: part.linhasResposta }).map((_, index) => (
                <div key={index} className="linha-resposta"></div>
              ))}
            </div>
          )}
          
          {/* Afirmativas - Verdadeiro ou Falso */}
          {part.tipo === 'verdadeiro_falso' && part.afirmativas && (
            <div className="space-y-2">
              {part.afirmativas.map((afirmativa) => {
                const originalIndex = originalQuestao?.afirmativas?.findIndex(a => a.id === afirmativa.id) || 0;
                return (
                  <div key={afirmativa.id} className="flex items-start gap-3 text-sm afirmativa">
                    <span className="font-medium mt-0.5 flex-shrink-0">
                      {originalIndex + 1}.
                    </span>
                    <span className="flex-1">
                      {afirmativa.texto}
                    </span>
                    <div className="flex gap-3 flex-shrink-0">
                      <label className="flex items-center gap-1">
                        <span className="text-xs">V</span>
                        <div className={`w-4 h-4 border rounded ${
                          exibirGabarito && afirmativa.resposta === 'V' 
                            ? "bg-green-500 border-green-500" 
                            : ""
                        }`}></div>
                      </label>
                      <label className="flex items-center gap-1">
                        <span className="text-xs">F</span>
                        <div className={`w-4 h-4 border rounded ${
                          exibirGabarito && afirmativa.resposta === 'F' 
                            ? "bg-red-500 border-red-500" 
                            : ""
                        }`}></div>
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Indicador de continuação na próxima página */}
      {part.isPartial && part.partNumber && part.totalParts && part.partNumber < part.totalParts && (
        <div className="continuation-indicator continues">
          📄 Continua na próxima página...
        </div>
      )}
    </div>
  );
};