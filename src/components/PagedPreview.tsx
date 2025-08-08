import React from 'react';
import { Documento, Questao } from '@/types';
import { Separator } from '@/components/ui/separator';

interface PagedPreviewProps {
  documento: Documento | null;
  exibirGabarito: boolean;
}

const RenderizadorQuestao: React.FC<{ questao: Questao, numeroQuestao: number, exibirGabarito: boolean }> = ({ questao, numeroQuestao, exibirGabarito }) => {
    return (
        <div className="questao-container break-inside-avoid">
           <div className="flex items-start gap-3">
          <div className="font-semibold text-sm bg-primary/10 rounded-full w-6 h-6 flex items-center justify-center mt-1 flex-shrink-0">
            {numeroQuestao}
          </div>
          <div className="flex-1 space-y-3">
            <div className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: questao.enunciado.replace(/\n/g, '<br />') }} />
            {questao.tipo === "multipla_escolha" && questao.alternativas && (
              <div className="space-y-2">
                {questao.alternativas.map((alternativa, index) => (
                  <div key={alternativa.id} className="flex items-start gap-2 text-sm">
                    <span className="font-medium mt-0.5 flex-shrink-0">{String.fromCharCode(65 + index)})</span>
                    <span className={`flex-1 ${exibirGabarito && alternativa.correta ? "bg-secondary-light text-secondary font-medium rounded px-1" : ""}`}>
                      {alternativa.texto}
                    </span>
                  </div>
                ))}
              </div>
            )}
            {questao.tipo === "dissertativa" && (
              <div className="space-y-2 mt-4">
                {Array.from({ length: questao.linhasResposta || 5 }).map((_, index) => (
                  <div key={index} className="border-b border-border h-6"></div>
                ))}
              </div>
            )}
            {questao.tipo === "verdadeiro_falso" && questao.afirmativas && (
              <div className="space-y-2 mt-4">
                {questao.afirmativas.map((afirmativa) => (
                  <div key={afirmativa.id} className="flex items-start gap-3 text-sm">
                    <span className="flex-1">{afirmativa.texto}</span>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <span className="text-xs font-bold">({exibirGabarito ? afirmativa.resposta : " "})</span>
                    </div>
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

  let disciplinaAnterior = "";

  return (
    <div id="paged-content">
      {documento.tipo === 'prova' && documento.template.configuracao.cabecalho && (
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
      <div className={documento.template.configuracao.colunas === 2 ? "columns-2" : ""}>
        {todasQuestoes.map((questao, index) => {
          if (documento.tipo === 'simulado') {
            const q = questao as Questao & { disciplina: string };
            const mostrarTituloDisciplina = q.disciplina !== disciplinaAnterior;
            disciplinaAnterior = q.disciplina;
            return (
              <React.Fragment key={q.id}>
                {mostrarTituloDisciplina && <div className="disciplina-titulo">{q.disciplina}</div>}
                <RenderizadorQuestao questao={q} numeroQuestao={index + 1} exibirGabarito={exibirGabarito} />
              </React.Fragment>
            )
          }
          return <RenderizadorQuestao key={questao.id} questao={questao} numeroQuestao={index + 1} exibirGabarito={exibirGabarito} />
        })}
      </div>
    </div>
  );
};