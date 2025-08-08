import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Documento, DocumentoProva, DocumentoSimulado, Questao } from "@/types";
import { ChevronLeft, ChevronRight, Download, Eye, EyeOff } from "lucide-react";
import React, { useState, useMemo, useRef, useLayoutEffect } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface PreviewProps {
  documento: Documento | null;
}

const RenderizadorQuestao: React.FC<{ questao: Questao, numeroQuestao: number, exibirGabarito: boolean }> = ({ questao, numeroQuestao, exibirGabarito }) => {
    // (Este componente permanece o mesmo da versão anterior)
    return (
        <div className="mb-6 break-inside-avoid">
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

export function Preview({ documento }: PreviewProps) {
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [exibirGabarito, setExibirGabarito] = useState(false);
  const [gerandoPdf, setGerandoPdf] = useState(false);
  const [totalPaginas, setTotalPaginas] = useState(1);

  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  // Calcula o total de páginas e o deslocamento da página atual
  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const content = contentRef.current;
    if (!viewport || !content) return;

    const calculateLayout = () => {
        const viewportHeight = viewport.clientHeight;
        const contentHeight = content.scrollHeight;
        const newTotalPages = Math.ceil(contentHeight / viewportHeight) || 1;

        setTotalPaginas(newTotalPages);

        const newScale = viewportHeight / content.clientHeight;
        setScale(newScale < 1 ? newScale : 1);
        
        if (paginaAtual > newTotalPages) {
            setPaginaAtual(newTotalPages);
        }

        // Desloca o conteúdo para mostrar a página correta
        content.style.transform = `translateY(-${(paginaAtual - 1) * viewportHeight}px)`;
    };

    // Usamos um ResizeObserver para recalcular quando o layout mudar
    const observer = new ResizeObserver(calculateLayout);
    observer.observe(content);
    observer.observe(viewport);
    calculateLayout();

    return () => observer.disconnect();
  }, [documento, paginaAtual, exibirGabarito]);

  const gerarPDF = async () => {
    // A geração de PDF com quebra de página é complexa e requer uma abordagem diferente.
    // Esta função mockada representa a intenção.
    console.log("Gerando PDF...");
  };
  
  const todasQuestoes = useMemo(() => {
    if(!documento) return [];
    if(documento.tipo === 'prova') return documento.questoes;
    return documento.cadernos.flatMap(c => c.questoes.map(q => ({...q, disciplina: c.disciplina})));
  }, [documento]);

  if (!documento || todasQuestoes.length === 0) {
      return (
          <Card className="h-full">
              <CardContent className="h-full flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                      <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Configure ou adicione questões para visualizar o preview</p>
                  </div>
              </CardContent>
          </Card>
      );
  }

  let disciplinaAnterior = "";

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Preview</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setExibirGabarito(!exibirGabarito)} className="text-xs">
              {exibirGabarito ? <EyeOff className="h-3 w-3 mr-1" /> : <Eye className="h-3 w-3 mr-1" />}
              {exibirGabarito ? "Ocultar Gabarito" : "Mostrar Gabarito"}
            </Button>
            <Button size="sm" onClick={gerarPDF} disabled={gerandoPdf} className="text-xs">
              <Download className="h-3 w-3 mr-1" />
              {gerandoPdf ? "Gerando..." : "Gerar PDF"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <Separator />
      
      <style>{`
        .preview-container {
          background-color: #f0f0f0;
          flex-grow: 1;
          display: flex;
          justify-content: center;
          align-items: flex-start; /* Alinha a página no topo */
          overflow: hidden;
          padding: 1rem 0;
        }
        .a4-viewport {
          width: calc((100vh - 200px) * (210 / 297)); /* Calcula a largura baseada na altura para manter proporção A4 */
          height: calc(100vh - 200px); /* Ocupa a altura disponível */
          overflow: hidden;
          box-shadow: 0 0 10px rgba(0,0,0,0.15);
          background: white;
        }
        .preview-content-wrapper {
            transition: transform 0.3s ease-in-out;
        }
        .a4-content {
          padding: 20mm;
          font-family: 'Inter', sans-serif;
          color: black;
        }
        /* ... outros estilos ... */
        .preview-header { text-align: center; }
        .preview-footer { font-size: 10px; text-align: center; padding-top: 1rem; }
        .columns-2 { column-count: 2; column-gap: 15mm; }
        .break-inside-avoid { break-inside: avoid-page; page-break-inside: avoid; }
        .disciplina-titulo { 
            font-size: 1.25rem; 
            font-weight: bold; 
            text-align: center; 
            background-color: #f3f4f6; 
            padding: 0.5rem; 
            margin-bottom: 1rem; 
            border-radius: 0.25rem;
            break-before: always; /* Garante que a nova disciplina comece no topo */
        }
      `}</style>
      
      <div className="preview-container">
        <div ref={viewportRef} className="a4-viewport">
            <div ref={contentRef} className="preview-content-wrapper">
                <div className="a4-content">
                    {/* Renderiza o cabeçalho */}
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
                    
                    {/* Renderiza todas as questões em um fluxo contínuo */}
                    <div className={documento.template.configuracao.colunas === 2 ? "columns-2" : ""}>
                        {todasQuestoes.map((questao, index) => {
                             if(documento.tipo === 'simulado') {
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
            </div>
        </div>
      </div>
      
      {totalPaginas > 1 && (
        <>
          <Separator />
          <div className="p-4 flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={() => setPaginaAtual(Math.max(1, paginaAtual - 1))} disabled={paginaAtual === 1}>
              <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
            </Button>
            <span className="text-sm text-muted-foreground">Página {paginaAtual} de {totalPaginas}</span>
            <Button variant="outline" size="sm" onClick={() => setPaginaAtual(Math.min(totalPaginas, paginaAtual + 1))} disabled={paginaAtual === totalPaginas}>
              Próxima <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </>
      )}
    </Card>
  );
}