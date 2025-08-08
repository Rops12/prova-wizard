// src/components/Preview.tsx (Solução Final Corrigida)

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Documento } from "@/types";
import { Download, Eye, EyeOff } from "lucide-react";
import React, { useState, useEffect, useRef, useMemo } from "react";
import ReactDOMServer from "react-dom/server";
import { PagedPreview } from "./PagedPreview";

// Importamos o CONTEÚDO dos ficheiros como texto
import indexCssString from '@/index.css?raw';
import pagedCssString from '@/styles/paged.css?raw';
import pagedScriptString from '@/lib/paged.polyfill.js?raw';

interface PreviewProps {
  documento: Documento | null;
}

export function Preview({ documento }: PreviewProps) {
  const [exibirGabarito, setExibirGabarito] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const documentoHtmlString = useMemo(() => {
    if (!documento) return "";
    return ReactDOMServer.renderToStaticMarkup(
      <PagedPreview documento={documento} exibirGabarito={exibirGabarito} />
    );
  }, [documento, exibirGabarito]);
  
  const temQuestoes = documento && (
    (documento.tipo === 'prova' && documento.questoes.length > 0) ||
    (documento.tipo === 'simulado' && documento.cadernos.some(c => c.questoes.length > 0))
  );

  useEffect(() => {
    // --- MUDANÇA CRÍTICA ---
    // Só executa se tivermos conteúdo e o iframe estiver pronto.
    if (!documentoHtmlString || !iframeRef.current) {
        return;
    }
    
    // Constrói o HTML 100% autónomo
    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
          
          <style>
            ${indexCssString}
          </style>
          <style>
            ${pagedCssString}
          </style>
        </head>
        <body>
          ${documentoHtmlString}
          
          <script type="text/javascript">
            ${pagedScriptString}
          </script>
          
          <script type="text/javascript">
            document.addEventListener('DOMContentLoaded', function() {
              if (window.Paged) {
                new window.Paged.Previewer().preview();
              } else {
                 console.error("Paged.js falhou ao inicializar.");
                 document.body.innerHTML = 'Ocorreu um erro crítico ao carregar a biblioteca de paginação.';
              }
            });
          </script>
        </body>
      </html>
    `;

    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const iframe = iframeRef.current;
    iframe.src = url;

    return () => {
      if (url) {
        URL.revokeObjectURL(url);
      }
    };

  }, [documentoHtmlString]); // A dependência agora é o HTML, garantindo que ele existe.

  const gerarPDF = () => {
    iframeRef.current?.contentWindow?.print();
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Preview</CardTitle>
          {temQuestoes && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setExibirGabarito(!exibirGabarito)} className="text-xs">
                {exibirGabarito ? <EyeOff className="h-3 w-3 mr-1" /> : <Eye className="h-3 w-3 mr-1" />}
                {exibirGabarito ? "Ocultar Gabarito" : "Mostrar Gabarito"}
              </Button>
              <Button size="sm" onClick={gerarPDF} className="text-xs">
                <Download className="h-3 w-3 mr-1" />
                Gerar PDF
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <Separator />

      <div className="p-0 bg-gray-200 flex-grow overflow-auto relative">
        {!temQuestoes ? (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center text-muted-foreground p-4">
              <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Configure ou adicione questões para visualizar o preview</p>
            </div>
          </div>
        ) : (
            <iframe
                ref={iframeRef}
                title="Document Preview"
                className="w-full h-full border-0"
            />
        )}
      </div>
    </Card>
  );
}