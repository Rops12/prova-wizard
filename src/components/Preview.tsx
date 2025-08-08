import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Documento } from "@/types";
import { Download, Eye, EyeOff, RefreshCw } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import ReactDOMServer from "react-dom/server";
import { PagedPreview } from "./PagedPreview";
import { injectTypographyStyles } from "@/lib/typography";
import { getPagedController, provaConfig, simuladoConfig } from "@/lib/pagedSetup";

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

      // Determinar configuração baseada no tipo de documento
      const config = documento?.tipo === 'simulado' ? simuladoConfig : provaConfig;

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
              /* Reset e base */
              * {
                box-sizing: border-box;
                margin: 0;
                padding: 0;
              }
              
              body { 
                margin: 0; 
                background-color: transparent; 
                font-family: 'Inter', sans-serif;
                font-size: 11pt;
                line-height: 1.5;
                color: #333;
                overflow: hidden;
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
                text-rendering: optimizeLegibility;
                font-feature-settings: "kern", "liga", "clig", "calt";
              }
              
              /* Interface aprimorada do paged.js */
              .pagedjs_preview-content { 
                overflow: visible !important; 
              }
              
              .pagedjs_pages { 
                display: flex; 
                flex-direction: column; 
                align-items: center; 
                padding: 1.5rem 0; 
                gap: 1.5rem;
                background: #f8fafc;
              }
              
              .pagedjs_page { 
                background: white; 
                box-shadow: 0 8px 25px rgba(0,0,0,0.1), 0 3px 10px rgba(0,0,0,0.05); 
                margin: 0;
                border-radius: 6px;
                overflow: hidden;
                border: 1px solid rgba(0,0,0,0.05);
                transition: box-shadow 0.2s ease;
              }

              .pagedjs_page:hover {
                box-shadow: 0 12px 35px rgba(0,0,0,0.15), 0 5px 15px rgba(0,0,0,0.08);
              }

              /* Otimização para preview em tela */
              @media screen {
                .pagedjs_page {
                  transform: scale(0.85);
                  transform-origin: center top;
                }
              }

              /* Sistema tipográfico avançado */
              h1, h2, h3, h4, h5, h6 {
                font-weight: 600;
                line-height: 1.2;
                margin-bottom: 0.75rem;
                color: #1a1a1a;
                letter-spacing: -0.01em;
              }

              h1 { font-size: 1.5rem; }
              h2 { font-size: 1.3rem; }
              h3 { font-size: 1.1rem; }

              p {
                margin-bottom: 0.75rem;
                text-align: justify;
                hyphens: auto;
                orphans: 2;
                widows: 2;
              }

              /* Controle milimétrico de quebra de questões */
              .questao-container {
                break-inside: avoid;
                page-break-inside: avoid;
                margin-bottom: 1.75rem;
                position: relative;
                orphans: 2;
                widows: 2;
                border-radius: 4px;
                padding: 0.5rem;
                background: rgba(248, 250, 252, 0.3);
              }

              .questao-container.questao-longa {
                break-inside: auto;
                page-break-inside: auto;
                background: rgba(255, 248, 220, 0.3);
              }

              .questao-numero {
                font-weight: 700;
                background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
                border: 1px solid #cbd5e1;
                border-radius: 4px;
                padding: 0.5rem;
                margin-bottom: 0.75rem;
                break-after: avoid;
                page-break-after: avoid;
              }

              .questao-enunciado {
                margin-bottom: 1rem;
                text-align: justify;
                hyphens: auto;
                line-height: 1.6;
                orphans: 3;
                widows: 3;
              }

              /* Controle preciso de alternativas */
              .alternativas-container {
                break-inside: avoid;
                page-break-inside: avoid;
                margin-top: 1rem;
              }

              .alternativas-container.allow-break {
                break-inside: auto;
                page-break-inside: auto;
              }

              .alternativa {
                break-inside: avoid;
                page-break-inside: avoid;
                margin-bottom: 0.5rem;
                display: flex;
                align-items: flex-start;
                gap: 0.5rem;
                padding: 0.25rem;
                border-radius: 3px;
                transition: background-color 0.1s ease;
              }

              .alternativa:nth-child(2n) {
                break-before: auto;
              }

              .alternativa-letra {
                font-weight: 600;
                min-width: 1.5em;
                flex-shrink: 0;
                color: #475569;
              }

              .alternativa-texto {
                flex: 1;
                text-align: justify;
                hyphens: auto;
                line-height: 1.5;
              }

              /* Controle de afirmativas V/F */
              .afirmativas-container {
                break-inside: avoid;
                page-break-inside: avoid;
              }

              .afirmativa {
                break-inside: avoid;
                page-break-inside: avoid;
                margin-bottom: 0.5rem;
                padding: 0.25rem;
                border-left: 3px solid #e2e8f0;
                padding-left: 0.75rem;
              }

              /* Linhas para respostas dissertativas */
              .linha-resposta {
                border-bottom: 1px solid #64748b;
                height: 1.5em;
                margin: 0.4em 0;
                break-inside: avoid;
                page-break-inside: avoid;
              }

              /* Cabeçalhos e estrutura */
              .preview-header {
                margin-bottom: 2rem;
                break-after: avoid;
                page-break-after: avoid;
                padding-bottom: 1rem;
                border-bottom: 2px solid #e2e8f0;
              }

              .disciplina-titulo {
                break-before: page;
                page-break-before: always;
                break-after: avoid;
                page-break-after: avoid;
                font-size: 1.5rem;
                font-weight: 700;
                text-align: center;
                width: 100%;
                column-span: all;
                margin-bottom: 2rem;
                padding: 1.5rem 1rem;
                background: linear-gradient(135deg, #1e293b, #334155);
                color: white;
                border-radius: 6px;
                box-shadow: 0 4px 12px rgba(30, 41, 59, 0.3);
              }

              .capa-simulado {
                break-after: page;
                page-break-after: always;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 80vh;
                text-align: center;
                background: linear-gradient(135deg, #f8fafc, #e2e8f0);
              }

              /* Layout de colunas para simulados */
              .simulado-content {
                column-count: 2;
                column-gap: 15mm;
                column-fill: auto;
                column-rule: 1px solid #e2e8f0;
              }

              .prova-content {
                column-count: 1;
              }

              /* Imagens responsivas */
              img {
                max-width: 100%;
                height: auto;
                break-inside: avoid;
                page-break-inside: avoid;
                margin: 0.75rem 0;
                display: block;
                border-radius: 4px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
              }

              /* Separadores */
              hr {
                border: none;
                border-top: 1px solid #cbd5e1;
                margin: 1.5rem 0;
                break-inside: avoid;
                page-break-inside: avoid;
              }

              /* Melhorias para impressão */
              @media print {
                body {
                  background: white !important;
                  font-size: 10pt;
                }
                
                .pagedjs_page {
                  box-shadow: none !important;
                  margin: 0 !important;
                  border-radius: 0 !important;
                  border: none !important;
                  transform: none !important;
                }
                
                * {
                  -webkit-print-color-adjust: exact !important;
                  color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
                
                .questao-container {
                  break-inside: avoid !important;
                  page-break-inside: avoid !important;
                  background: transparent !important;
                }
                
                .alternativas-container,
                .afirmativas-container {
                  break-inside: avoid !important;
                  page-break-inside: avoid !important;
                }

                h1, h2, h3, h4, h5, h6 {
                  page-break-after: avoid !important;
                }
              }
            </style>
          </head>
          <body>
            <div id="paged-container"></div>
          </body>
        </html>
      `);
      doc.close();

      // Injetar estilos tipográficos no iframe
      const iframeWindow = iframe.contentWindow;
      if (iframeWindow) {
        setTimeout(() => {
          // Carregar paged.js
          const pagedPolyfill = doc.createElement('script');
          pagedPolyfill.src = 'https://unpkg.com/pagedjs/dist/paged.polyfill.js';
          pagedPolyfill.onload = () => {
            // Carregar script customizado
            const customPaged = doc.createElement('script');
            customPaged.src = `/paged.js`;
            customPaged.onload = () => {
              // Inicializar tipografia no iframe
              if (iframeWindow.document) {
                const style = iframeWindow.document.createElement('style');
                style.innerHTML = `
                  /* Estilos tipográficos adicionais */
                  .questao-container {
                    font-feature-settings: "kern", "liga", "clig", "calt";
                  }
                `;
                iframeWindow.document.head.appendChild(style);
              }
              setIsIframeReady(true);
            };
            doc.head.appendChild(customPaged);
          };
          doc.head.appendChild(pagedPolyfill);
        }, 100);
      }
    };

    iframe.addEventListener('load', handleLoad);
    iframe.src = 'about:blank';

    return () => {
      iframe.removeEventListener('load', handleLoad);
    };
  }, [renderKey, documento]);

  useEffect(() => {
    if (isIframeReady && documento && iframeRef.current) {
      setIsRendering(true);
      
      const iframe = iframeRef.current;
      const iframeWindow = iframe.contentWindow;
      const iframeDoc = iframe.contentDocument;

      if (iframeWindow && iframeDoc) {
        try {
          // Gerar conteúdo HTML
          const contentString = ReactDOMServer.renderToString(
            <PagedPreview documento={documento} exibirGabarito={exibirGabarito} />
          );

          const container = iframeDoc.getElementById('paged-container');
          if (container && iframeWindow.PagedPolyfill) {
            // Pré-processar conteúdo para otimizar quebras
            const processedContent = preprocessContent(contentString, documento.tipo);
            
            // Renderizar com paged.js aprimorado
            iframeWindow.PagedPolyfill.render(processedContent, container)
              .then(() => {
                // Pós-processar após renderização
                postProcessRendering(iframeDoc);
                setIsRendering(false);
              })
              .catch((error: any) => {
                console.error('Erro na renderização:', error);
                // Fallback para renderização básica
                container.innerHTML = processedContent;
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

  // Função para pré-processar conteúdo antes da renderização
  const preprocessContent = (content: string, tipoDocumento: string): string => {
    let processed = content;
    
    // Adicionar classes de controle baseadas no tipo
    if (tipoDocumento === 'simulado') {
      processed = processed.replace(
        /class="document-content"/g,
        'class="document-content simulado-content"'
      );
    } else {
      processed = processed.replace(
        /class="document-content"/g,
        'class="document-content prova-content"'
      );
    }
    
    // Adicionar atributos de controle de quebra
    processed = processed.replace(
      /class="questao-container"/g,
      'class="questao-container break-inside-avoid"'
    );
    
    // Marcar questões longas baseado no conteúdo
    processed = processed.replace(
      /<div class="questao-container[^"]*"[^>]*>([\s\S]*?)<\/div>/g,
      (match, content) => {
        const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
        if (wordCount > 100) {
          return match.replace('questao-container', 'questao-container questao-longa');
        }
        return match;
      }
    );
    
    return processed;
  };

  // Função para pós-processar após renderização
  const postProcessRendering = (doc: Document): void => {
    // Otimizar quebras de alternativas em questões longas
    const questoesLongas = doc.querySelectorAll('.questao-longa');
    questoesLongas.forEach((questao) => {
      const alternativas = questao.querySelector('.alternativas-container');
      if (alternativas && alternativas.children.length > 4) {
        alternativas.classList.add('allow-break');
      }
    });
    
    // Ajustar espaçamento final
    const pages = doc.querySelectorAll('.pagedjs_page');
    pages.forEach((page, index) => {
      page.setAttribute('data-page-number', (index + 1).toString());
    });
  };

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