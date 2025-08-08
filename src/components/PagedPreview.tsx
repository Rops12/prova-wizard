import React from 'react';
import { Documento, Questao } from '@/types';
import { Separator } from '@/components/ui/separator';

interface PagedPreviewProps {
  documento: Documento | null;
  exibirGabarito: boolean;
}

const RenderizadorQuestao: React.FC<{ 
  questao: Questao, 
  numeroQuestao: number, 
  exibirGabarito: boolean 
}> = ({ questao, numeroQuestao, exibirGabarito }) => {
  return (
    <div className="questao-container">
      <div className="flex items-start gap-3">
        <div className="font-semibold text-sm bg-primary/10 rounded-full w-6 h-6 flex items-center justify-center mt-1 flex-shrink-0 print:bg-gray-200">
          {numeroQuestao}
        </div>
        <div className="flex-1 space-y-3">
          <div 
            className="text-sm leading-relaxed" 
            dangerouslySetInnerHTML={{ 
              __html: questao.enunciado.replace(/\n/g, '<br />') 
            }} 
          />

          {questao.tipo === "multipla_escolha" && questao.alternativas && (
            <div className="alternativas-container space-y-2">
              {questao.alternativas.map((alternativa, index) => (
                <div key={alternativa.id} className="flex items-start gap-2 text-sm">
                  <span className="font-medium mt-0.5 flex-shrink-0">
                    {String.fromCharCode(65 + index)})
                  </span>
                  <span className={`flex-1 ${
                    exibirGabarito && alternativa.correta 
                      ? "font-bold text-secondary print:bg-gray-300" 
                      : ""
                  }`}>
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
            <div className="afirmativas-container space-y-2 mt-4">
              {questao.afirmativas.map((afirmativa) => (
                <div key={afirmativa.id} className="flex items-start gap-3 text-sm">
                  <span className="text-xs font-bold self-center border border-gray-400 rounded px-1 min-w-[20px] text-center">
                    {exibirGabarito ? afirmativa.resposta : " "}
                  </span>
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
    <div id="paged-content" className="document-container">
      {documento.tipo === 'prova' && (
        <>
          {documento.template.configuracao.cabecalho && (
            <div className="preview-header">
              <h1 className="text-xl font-bold text-center mb-4">
                {documento.metadados.titulo || documento.template.nome}
              </h1>
              <div className="text-sm text-muted-foreground space-y-1 text-center">
                <p><strong>Disciplina:</strong> {documento.metadados.disciplina}</p>
                <p><strong>Série:</strong> {documento.metadados.serie} | <strong>Turma:</strong> {documento.metadados.turma}</p>
                {documento.metadados.professor && (
                  <p><strong>Professor(a):</strong> {documento.metadados.professor}</p>
                )}
                {documento.metadados.data && (
                  <p><strong>Data:</strong> {documento.metadados.data}</p>
                )}
              </div>
              <Separator className="my-6" />
            </div>
          )}
          
          <div className="prova-content">
            {todasQuestoes.map((questao, index) => (
              <RenderizadorQuestao 
                key={questao.id} 
                questao={questao} 
                numeroQuestao={index + 1} 
                exibirGabarito={exibirGabarito} 
              />
            ))}
          </div>
        </>
      )}

      {documento.tipo === 'simulado' && (
        <div className="simulado-content">
          {documento.template.configuracao.incluiCapa && (
            <div className="capa-simulado">
              <div className="text-center py-20">
                <h1 className="text-3xl font-bold mb-4">{documento.nome}</h1>
                <div className="text-lg space-y-2">
                  <p><strong>Disciplinas:</strong> {documento.cadernos.map(c => c.disciplina).join(', ')}</p>
                  <p><strong>Total de questões:</strong> {todasQuestoes.length}</p>
                </div>
              </div>
            </div>
          )}
          
          {documento.cadernos.map((caderno, cadernoIndex) => (
            <React.Fragment key={caderno.disciplina}>
              {cadernoIndex > 0 || documento.template.configuracao.incluiCapa ? (
                <div className="disciplina-titulo">
                  {caderno.disciplina}
                </div>
              ) : (
                <h2 className="text-xl font-bold text-center mb-6">
                  {caderno.disciplina}
                </h2>
              )}
              
              {caderno.questoes.map((questao) => {
                contadorQuestoes++;
                return (
                  <RenderizadorQuestao 
                    key={questao.id} 
                    questao={questao} 
                    numeroQuestao={contadorQuestoes} 
                    exibirGabarito={exibirGabarito} 
                  />
                );
              })}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};