import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Documento } from "@/types";
import { Download, Eye, EyeOff } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import ReactDOMServer from "react-dom/server";
import { PagedPreview } from "./PagedPreview";

// CORREÇÃO: Usando "?url" para obter as URLs dos arquivos de estilo
import indexCssUrl from '@/index.css?url';
import pagedCssUrl from '@/styles/paged.css?url';

// Declaração para que o TypeScript reconheça a biblioteca na window do iframe
declare global {
  interface Window {
    PagedPolyfill: {
      render: (content: string, container: HTMLElement) => void;
    };
    Paged: any;
  }
}

interface PreviewProps {
  documento: Documento | null;
}

export function Preview({ documento }: PreviewProps) {
  const [exibirGabarito, setExibirGabarito] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isIframeReady, setIsIframeReady] = useState(false);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleLoad = () => {
      const doc = iframe.contentDocument;
      if (!doc) return;

      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
            <link rel="stylesheet" href="${indexCssUrl}">
            <link rel="stylesheet" href="${pagedCssUrl}">
            <style>
              /* Estilos para a interface de preview do paged.js */
              body { margin: 0; background-color: #f3f4f6; }
              .pagedjs_preview-content { overflow: visible !important; }
              .pagedjs_pages { display: flex; flex-direction: column; align-items: center; padding: 1rem 0; }
              .pagedjs_page { background: white; box-shadow: 0 0 10px rgba(0,0,0,0.1); margin: 0 0 1rem 0; }
            </style>
          </head>
          <body>
            <div id="paged-container"></div>
          </body>
        </html>
      `);
      doc.close();

      const pagedPolyfill = doc.createElement('script');
      pagedPolyfill.src = 'https://unpkg.com/pagedjs/dist/paged.polyfill.js';
      pagedPolyfill.onload = () => {
        const customPaged = doc.createElement('script');
        customPaged.src = `/paged.js`;
        customPaged.onload = () => {
          setIsIframeReady(true);
        };
        doc.head.appendChild(customPaged);
      };
      doc.head.appendChild(pagedPolyfill);
    };

    iframe.addEventListener('load', handleLoad);
    iframe.src = 'about:blank';

    return () => {
      iframe.removeEventListener('load', handleLoad);
    };
  }, []);

  useEffect(() => {
    if (isIframeReady && documento && iframeRef.current) {
      const iframe = iframeRef.current;
      const iframeWindow = iframe.contentWindow;
      const iframeDoc = iframe.contentDocument;

      if (iframeWindow && iframeDoc) {
        const contentString = ReactDOMServer.renderToString(
          <PagedPreview documento={documento} exibirGabarito={exibirGabarito} />
        );

        const container = iframeDoc.getElementById('paged-container');
        if (container) {
          iframeWindow.PagedPolyfill.render(contentString, container);
        }
      }
    } else if (isIframeReady && !documento && iframeRef.current) {
        const iframeDoc = iframeRef.current.contentDocument;
        if (iframeDoc) {
            const container = iframeDoc.getElementById('paged-container');
            if (container) container.innerHTML = '';
        }
    }
  }, [documento, exibirGabarito, isIframeReady]);

  // CORREÇÃO: Simplificado para usar a função print nativa (interceptada pelo paged.js)
  const gerarPDF = () => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.print();
    }
  };

  const todasQuestoes = React.useMemo(() => {
    if(!documento) return [];
    if(documento.tipo === 'prova') return documento.questoes;
    return documento.cadernos.flatMap(c => c.questoes.map(q => ({...q, disciplina: c.disciplina})));
  }, [documento]);

  const showPreview = documento && todasQuestoes.length > 0;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Preview</CardTitle>
          {showPreview && (
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
        {!showPreview && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center text-muted-foreground p-4">
                  <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Configure ou adicione questões para visualizar o preview</p>
              </div>
            </div>
        )}
        <iframe
          ref={iframeRef}
          title="Document Preview"
          className="w-full h-full border-0"
          style={{ visibility: showPreview ? 'visible' : 'hidden' }}
        />
      </div>
    </Card>
  );
}