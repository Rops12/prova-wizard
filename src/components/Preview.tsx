import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DocumentoProva, DocumentoSimulado, Questao } from "@/types";
import { ChevronLeft, ChevronRight, Download, Eye, EyeOff } from "lucide-react";
import { useState, useMemo } from "react";

interface PreviewProps {
  documento: DocumentoProva | DocumentoSimulado | null;
  mostrarGabarito?: boolean;
}

export function Preview({ documento, mostrarGabarito = false }: PreviewProps) {
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [exibirGabarito, setExibirGabarito] = useState(mostrarGabarito);

  // Mock: calcular páginas baseado no conteúdo
  const paginas = useMemo(() => {
    if (!documento) return [];
    
    // Para prova: questões em página única
    if (documento.tipo === "prova") {
      return [documento.questoes];
    }
    
    // Para simulado: questões agrupadas por disciplina
    const todasQuestoes = documento.cadernos.flatMap(caderno => 
      caderno.questoes.map(questao => ({ ...questao, disciplina: caderno.disciplina }))
    );
    
    // Simular divisão em páginas (mock)
    const questoesPorPagina = documento.template.configuracao.colunas === 2 ? 6 : 8;
    const paginas: Questao[][] = [];
    
    for (let i = 0; i < todasQuestoes.length; i += questoesPorPagina) {
      paginas.push(todasQuestoes.slice(i, i + questoesPorPagina));
    }
    
    return paginas.length > 0 ? paginas : [[]];
  }, [documento]);

  const totalPaginas = paginas.length;
  const questoesPaginaAtual = paginas[paginaAtual - 1] || [];

  const gerarPDF = async () => {
    // Mock da geração de PDF
    console.log("Gerando PDF...", documento);
    // Aqui seria integrado jsPDF + html2canvas
  };

  const renderizarQuestao = (questao: Questao, numeroQuestao: number) => {
    return (
      <div key={questao.id} className="mb-6 break-inside-avoid">
        <div className="flex items-start gap-3">
          <div className="font-semibold text-sm bg-primary/10 rounded-full w-6 h-6 flex items-center justify-center mt-1 flex-shrink-0">
            {numeroQuestao}
          </div>
          <div className="flex-1 space-y-3">
            {/* Enunciado */}
            <div className="text-sm leading-relaxed">
              {questao.enunciado}
            </div>
            
            {/* Imagem mock */}
            {questao.imagem && (
              <div className="w-32 h-24 bg-muted rounded border flex items-center justify-center">
                <span className="text-xs text-muted-foreground">Imagem</span>
              </div>
            )}
            
            {/* Alternativas - Múltipla Escolha */}
            {questao.tipo === "multipla_escolha" && questao.alternativas && (
              <div className="space-y-2">
                {questao.alternativas.map((alternativa, index) => (
                  <div key={alternativa.id} className="flex items-start gap-2 text-sm">
                    <span className="font-medium mt-0.5 flex-shrink-0">
                      {String.fromCharCode(65 + index)})
                    </span>
                    <span className={`flex-1 ${
                      exibirGabarito && alternativa.correta 
                        ? "bg-secondary-light text-secondary font-medium rounded px-1" 
                        : ""
                    }`}>
                      {alternativa.texto}
                    </span>
                  </div>
                ))}
              </div>
            )}
            
            {/* Linhas - Dissertativa */}
            {questao.tipo === "dissertativa" && (
              <div className="space-y-2">
                {Array.from({ length: questao.linhasResposta || 5 }).map((_, index) => (
                  <div key={index} className="border-b border-border h-6"></div>
                ))}
              </div>
            )}
            
            {/* Afirmativas - Verdadeiro ou Falso */}
            {questao.tipo === "verdadeiro_falso" && questao.afirmativas && (
              <div className="space-y-2">
                {questao.afirmativas.map((afirmativa, index) => (
                  <div key={afirmativa.id} className="flex items-start gap-3 text-sm">
                    <span className="font-medium mt-0.5 flex-shrink-0">
                      {index + 1}.
                    </span>
                    <span className="flex-1">
                      {afirmativa.texto}
                    </span>
                    <div className="flex gap-3 flex-shrink-0">
                      <label className="flex items-center gap-1">
                        <span className="text-xs">V</span>
                        <div className={`w-4 h-4 border rounded ${
                          exibirGabarito && afirmativa.resposta === "V" 
                            ? "bg-secondary border-secondary" 
                            : ""
                        }`}></div>
                      </label>
                      <label className="flex items-center gap-1">
                        <span className="text-xs">F</span>
                        <div className={`w-4 h-4 border rounded ${
                          exibirGabarito && afirmativa.resposta === "F" 
                            ? "bg-secondary border-secondary" 
                            : ""
                        }`}></div>
                      </label>
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
          <CardTitle className="text-lg">Preview</CardTitle>
          <div className="flex items-center gap-2">
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
        
        {/* Conteúdo da página atual */}
        <div className={`space-y-4 ${
          documento.template.configuracao.colunas === 2 
            ? "columns-2 gap-6" 
            : ""
        }`}>
          {questoesPaginaAtual.length > 0 ? (
            questoesPaginaAtual.map((questao, index) => 
              renderizarQuestao(
                questao, 
                (paginaAtual - 1) * questoesPaginaAtual.length + index + 1
              )
            )
          ) : (
            <div className="text-center text-muted-foreground py-12">
              <p>Adicione questões para visualizar o conteúdo</p>
            </div>
          )}
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
            
            <span className="text-sm text-muted-foreground">
              Página {paginaAtual} de {totalPaginas}
            </span>
            
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