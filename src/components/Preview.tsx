import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Documento } from "@/types";
import { Download, Eye, EyeOff } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { PagedPreview } from "./PagedPreview"; // Assuming PagedPreview is in the same directory or adjust path

declare global {
  interface Window {
    PagedPolyfill: {
      render: (content: string) => void;
    };
  }
}

interface PreviewProps {
  documento: Documento | null;
}

export function Preview({ documento }: PreviewProps) {
  const [exibirGabarito, setExibirGabarito] = useState(false);
  const [gerandoPdf, setGerandoPdf] = useState(false);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (documento && previewContainerRef.current) {
      // Create a temporary div to render the React component to an HTML string
      const tempDiv = document.createElement('div');
      ReactDOM.render(
        <PagedPreview documento={documento} exibirGabarito={exibirGabarito} />,
        tempDiv
      );
      
      // Pass the HTML string to the Paged.js polyfill
      if (window.PagedPolyfill) {
        // Clear previous content before rendering new
        if(previewContainerRef.current) {
            previewContainerRef.current.innerHTML = '';
        }
        window.PagedPolyfill.render(tempDiv.innerHTML);
      }
    }
  }, [documento, exibirGabarito]);

  const gerarPDF = async () => {
    // Paged.js overrides the print functionality to generate a clean PDF
    window.print();
  };
  
  const todasQuestoes = React.useMemo(() => {
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
      
      {/* This container will be the target for Paged.js */}
      <div id="paged-preview-container" ref={previewContainerRef} className="p-4 bg-gray-200 flex-grow overflow-auto">
        {/* Paged.js will render the paginated content here */}
      </div>
    </Card>
  );
}