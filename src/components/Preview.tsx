// src/components/Preview.tsx (Nova Abordagem com srcDoc)

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Documento } from "@/types";
import { Download, Eye, EyeOff, RefreshCw, Loader2 } from "lucide-react";
import React, { useState, useEffect, useRef, useMemo } from "react";
import ReactDOMServer from "react-dom/server";
import { PagedPreview } from "./PagedPreview";

// URLs dos arquivos de estilo e script (o Vite garante que os caminhos estejam corretos)
import indexCssUrl from '@/index.css?url';
import pagedCssUrl from '@/styles/paged.css?url';
const pagedjsPolyfillUrl = '/paged.polyfill.js'; // Mantemos a referência ao script na pasta /public

// Declaração para TypeScript reconhecer a biblioteca na window do iframe
declare global {
  interface Window {
    Paged: {
      Previewer: new () => {
        preview: (content: string, css: string[], container: HTMLElement) => Promise<any>;
      };
    };
  }
}

interface PreviewProps {
  documento: Documento | null;
}

export function Preview({ documento }: PreviewProps) {
  const [exibirGabarito, setExibirGabarito] = useState(false);
  const [isRendering, setIsRendering] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Gera o HTML do conteúdo da prova/simulado
  const documentoHtmlString = useMemo(() => {
    if (!documento) return "";
    // Usamos renderToStaticMarkup para um HTML mais limpo, sem atributos extras do React
    return ReactDOMServer.renderToStaticMarkup(
      <PagedPreview documento={documento} exibirGabarito={exibirGabarito} />
    );
  }, [documento, exibirGabarito]);
  
  const temQuestoes = documento && (
    (documento.tipo === 'prova' && documento.questoes.length > 0) ||
    (documento.tipo === 'simulado' && documento.cadernos.some(c => c.questoes.length > 0))
  );

  // Gera o documento HTML completo para o srcDoc do iframe
  const iframeSrcDoc = useMemo(() => {
    // Escapa o HTML para que possa ser injetado dentro de um script JavaScript
    const escapedHtml = documentoHtmlString.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
          <link rel="stylesheet" href="${indexCssUrl}">
          <link rel="stylesheet" href="${pagedCssUrl}">
          <script src="${pagedjsPolyfillUrl}"></script>
        </head>
        <body>
          <div id="paged-content-source">${documentoHtmlString}</div>
          <div id="paged-preview-area"></div>
          
          <script type="text/javascript">
            // Este script é executado dentro do iframe assim que ele é carregado
            document.addEventListener('DOMContentLoaded', function() {
              if (window.Paged) {
                const content = document.getElementById('paged-content-source').innerHTML;
                const previewArea = document.getElementById('paged-preview-area');
                
                const paged = new window.Paged.Previewer();
                
                // Informa o componente pai que a renderização terminou
                paged.preview(content, [], previewArea).then(() => {
                  window.parent.postMessage('rendering-complete', '*');
                }).catch(error => {
                  console.error("Erro no Paged.js:", error);
                  window.parent.postMessage('rendering-error', '*');
                });

              } else {
                 console.error("Paged.js não foi carregado a tempo.");
                 window.parent.postMessage('rendering-error', '*');
              }
            });
          </script>
        </body>
      </html>
    `;
  }, [documentoHtmlString]);

  // Efeito para comunicar com o iframe e controlar o estado de carregamento
  useEffect(() => {
    setIsRendering(true);
    
    const handleMessage = (event: MessageEvent) => {
      if (event.source !== iframeRef.current?.contentWindow) return;
      
      if (event.data === 'rendering-complete' || event.data === 'rendering-error') {
        setIsRendering(false);
      }
    };

    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [iframeSrcDoc]); // Re-executa quando o conteúdo do iframe muda

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
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsRendering(true)} // Apenas reinicia o estado de loading
                disabled={isRendering}
                className="text-xs"
              >
                <RefreshCw className={`h-3 w-3 mr-1 ${isRendering ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setExibirGabarito(!exibirGabarito)} 
                className="text-xs"
                disabled={isRendering}
              >
                {exibirGabarito ? <EyeOff className="h-3 w-3 mr-1" /> : <Eye className="h-3 w-3 mr-1" />}
                {exibirGabarito ? "Ocultar Gabarito" : "Mostrar Gabarito"}
              </Button>
              <Button 
                size="sm" 
                onClick={gerarPDF} 
                className="text-xs"
                disabled={isRendering}
              >
                <Download className="h-3 w-3 mr-1" />
                Gerar PDF
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <Separator />

      <div className="p-0 bg-gray-200 flex-grow overflow-auto relative">
        {isRendering && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
            <div className="text-center">
              <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Renderizando documento...</p>
            </div>
          </div>
        )}
        
        {!temQuestoes && !isRendering && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center text-muted-foreground p-4">
              <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Configure ou adicione questões para visualizar o preview</p>
            </div>
          </div>
        )}
        
        {temQuestoes && (
            <iframe
                ref={iframeRef}
                title="Document Preview"
                className="w-full h-full border-0"
                srcDoc={iframeSrcDoc}
                // Usamos on-load para ocultar o spinner caso a comunicação via postMessage falhe
                onLoad={() => setIsRendering(false)} 
            />
        )}
      </div>
    </Card>
  );
}