import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Documento } from "@/types";
import { Download, Eye, EyeOff, RefreshCw } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import ReactDOMServer from "react-dom/server";
import { PagedPreview } from "./PagedPreview";

// URLs dos arquivos de estilo
import indexCssUrl from '@/index.css?url';
import pagedCssUrl from '@/styles/paged.css?url';

// Declaração para TypeScript reconhecer a biblioteca na window do iframe
declare global {
  interface Window {
    PagedPolyfill: {
      render: (content: string, container: HTMLElement) => Promise<void>;
    };
    Paged: any;
  }
}

interface PreviewProps {
  documento: Documento | null;
}

export function Preview({ documento }: PreviewProps) {
  const [exibirGabarito, setExibirGabarito] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isIframeReady, setIsIframeReady] = useState(false);
  const [renderKey, setRenderKey] = useState(0);

  // Força re-renderização quando necessário
  const forceRerender = () => {
    setRenderKey(prev => prev + 1);
    setIsIframeReady(false);
  };

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
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
            <link rel="stylesheet" href="${indexCssUrl}">
            <link rel="stylesheet" href="${pagedCssUrl}">
            <style>
              /* Estilos específicos para preview e impressão */
              body { 
                margin: 0; 
                background-color: transparent; 
                font-family: 'Inter', sans-serif;
                overflow: hidden;
              }
              
              /* Interface do paged.js */
              .pagedjs_preview-content { 
                overflow: visible !important; 
              }
              
              .pagedjs_pages { 
                display: flex; 
                flex-direction: column; 
                align-items: center; 
                padding: 1rem 0; 
                gap: 1rem;
              }
              
              .pagedjs_page { 
                background: white; 
                box-shadow: 0 4px 12px rgba(0,0,0,0.15); 
                margin: 0;
                border-radius: 4px;
                overflow: hidden;
              }

              /* Garantir que o preview seja idêntico ao PDF */
              @media screen {
                .pagedjs_page {
                  transform: scale(0.8);
                  transform-origin: center top;
                }
              }

              /* Controle de quebra de questões aprimorado */
              .questao-container {
                break-inside: avoid;
                page-break-inside: avoid;
                margin-bottom: 1.5rem;
                position: relative;
              }

              /* Evitar quebra de alternativas */
              .alternativas-container {
                break-inside: avoid;
                page-break-inside: avoid;
              }

              /* Evitar quebra de afirmativas */
              .afirmativas-container {
                break-inside: avoid;
                page-break-inside: avoid;
              }

              /* Linhas de resposta para dissertativas */
              .linha-resposta {
                border-bottom: 1px solid #333;
                height: 1.5em;
                margin: 0.25em 0;
                break-inside: avoid;
              }

              /* Espaçamento consistente */
              .preview-header {
                margin-bottom: 2rem;
                break-after: avoid;
              }

              .disciplina-titulo {
                break-before: page;
                font-size: 1.5rem;
                font-weight: bold;
                text-align: center;
                width: 100%;
                column-span: all;
                margin-bottom: 1.5rem;
                break-after: avoid;
              }

              /* Melhorar renderização de texto */
              * {
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
              }
            </style>
          </head>
          <body>
            <div id="paged-container"></div>
          </body>
        </html>
      `);
      doc.close();

      // Carregar paged.js
      const pagedPolyfill = doc.createElement('script');
      pagedPolyfill.src = 'https://unpkg.com/pagedjs/dist/paged.polyfill.js';
      pagedPolyfill.onload = () => {
        // Carregar script customizado
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
  }, [renderKey]);

  useEffect(() => {
    if (isIframeReady && documento && iframeRef.current) {
      setIsRendering(true);
      
      const iframe = iframeRef.current;
      const iframeWindow = iframe.contentWindow;
      const iframeDoc = iframe.contentDocument;

      if (iframeWindow && iframeDoc) {
        try {
          const contentString = ReactDOMServer.renderToString(
            <PagedPreview documento={documento} exibirGabarito={exibirGabarito} />
          );

          const container = iframeDoc.getElementById('paged-container');
          if (container && iframeWindow.PagedPolyfill) {
            // Renderizar com paged.js
            iframeWindow.PagedPolyfill.render(contentString, container)
              .then(() => {
                setIsRendering(false);
              })
              .catch((error: any) => {
                console.error('Erro na renderização:', error);
                setIsRendering(false);
              });
          }
        } catch (error) {
          console.error('Erro ao gerar conteúdo:', error);
          setIsRendering(false);
        }
      }
    } else if (isIframeReady && !documento && iframeRef.current) {
      const iframeDoc = iframeRef.current.contentDocument;
      if (iframeDoc) {
        const container = iframeDoc.getElementById('paged-container');
        if (container) container.innerHTML = '';
      }
      setIsRendering(false);
    }
  }, [documento, exibirGabarito, isIframeReady]);

  // Função para gerar PDF com configurações otimizadas
  const gerarPDF = () => {
    if (iframeRef.current?.contentWindow) {
      // Configurar opções de impressão para melhor qualidade
      const printWindow = iframeRef.current.contentWindow;
      
      // Aguardar um momento para garantir que a renderização está completa
      setTimeout(() => {
        printWindow.print();
      }, 500);
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

      <div className="p-0 bg-gray-50 flex-grow overflow-hidden relative">
        {isRendering && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 mx-auto mb-2 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Renderizando documento...</p>
            </div>
          </div>
        )}
        
        {!showPreview && !isRendering && (
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
          className="w-full h-full border-0 bg-transparent"
          style={{ 
            visibility: showPreview ? 'visible' : 'hidden',
            backgroundColor: 'transparent'
          }}
          key={renderKey}
        />
      </div>
    </Card>
  );
}