import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DocumentoProva, DocumentoSimulado, Questao } from "@/types";
import { ChevronLeft, ChevronRight, Download, Eye, EyeOff, Settings } from "lucide-react";
import { useState, useMemo } from "react";
import { PageBreakManager, QuestionPartRenderer, type PageContent } from "./PageBreakManager";

interface PreviewProps {
  documento: DocumentoProva | DocumentoSimulado | null;
  mostrarGabarito?: boolean;
}

export function Preview({ documento, mostrarGabarito = false }: PreviewProps) {
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [exibirGabarito, setExibirGabarito] = useState(mostrarGabarito);
  const [showSettings, setShowSettings] = useState(false);
  const [pageHeight, setPageHeight] = useState(800); // Altura simulada A4
  const [safetyMargin, setSafetyMargin] = useState(50);

  // Instância do gerenciador de quebras
  const pageBreakManager = useMemo(() => 
    new PageBreakManager(pageHeight, safetyMargin), 
    [pageHeight, safetyMargin]
  );

  // Extrair questões do documento
  const questoes = useMemo(() => {
    if (!documento) return [];
    
    if (documento.tipo === "prova") {
      return documento.questoes;
    } else {
      // Simulado: questões de todos os cadernos
      return documento.cadernos.flatMap(caderno => 
        caderno.questoes.map(questao => ({ 
          ...questao, 
          disciplina: caderno.disciplina 
        }))
      );
    }
  }, [documento]);

  // Calcular páginas com quebras inteligentes
  const paginas: PageContent[] = useMemo(() => {
    if (questoes.length === 0) return [{ parts: [], height: 0 }];
    return pageBreakManager.calculatePages(questoes);
  }, [questoes, pageBreakManager]);

  const totalPaginas = paginas.length;
  const paginaAtualContent = paginas[paginaAtual - 1];

  const gerarPDF = async () => {
    console.log("Gerando PDF com quebras inteligentes...", { 
      totalPaginas,
      documento,
      configuracao: { pageHeight, safetyMargin }
    });
    // Implementar geração de PDF considerando as quebras
  };

  if (!documento) {
    return (
      <Card className="h-full">
        <CardContent className="h-full flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
              <Eye className="h-8 w-8" />
            </div>
            <p>Configure os dados para visualizar o preview</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Preview - Quebra Inteligente</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="h-3 w-3 mr-1" />
              Config
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setExibirGabarito(!exibirGabarito)}
              className="text-xs"
            >
              {exibirGabarito ? (
                <>
                  <EyeOff className="h-3 w-3 mr-1" />
                  Ocultar Gabarito
                </>
              ) : (
                <>
                  <Eye className="h-3 w-3 mr-1" />
                  Mostrar Gabarito
                </>
              )}
            </Button>
            <Button
              size="sm"
              onClick={gerarPDF}
              className="text-xs"
            >
              <Download className="h-3 w-3 mr-1" />
              Gerar PDF
            </Button>
          </div>
        </div>
        
        {/* Configurações */}
        {showSettings && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1">
                  Altura da página A4 (px)
                </label>
                <input
                  type="number"
                  value={pageHeight}
                  onChange={(e) => setPageHeight(Number(e.target.value))}
                  className="w-full px-2 py-1 text-xs border rounded"
                  min="400"
                  max="1200"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">
                  Margem de segurança (px)
                </label>
                <input
                  type="number"
                  value={safetyMargin}
                  onChange={(e) => setSafetyMargin(Number(e.target.value))}
                  className="w-full px-2 py-1 text-xs border rounded"
                  min="20"
                  max="100"
                />
              </div>
            </div>
            <div className="mt-3 text-xs text-gray-600 flex justify-between">
              <span>Páginas: {totalPaginas}</span>
              <span>Altura atual: {paginaAtualContent?.height || 0}px / {pageHeight}px</span>
            </div>
          </div>
        )}
      </CardHeader>
      
      <Separator />
      
      <CardContent className="flex-1 p-6">
        {/* Cabeçalho do documento */}
        <div className="mb-6">
          {documento.tipo === "prova" && (
            <div className="text-center space-y-2">
              <h1 className="text-xl font-bold">
                {documento.template.nome}
              </h1>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Disciplina: {documento.metadados.disciplina}</p>
                <p>Série: {documento.metadados.serie} | Turma: {documento.metadados.turma}</p>
                {documento.metadados.professor && (
                  <p>Professor(a): {documento.metadados.professor}</p>
                )}
              </div>
            </div>
          )}
          
          {documento.tipo === "simulado" && (
            <div className="text-center space-y-2">
              <h1 className="text-xl font-bold">
                {documento.nome}
              </h1>
              <p className="text-sm text-muted-foreground">
                {documento.template.nome}
              </p>
            </div>
          )}
        </div>
        
        <Separator className="mb-6" />
        
        {/* Simulação visual da página A4 */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-2 bg-gray-50">
          <div 
            className="bg-white rounded shadow-sm overflow-hidden"
            style={{ 
              minHeight: `${pageHeight}px`, 
              maxHeight: `${pageHeight}px` 
            }}
          >
            <div className="p-6 h-full overflow-hidden">
              {/* Conteúdo da página atual */}
              <div className={`space-y-4 ${
                documento.template.configuracao.colunas === 2 
                  ? "columns-2 gap-6" 
                  : ""
              }`}>
                {paginaAtualContent && paginaAtualContent.parts.length > 0 ? (
                  paginaAtualContent.parts.map((part, index) => (
                    <QuestionPartRenderer
                      key={`${part.questaoId}-${part.partNumber || 1}-${index}`}
                      part={part}
                      exibirGabarito={exibirGabarito}
                      originalQuestoes={questoes}
                    />
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-12">
                    <p>Adicione questões para visualizar o conteúdo</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Informações da página */}
        <div className="mt-2 flex justify-between text-xs text-gray-500">
          <span>
            Questões na página: {paginaAtualContent?.parts.length || 0}
          </span>
          <span>
            Ocupação: {Math.round(((paginaAtualContent?.height || 0) / pageHeight) * 100)}%
          </span>
        </div>
      </CardContent>
      
      {/* Navegação de páginas */}
      {totalPaginas > 1 && (
        <>
          <Separator />
          <div className="p-4 flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPaginaAtual(Math.max(1, paginaAtual - 1))}
              disabled={paginaAtual === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </Button>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Página {paginaAtual} de {totalPaginas}</span>
              {paginaAtualContent && paginaAtualContent.parts.some(p => p.isPartial) && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                  📄 Contém questões quebradas
                </span>
              )}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPaginaAtual(Math.min(totalPaginas, paginaAtual + 1))}
              disabled={paginaAtual === totalPaginas}
            >
              Próxima
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </>
      )}
    </Card>
  );
}