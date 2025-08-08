// Configuração avançada do Paged.js para controle preciso de paginação

export interface PagedConfig {
  size: string;
  margins: {
    top: string;
    right: string;
    bottom: string;
    left: string;
  };
  footer?: {
    enabled: boolean;
    content: string;
    position: 'center' | 'left' | 'right';
  };
  header?: {
    enabled: boolean;
    content: string;
    position: 'center' | 'left' | 'right';
  };
  columns?: number;
  orphans: number;
  widows: number;
}

export const defaultPagedConfig: PagedConfig = {
  size: 'A4',
  margins: {
    top: '20mm',
    right: '15mm',
    bottom: '26mm',
    left: '15mm',
  },
  footer: {
    enabled: true,
    content: '"Página " counter(page) " de " counter(pages)',
    position: 'center',
  },
  orphans: 2,
  widows: 2,
};

export const provaConfig: PagedConfig = {
  ...defaultPagedConfig,
  columns: 1,
};

export const simuladoConfig: PagedConfig = {
  ...defaultPagedConfig,
  columns: 2,
  margins: {
    top: '15mm',
    right: '12mm',
    bottom: '20mm',
    left: '12mm',
  },
};

export const generatePageCSS = (config: PagedConfig): string => {
  const { size, margins, footer, header, columns, orphans, widows } = config;
  
  let css = `
    @page {
      size: ${size};
      margin: ${margins.top} ${margins.right} ${margins.bottom} ${margins.left};
      orphans: ${orphans};
      widows: ${widows};
  `;
  
  if (footer?.enabled) {
    css += `
      @bottom-${footer.position} {
        content: ${footer.content};
        font-size: 9pt;
        color: #666;
        font-family: 'Inter', sans-serif;
        padding-top: 5mm;
      }
    `;
  }
  
  if (header?.enabled) {
    css += `
      @top-${header.position} {
        content: ${header.content};
        font-size: 9pt;
        color: #666;
        font-family: 'Inter', sans-serif;
        padding-bottom: 5mm;
      }
    `;
  }
  
  css += `}`;
  
  if (columns && columns > 1) {
    css += `
      .document-content {
        column-count: ${columns};
        column-gap: 15mm;
        column-fill: auto;
        column-rule: none;
      }
    `;
  }
  
  // Regras avançadas de quebra de página
  css += `
    /* Controle avançado de quebra de elementos */
    .questao-container {
      break-inside: avoid;
      page-break-inside: avoid;
      orphans: ${orphans};
      widows: ${widows};
      margin-bottom: 1.5rem;
      position: relative;
    }
    
    /* Permitir quebra em questões muito longas */
    .questao-container.questao-longa {
      break-inside: auto;
      page-break-inside: auto;
    }
    
    .questao-container.questao-longa .questao-enunciado {
      orphans: 3;
      widows: 3;
    }
    
    /* Evitar quebra em grupos de alternativas */
    .alternativas-container {
      break-inside: avoid;
      page-break-inside: avoid;
    }
    
    /* Permitir quebra entre alternativas se necessário */
    .alternativa {
      break-inside: avoid;
      page-break-inside: avoid;
    }
    
    .alternativa + .alternativa {
      break-before: auto;
    }
    
    /* Controle para afirmativas V/F */
    .afirmativas-container {
      break-inside: avoid;
      page-break-inside: avoid;
    }
    
    .afirmativa {
      break-inside: avoid;
      page-break-inside: avoid;
    }
    
    /* Controle de quebra para cabeçalhos */
    .preview-header {
      break-after: avoid;
      page-break-after: avoid;
      margin-bottom: 2rem;
    }
    
    /* Títulos de disciplina em simulados */
    .disciplina-titulo {
      break-before: page;
      page-break-before: always;
      break-after: avoid;
      page-break-after: avoid;
      column-span: all;
      width: 100%;
      text-align: center;
      font-size: 1.5rem;
      font-weight: bold;
      margin-bottom: 1.5rem;
      padding: 1rem 0;
      border-bottom: 2px solid #333;
    }
    
    /* Capa de simulado */
    .capa-simulado {
      break-after: page;
      page-break-after: always;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 80vh;
      text-align: center;
    }
    
    /* Linhas para respostas dissertativas */
    .linha-resposta {
      border-bottom: 1px solid #333;
      height: 1.5em;
      margin: 0.25em 0;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    
    /* Otimizações para imagens */
    .questao-container img {
      max-width: 100%;
      height: auto;
      break-inside: avoid;
      page-break-inside: avoid;
      margin: 0.5rem 0;
      display: block;
    }
    
    /* Numeração destacada de questões */
    .questao-numero {
      background-color: #f0f0f0 !important;
      border: 1px solid #ccc !important;
      break-after: avoid;
      page-break-after: avoid;
    }
    
    /* Controle fino de quebras */
    .break-before-page {
      break-before: page;
      page-break-before: always;
    }
    
    .break-after-avoid {
      break-after: avoid;
      page-break-after: avoid;
    }
    
    .break-inside-avoid {
      break-inside: avoid;
      page-break-inside: avoid;
    }
    
    .break-inside-auto {
      break-inside: auto;
      page-break-inside: auto;
    }
    
    /* Otimizações para impressão */
    @media print {
      body {
        background: white !important;
      }
      
      .pagedjs_page {
        box-shadow: none !important;
        margin: 0 !important;
        border-radius: 0 !important;
      }
      
      /* Garantir que cores sejam preservadas */
      * {
        -webkit-print-color-adjust: exact !important;
        color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      
      /* Reforçar regras de quebra para impressão */
      .questao-container {
        break-inside: avoid !important;
        page-break-inside: avoid !important;
      }
      
      .alternativas-container,
      .afirmativas-container {
        break-inside: avoid !important;
        page-break-inside: avoid !important;
      }
    }
    
    /* Estilos específicos para preview na tela */
    @media screen {
      .pagedjs_pages {
        background: #f3f4f6;
        padding: 2rem 1rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
      }
      
      .pagedjs_page {
        background: white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        border-radius: 4px;
        margin-bottom: 0;
        overflow: hidden;
        transform: scale(0.85);
        transform-origin: center top;
      }
    }
  `;
  
  return css;
};

