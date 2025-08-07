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

// --- LÓGICA DE PAGINAÇÃO INTELIGENTE ---

// Estima a "altura" de uma questão para uma paginação mais realista
const calculateQuestionWeight = (questao: Questao): number => {
  let weight = 2; // Peso base para número e espaçamento
  
  // Peso para o enunciado (a cada 80 caracteres, adiciona um peso)
  weight += Math.ceil((questao.enunciado?.length || 0) / 80) * 0.8;

  switch (questao.tipo) {
    case "multipla_escolha":
      weight += (questao.alternativas?.length || 0) * 1.2;
      break;
    case "dissertativa":
      weight += (questao.linhasResposta || 5) * 0.5;
      break;
    case "verdadeiro_falso":
      weight += (questao.afirmativas?.length || 0) * 1;
      break;
  }
  
  return weight;
};


// --- COMPONENTES DE PÁGINA ---

const CapaSimulado: React.FC<{ documento: DocumentoSimulado }> = ({ documento }) => (
    <div className="a4-page flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl font-bold mb-4">{documento.nome}</h1>
        <h2 className="text-2xl text-muted-foreground">{documento.template.nome}</h2>
    </div>
);

const ContracapaSimulado: React.FC = () => (
    <div className="a4-page flex flex-col items-center justify-center text-center">
        <p className="text-lg text-muted-foreground">Instruções Finais ou Espaço para Anotações</p>
    </div>
);

