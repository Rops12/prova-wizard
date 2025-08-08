import React from 'react';
import { Documento, Questao } from '@/types';
import { Separator } from '@/components/ui/separator';

interface PagedPreviewProps {
  documento: Documento | null;
  exibirGabarito: boolean;
}

const RenderizadorQuestao: React.FC<{ questao: Questao, numeroQuestao: number, exibirGabarito: boolean }> = ({ questao, numeroQuestao, exibirGabarito }) => {
    // Usa a classe .questao-container para controle de quebra de página
    return (
        <div className="questao-container">
           <div className="flex items-start gap-3">
          <div className="font-semibold text-sm bg-primary/10 rounded-full w-6 h-6 flex items-center justify-center mt-1 flex-shrink-0 print:bg-gray-200">
            {numeroQuestao}
          </div>
          <div className="flex-1 space-y-3">
            <div className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: questao.enunciado.replace(/\n/g, '<br />') }} />

            {questao.tipo === "multipla_escolha" && questao.alternativas && (
              <div className="space-y-2">
                {questao.alternativas.map((alternativa, index) => (
                  <div key={alternativa.id} className="flex items-start gap-2 text-sm">
                    <span className="font-medium mt-0.5 flex-shrink-0">{String.fromCharCode(65 + index)})</span>
                    <span className={`flex-1 ${exibirGabarito && alternativa.correta ? "font-bold text-secondary print:bg-gray-300" : ""}`}>
                      {alternativa.texto}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {questao.tipo === "dissertativa" && (
              <div className="space-y-1 mt-4">
                {Array.from({ length: questao.linhasResposta || 5 }).map((_, index) => (
                  <div key={index} className="linha-resposta"></div>
                ))}
              </div>
            )}

            {questao.tipo === "verdadeiro_falso" && questao.afirmativas && (
              <div className="space-y-2 mt-4">
                {questao.afirmativas.map((afirmativa) => (
                  <div key={afirmativa.id} className="flex items-start gap-3 text-sm">
                    <span className="text-xs font-bold self-center">({exibirGabarito ? afirmativa.resposta : " "})</span>
                    <span className="flex-1">{afirmativa.texto}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        </div>
      );
};

export const PagedPreview: React.FC<PagedPreviewProps> = ({ documento, exibirGabarito }) => {
  if (!documento) {
    return null;
  }

  const todasQuestoes = React.useMemo(() => {
    if (documento.tipo === 'prova') return documento.questoes;
    return documento.cadernos.flatMap(c => c.questoes.map(q => ({...q, disciplina: c.disciplina})));
  }, [documento]);

  let contadorQuestoes = 0;

  return (
    // Adiciona a classe .document-container
    <div id="paged-content" className="document-container">
      {documento.tipo === 'prova' && (
        <>
          {documento.template.configuracao.cabecalho && (
            <div className="preview-header">
              <h1 className="text-xl font-bold">{documento.metadados.titulo || documento.template.nome}</h1>
              <div className="text-sm text-muted-foreground space-y-1">
                  <p>Disciplina: {documento.metadados.disciplina}</p>
                  <p>Série: {documento.metadados.serie} | Turma: {documento.metadados.turma}</p>
                  {documento.metadados.professor && <p>Professor(a): {documento.metadados.professor}</p>}
              </div>
              <Separator className="my-6" />
            </div>
          )}
          {/* Adiciona a classe .prova-content */}
          <div className="prova-content">
            {todasQuestoes.map((questao, index) => (
              <RenderizadorQuestao key={questao.id} questao={questao} numeroQuestao={index + 1} exibirGabarito={exibirGabarito} />
            ))}
          </div>
        </>
      )}

      {documento.tipo === 'simulado' && (
         // Adiciona a classe .simulado-content
        <div className="simulado-content">
          {documento.cadernos.map((caderno) => (
            <React.Fragment key={caderno.disciplina}>
              {/* Adiciona a classe .disciplina-titulo */}
              <div className="disciplina-titulo">{caderno.disciplina}</div>
              {caderno.questoes.map((questao) => {
                contadorQuestoes++;
                return (
                  <RenderizadorQuestao key={questao.id} questao={questao} numeroQuestao={contadorQuestoes} exibirGabarito={exibirGabarito} />
                )
              })}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};