// Classe para controle avançado do Paged.js
export class PagedController {
  private previewer: any = null;
  private isReady = false;
  private config: PagedConfig;
  
  constructor(config: PagedConfig = defaultPagedConfig) {
    this.config = config;
  }
  
  async initialize(): Promise<void> {
    if (typeof window === 'undefined') return;
    
    // Aguardar o Paged.js estar disponível
    while (!window.Paged) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    try {
      this.previewer = new window.Paged.Previewer();
      this.setupEventHandlers();
      this.isReady = true;
    } catch (error) {
      console.error('Erro ao inicializar Paged.js:', error);
      throw error;
    }
  }
  
  private setupEventHandlers(): void {
    if (!this.previewer) return;
    
    // Controle inteligente de quebras de página
    this.previewer.on('page', (event: any) => {
      const { page } = event.detail;
      
      // Detectar questões órfãs (apenas número visível)
      this.handleOrphanedQuestions(page);
      
      // Otimizar espaçamento entre questões
      this.optimizeQuestionSpacing(page);
      
      // Ajustar quebras de alternativas
      this.optimizeAlternativeBreaks(page);
    });
    
    // Controle de renderização de nós
    this.previewer.on('renderNode', (event: any) => {
      const { node } = event.detail;
      
      // Aplicar classes de controle baseadas no conteúdo
      this.applyBreakClasses(node);
    });
    
    // Pós-processamento da página
    this.previewer.on('pageCompleted', (event: any) => {
      const { page } = event.detail;
      this.postProcessPage(page);
    });
  }
  
