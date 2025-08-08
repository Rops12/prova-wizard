// src/components/Preview.tsx (Corrigido)

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Documento } from "@/types";
import { Download, Eye, EyeOff, RefreshCw, Loader2 } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import ReactDOMServer from "react-dom/server";
import { PagedPreview } from "./PagedPreview";

// URLs dos arquivos de estilo
import indexCssUrl from '@/index.css?url';
import pagedCssUrl from '@/styles/paged.css?url';

// CORREÇÃO: Usar a URL da CDN para o script do paged.js
const pagedjsPolyfillUrl = 'https://unpkg.com/pagedjs@0.4.3/dist/paged.polyfill.js';

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
  const [renderKey, setRenderKey] = useState(0); // Usado para forçar a recriação do iframe

  // Memoiza o conteúdo HTML a ser renderizado para evitar re-renderizações desnecessárias.
  const documentoHtml = React.useMemo(() => {
    if (!documento) return "";
    return ReactDOMServer.renderToString(
      <PagedPreview documento={documento} exibirGabarito={exibirGabarito} />
    );
  }, [documento, exibirGabarito]);
  
  const temQuestoes = documento && (
    (documento.tipo === 'prova' && documento.questoes.length > 0) ||
    (documento.tipo === 'simulado' && documento.cadernos.some(c => c.questoes.length > 0))
  );

  // Efeito para configurar e renderizar o conteúdo no iframe
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    setIsRendering(true);

    const handleLoad = () => {
      const doc = iframe.contentDocument;
      const win = iframe.contentWindow;
      if (!doc || !win) return;

      // Monta o <head> do iframe
      doc.head.innerHTML = `
        <meta charset="UTF-8">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
        <link rel="stylesheet" href="${indexCssUrl}">
        <link rel="stylesheet" href="${pagedCssUrl}">
      `;
      
      // Cria o container do corpo
      doc.body.innerHTML = '<div id="paged-container"></div>';
      const container = doc.getElementById('paged-container')!;

      // Se não há documento, não faz mais nada.
      if (!documentoHtml) {
        setIsRendering(false);
        return;
      }
      
      // Carrega o script do paged.js a partir da CDN
      const script = doc.createElement('script');
      script.src = pagedjsPolyfillUrl;
      script.onload = () => {
        if (win.Paged) {
          const paged = new win.Paged.Previewer();
          paged.preview(documentoHtml, [], container)
            .then(() => setIsRendering(false))
            .catch(error => {
              console.error("Erro ao renderizar com Paged.js:", error);
              // Fallback: mostra o conteúdo sem paginação em caso de erro
              container.innerHTML = documentoHtml; 
              setIsRendering(false);
            });
        }
      };
      doc.head.appendChild(script);
    };

    iframe.addEventListener('load', handleLoad);
    iframe.src = 'about:blank'; // Dispara o evento 'load'

    return () => {
      iframe.removeEventListener('load', handleLoad);
    };
  }, [documentoHtml, renderKey]); // Re-executa quando o HTML ou a chave de renderização mudam

  // Função para gerar o PDF
  const gerarPDF = () => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.print();
    }
  };

  const forceRerender = () => setRenderKey(prev => prev + 1);

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
                onClick={forceRerender}
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
        
        <iframe
          ref={iframeRef}
          title="Document Preview"
          className="w-full h-full border-0"
          style={{ visibility: temQuestoes ? 'visible' : 'hidden' }}
          key={renderKey} // A chave força a recriação do iframe
        />
      </div>
    </Card>
  );
}