const PaginaProva: React.FC<{ documento: DocumentoProva, questoes: Questao[], exibirGabarito: boolean, numeroPagina: number, totalPaginas: number, questoesOffset: number }> = ({ documento, questoes, exibirGabarito, numeroPagina, totalPaginas, questoesOffset }) => (
    <div className="a4-page">
        {documento.template.configuracao.cabecalho && numeroPagina === 1 && (
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
        <div className="preview-content">
            <div className="space-y-4">
                {questoes.map((questao, index) => (
                    <RenderizadorQuestao key={questao.id} questao={questao} numeroQuestao={questoesOffset + index + 1} exibirGabarito={exibirGabarito} />
                ))}
            </div>
        </div>
        {documento.template.configuracao.rodape && (
            <div className="preview-footer">Página {numeroPagina} de {totalPaginas}</div>
        )}
    </div>
);

const PaginaSimulado: React.FC<{ documento: DocumentoSimulado, questoes: (Questao & { disciplina: string })[], exibirGabarito: boolean, numeroPagina: number, totalPaginas: number, disciplinaAnterior?: string, questoesOffset: number }> = ({ documento, questoes, exibirGabarito, numeroPagina, totalPaginas, disciplinaAnterior, questoesOffset }) => {
    let disciplinaAtualNaPagina = disciplinaAnterior || "";

    return (
        <div className="a4-page">
            <div className="preview-content">
                <div className={documento.template.configuracao.colunas === 2 ? "columns-2" : ""}>
                    {questoes.map((questao, index) => {
                        const mostrarTituloDisciplina = questao.disciplina !== disciplinaAtualNaPagina;
                        disciplinaAtualNaPagina = questao.disciplina;
                        return (
                            <React.Fragment key={questao.id}>
                                {mostrarTituloDisciplina && <div className="disciplina-titulo">{questao.disciplina}</div>}
                                <RenderizadorQuestao questao={questao} numeroQuestao={questoesOffset + index + 1} exibirGabarito={exibirGabarito} />
                            </React.Fragment>
                        )
                    })}
                </div>
            </div>
            {documento.template.configuracao.rodape && (
                <div className="preview-footer">Página {numeroPagina} de {totalPaginas}</div>
            )}
        </div>
    );
};

const RenderizadorQuestao: React.FC<{ questao: Questao, numeroQuestao: number, exibirGabarito: boolean }> = ({ questao, numeroQuestao, exibirGabarito }) => {
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

// --- COMPONENTE PRINCIPAL DO PREVIEW ---

export function Preview({ documento }: PreviewProps) {
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [exibirGabarito, setExibirGabarito] = useState(false);
  const [gerandoPdf, setGerandoPdf] = useState(false);
  
  const viewportRef = useRef<HTMLDivElement>(null);
  const pageWrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const paginas = useMemo(() => {
    if (!documento) return [];

    const MAX_PAGE_WEIGHT = documento.template.configuracao.colunas === 2 ? 22 : 20;
    
    let allPages: (Questao | (Questao & {disciplina: string}))[][] = [];
    let currentPage: (Questao | (Questao & {disciplina: string}))[] = [];
    let currentPageWeight = 0;

    const allQuestions = documento.tipo === 'prova' 
      ? documento.questoes 
      : documento.cadernos.flatMap(c => c.questoes.map(q => ({...q, disciplina: c.disciplina})));

    allQuestions.forEach(questao => {
        const questionWeight = calculateQuestionWeight(questao);
        if (currentPageWeight + questionWeight > MAX_PAGE_WEIGHT && currentPage.length > 0) {
            allPages.push(currentPage);
            currentPage = [];
            currentPageWeight = 0;
        }
        currentPage.push(questao);
        currentPageWeight += questionWeight;
    });

    if (currentPage.length > 0) {
        allPages.push(currentPage);
    }
    
    let paginasDeConteudo: React.ReactNode[] = [];
    let questoesContadas = 0;

    if (documento.tipo === 'prova') {
        allPages.forEach((pageQuestions, pageIndex) => {
            paginasDeConteudo.push(
                <PaginaProva key={`prova-${pageIndex}`} documento={documento} questoes={pageQuestions} exibirGabarito={exibirGabarito} numeroPagina={pageIndex + 1} totalPaginas={allPages.length} questoesOffset={questoesContadas} />
            );
            questoesContadas += pageQuestions.length;
        })
    } else { // Simulado
        let disciplinaDaPaginaAnterior: string | undefined = undefined;
        allPages.forEach((pageQuestions, pageIndex) => {
            paginasDeConteudo.push(
                <PaginaSimulado
                    key={`simulado-${pageIndex}`}
                    documento={documento}
                    questoes={pageQuestions as (Questao & {disciplina: string})[]}
                    exibirGabarito={exibirGabarito}
                    numeroPagina={pageIndex + 1}
                    totalPaginas={allPages.length}
                    disciplinaAnterior={disciplinaDaPaginaAnterior}
                    questoesOffset={questoesContadas}
                />
            );
            if (pageQuestions.length > 0) {
                disciplinaDaPaginaAnterior = (pageQuestions[pageQuestions.length - 1] as any).disciplina;
            }
            questoesContadas += pageQuestions.length;
        });
    }

    if (documento.tipo === "simulado" && documento.template.configuracao.paginacaoMultipla4) {
      const totalPaginasComCapa = paginasDeConteudo.length + (documento.template.configuracao.incluiCapa ? 1 : 0) + (documento.template.configuracao.incluiContracapa ? 1 : 0);
      const paginasEmBrancoNecessarias = (4 - (totalPaginasComCapa % 4)) % 4;
      for (let i = 0; i < paginasEmBrancoNecessarias; i++) {
        paginasDeConteudo.push(<div key={`branco-${i}`} className="a4-page" />);
      }
    }

    if (documento.tipo === "simulado") {
      const paginasFinais = [...paginasDeConteudo];
      if (documento.template.configuracao.incluiCapa) paginasFinais.unshift(<CapaSimulado key="capa" documento={documento} />);
      if (documento.template.configuracao.incluiContracapa) paginasFinais.push(<ContracapaSimulado key="contracapa" />);
      return paginasFinais;
    }
    return paginasDeConteudo;
  }, [documento, exibirGabarito]);

  useLayoutEffect(() => {
    const calculateScale = () => {
      if (viewportRef.current && pageWrapperRef.current) {
        const viewportWidth = viewportRef.current.clientWidth;
        const viewportHeight = viewportRef.current.clientHeight;
        const pageWidth = 794; 
        const pageHeight = 1123;
        const scaleX = viewportWidth / pageWidth;
        const scaleY = viewportHeight / pageHeight;
        setScale(Math.min(scaleX, scaleY));
      }
    };
    calculateScale();
    window.addEventListener('resize', calculateScale);
    return () => window.removeEventListener('resize', calculateScale);
  }, [paginas]);

  const totalPaginas = paginas.length;

  const gerarPDF = async () => {
    // ...
  };

  if (!documento || totalPaginas === 0) {
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
          display: grid;
          place-items: center;
          overflow: hidden;
          padding: 1rem;
        }
        .a4-page-wrapper {
          transform-origin: top center;
          transition: transform 0.2s ease;
        }
        .a4-page {
          width: 794px;
          height: 1123px;
          padding: 75px;
          background: white;
          box-shadow: 0 0 10px rgba(0,0,0,0.15);
          font-family: 'Inter', sans-serif;
          color: black;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .preview-content {
          flex-grow: 1;
          overflow: hidden;
        }
        .preview-header { text-align: center; }
        .preview-footer { font-size: 10px; text-align: center; padding-top: 1rem; flex-shrink: 0; }
        .columns-2 { column-count: 2; column-gap: 40px; }
        .break-inside-avoid { break-inside: avoid; }
        .disciplina-titulo { 
          font-size: 1.25rem;
          font-weight: bold;
          text-align: center;
          background-color: #f3f4f6;
          padding: 0.5rem;
          margin-bottom: 1rem;
          border-radius: 0.25rem;
          /* Correção: removido o break-before que causava o problema de coluna */
        }
      `}</style>
      
      <div ref={viewportRef} className="preview-container">
        {paginas.length > 0 && (
          <div ref={pageWrapperRef} className="a4-page-wrapper" style={{ transform: `scale(${scale})` }}>
            <div key={paginaAtual}>
              {paginas[paginaAtual - 1]}
            </div>
          </div>
        )}
      </div>

      <div className="absolute -left-[9999px] top-0">
          {paginas.map((p, i) => <div key={i} className="a4-page-hidden-for-pdf">{p}</div>)}
      </div>
      
      {totalPaginas > 0 && (
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