  private handleOrphanedQuestions(page: HTMLElement): void {
    const questoes = page.querySelectorAll('.questao-container');
    
    questoes.forEach((questao) => {
      const rect = questao.getBoundingClientRect();
      const pageRect = page.getBoundingClientRect();
      
      // Se a questão está muito próxima do final da página
      if (pageRect.bottom - rect.top < 100) {
        const enunciado = questao.querySelector('.questao-enunciado');
        if (enunciado && enunciado.getBoundingClientRect().height < 50) {
          // Forçar quebra para próxima página
          (questao as HTMLElement).style.breakBefore = 'page';
        }
      }
    });
  }
  
  private optimizeQuestionSpacing(page: HTMLElement): void {
    const questoes = page.querySelectorAll('.questao-container');
    
    questoes.forEach((questao, index) => {
      if (index > 0) {
        (questao as HTMLElement).style.marginTop = '1.5rem';
      }
    });
  }
  
  private optimizeAlternativeBreaks(page: HTMLElement): void {
    const alternativas = page.querySelectorAll('.alternativas-container');
    
    alternativas.forEach((container) => {
      const alternatives = container.querySelectorAll('.alternativa');
      
      // Se há muitas alternativas, permitir quebra entre elas
      if (alternatives.length > 4) {
        (container as HTMLElement).style.breakInside = 'auto';
        
        alternatives.forEach((alt, index) => {
          if (index > 0 && index % 2 === 0) {
            (alt as HTMLElement).style.breakBefore = 'auto';
          }
        });
      }
    });
  }
  
  private applyBreakClasses(node: HTMLElement): void {
    // Adicionar classes baseadas no tamanho do conteúdo
    if (node.classList.contains('questao-container')) {
      const height = node.scrollHeight;
      
      if (height > 800) {
        node.classList.add('questao-longa');
      }
    }
  }
  
  private postProcessPage(page: HTMLElement): void {
    // Ajustes finais na página
    const pageNumber = page.getAttribute('data-page-number');
    
    // Adicionar atributos para debug se necessário
    if (process.env.NODE_ENV === 'development') {
      page.setAttribute('data-processed', 'true');
    }
  }
  
  async render(content: string, container: HTMLElement): Promise<void> {
    if (!this.isReady) {
      throw new Error('PagedController não foi inicializado');
    }
    
    try {
      // Injeta o CSS da configuração
      this.injectConfigCSS();
      
      // Pré-processa o conteúdo
      const processedContent = this.preprocessContent(content);
      
      // Renderiza com o Paged.js
      await this.previewer.preview(processedContent, ['/styles/paged.css'], container);
      
    } catch (error) {
      console.error('Erro na renderização:', error);
      
      // Fallback: renderização simples
      container.innerHTML = content;
      throw error;
    }
  }
  
  private injectConfigCSS(): void {
    const existingStyle = document.getElementById('paged-config-css');
    if (existingStyle) {
      existingStyle.remove();
    }
    
    const style = document.createElement('style');
    style.id = 'paged-config-css';
    style.innerHTML = generatePageCSS(this.config);
    document.head.appendChild(style);
  }
  
  private preprocessContent(content: string): string {
    // Adicionar atributos de controle ao HTML
    let processed = content;
    
    // Marcar questões para controle de quebra
    processed = processed.replace(
      /<div class="questao-container"/g,
      '<div class="questao-container break-inside-avoid"'
    );
    
    // Marcar disciplinas para quebra de página
    processed = processed.replace(
      /<div class="disciplina-titulo"/g,
      '<div class="disciplina-titulo break-before-page break-after-avoid"'
    );
    
    return processed;
  }
  
  updateConfig(newConfig: Partial<PagedConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.injectConfigCSS();
  }
  
  getConfig(): PagedConfig {
    return { ...this.config };
  }
}

// Instância global
let globalPagedController: PagedController | null = null;

export const getPagedController = (config?: PagedConfig): PagedController => {
  if (!globalPagedController) {
    globalPagedController = new PagedController(config);
  }
  return globalPagedController;
};

export const initializePaged = async (config?: PagedConfig): Promise<PagedController> => {
  const controller = getPagedController(config);
  await controller.initialize();
  return controller;
};