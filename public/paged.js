// Polyfill aprimorado para o paged.js com controle milimétrico de paginação
class PagedPolyfill {
  constructor() {
    this.previewer = null;
    this.isReady = false;
    this.config = {
      orphans: 2,
      widows: 2,
      questionMinHeight: 100,
      alternativeBreakThreshold: 4
    };
    this.initializePreviewer();
  }

  async initializePreviewer() {
    // Aguardar o paged.js estar disponível
    while (!window.Paged) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    try {
      this.previewer = new window.Paged.Previewer();
      this.setupAdvancedBreakHandlers();
      this.isReady = true;
    } catch (error) {
      console.error('Erro ao inicializar paged.js:', error);
    }
  }

  setupAdvancedBreakHandlers() {
    if (!this.previewer) return;

    // Controle milimétrico de quebra de página
    this.previewer.on('page', (event) => {
      const { page } = event.detail;
      
      this.handleQuestionBreaks(page);
      this.handleOrphanWidowControl(page);
      this.optimizePageSpacing(page);
    });

    // Controle detalhado de renderização de nós
    this.previewer.on('renderNode', (event) => {
      const { node } = event.detail;
      this.applyNodeBreakRules(node);
    });

    // Pós-processamento de página completa
    this.previewer.on('pageCompleted', (event) => {
      const { page } = event.detail;
      this.postProcessPage(page);
    });

    // Controle de overflow de conteúdo
    this.previewer.on('overflow', (event) => {
      const { node } = event.detail;
      this.handleContentOverflow(node);
    });
  }

  handleQuestionBreaks(page) {
    const questoes = page.querySelectorAll('.questao-container');
    
    questoes.forEach((questao, index) => {
      const rect = questao.getBoundingClientRect();
      const pageRect = page.getBoundingClientRect();
      const availableSpace = pageRect.bottom - rect.top;
      
      // Detectar questões órfãs (apenas número visível)
      const enunciado = questao.querySelector('.questao-enunciado');
      const alternativas = questao.querySelector('.alternativas-container, .afirmativas-container');
      
      if (enunciado && alternativas) {
        const enunciadoHeight = enunciado.getBoundingClientRect().height;
        const alternativasHeight = alternativas.getBoundingClientRect().height;
        
        // Se só o enunciado cabe na página, mover tudo para próxima
        if (availableSpace < (enunciadoHeight + 50) && alternativasHeight > 0) {
          questao.style.breakBefore = 'page';
          questao.style.pageBreakBefore = 'always';
        }
        
        // Para questões muito longas, permitir quebra interna
        if ((enunciadoHeight + alternativasHeight) > (pageRect.height * 0.8)) {
          questao.classList.add('questao-longa');
          questao.style.breakInside = 'auto';
          questao.style.pageBreakInside = 'auto';
          
          // Controlar quebra nas alternativas
          this.handleLongQuestionBreaks(alternativas);
        }
      }
      
      // Evitar quebras próximas ao final da página
      if (availableSpace < this.config.questionMinHeight && availableSpace > 0) {
        questao.style.breakBefore = 'page';
        questao.style.pageBreakBefore = 'always';
      }
    });
  }

  handleLongQuestionBreaks(container) {
    if (!container) return;
    
    const items = container.querySelectorAll('.alternativa, .afirmativa');
    
    if (items.length > this.config.alternativeBreakThreshold) {
      container.style.breakInside = 'auto';
      container.style.pageBreakInside = 'auto';
      
      // Permitir quebra a cada 2-3 alternativas
      items.forEach((item, index) => {
        if (index > 0 && index % 2 === 0) {
          item.style.breakBefore = 'auto';
          item.style.pageBreakBefore = 'auto';
        } else {
          item.style.breakInside = 'avoid';
          item.style.pageBreakInside = 'avoid';
        }
      });
    }
  }

  handleOrphanWidowControl(page) {
    const paragraphs = page.querySelectorAll('p, .questao-enunciado, .alternativa-texto');
    
    paragraphs.forEach((p) => {
      p.style.orphans = this.config.orphans;
      p.style.widows = this.config.widows;
      
      // Controle adicional para texto longo
      const wordCount = p.textContent.split(' ').length;
      if (wordCount > 50) {
        p.style.orphans = Math.max(3, this.config.orphans);
        p.style.widows = Math.max(3, this.config.widows);
      }
    });
  }

  optimizePageSpacing(page) {
    // Ajustar espaçamento vertical para melhor distribuição
    const questoes = page.querySelectorAll('.questao-container');
    const pageHeight = page.getBoundingClientRect().height;
    const contentHeight = Array.from(questoes).reduce((total, q) => {
      return total + q.getBoundingClientRect().height;
    }, 0);
    
    // Se há espaço sobrando, distribuir entre questões
    if (contentHeight < pageHeight * 0.85 && questoes.length > 1) {
      const extraSpace = (pageHeight * 0.85 - contentHeight) / (questoes.length - 1);
      
      questoes.forEach((questao, index) => {
        if (index > 0) {
          const currentMargin = parseFloat(getComputedStyle(questao).marginTop) || 0;
          questao.style.marginTop = `${currentMargin + Math.min(extraSpace, 20)}px`;
        }
      });
    }
  }

  applyNodeBreakRules(node) {
    if (!node.classList) return;
    
    // Regras específicas por tipo de elemento
    if (node.classList.contains('questao-container')) {
      node.style.breakInside = 'avoid';
      node.style.pageBreakInside = 'avoid';
      
      // Adicionar margem mínima
      if (!node.style.marginBottom) {
        node.style.marginBottom = '1.5rem';
      }
    }
    
    if (node.classList.contains('alternativas-container') || 
        node.classList.contains('afirmativas-container')) {
      node.style.breakInside = 'avoid';
      node.style.pageBreakInside = 'avoid';
    }
    
    if (node.classList.contains('disciplina-titulo')) {
      node.style.breakBefore = 'page';
      node.style.pageBreakBefore = 'always';
      node.style.breakAfter = 'avoid';
      node.style.pageBreakAfter = 'avoid';
      node.style.columnSpan = 'all';
    }
    
    if (node.classList.contains('preview-header')) {
      node.style.breakAfter = 'avoid';
      node.style.pageBreakAfter = 'avoid';
    }
    
    // Controle para imagens
    if (node.tagName === 'IMG') {
      node.style.breakInside = 'avoid';
      node.style.pageBreakInside = 'avoid';
      node.style.maxWidth = '100%';
      node.style.height = 'auto';
    }
  }

  postProcessPage(page) {
    // Verificar se há elementos cortados
    const elements = page.querySelectorAll('*');
    
    elements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const pageRect = page.getBoundingClientRect();
      
      // Se elemento está cortado verticalmente
      if (rect.bottom > pageRect.bottom + 5) {
        const parent = el.closest('.questao-container');
        if (parent && !parent.classList.contains('questao-longa')) {
          parent.style.breakBefore = 'page';
          parent.style.pageBreakBefore = 'always';
        }
      }
    });
    
    // Adicionar classe para debug em desenvolvimento
    if (window.location.hostname === 'localhost') {
      page.setAttribute('data-processed', 'true');
    }
  }

  handleContentOverflow(node) {
    // Estratégias para lidar com overflow
    if (node.classList.contains('questao-container')) {
      // Tentar compactar primeiro
      const enunciado = node.querySelector('.questao-enunciado');
      if (enunciado) {
        enunciado.style.lineHeight = '1.4';
        enunciado.style.fontSize = '0.95em';
      }
      
      // Se ainda não couber, permitir quebra
      if (node.scrollHeight > node.clientHeight * 1.2) {
        node.classList.add('questao-longa');
        this.handleLongQuestionBreaks(node.querySelector('.alternativas-container, .afirmativas-container'));
      }
    }
  }

    async render(content, container) {
        if (!this.isReady) {
            // Aguardar inicialização
            while (!this.isReady) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }

        try {
            // Limpar container anterior
            container.innerHTML = '';
            
            // Criar elemento temporário para o conteúdo
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = content;
            
            // Aplicar melhorias no conteúdo antes da renderização
            this.preprocessContent(tempDiv);
            
            // Renderizar com paged.js
            await this.previewer.preview(tempDiv.innerHTML, [], container);
            
            // Aplicar melhorias pós-renderização
            this.postprocessContent(container);
            
        } catch (error) {
            console.error('Erro na renderização do paged.js:', error);
            
            // Fallback: renderização simples sem paginação
            container.innerHTML = `
                <div class="fallback-preview" style="
                    background: white;
                    padding: 2rem;
                    margin: 1rem;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    border-radius: 4px;
                    max-width: 210mm;
                    margin: 1rem auto;
                ">
                    ${content}
                </div>
            `;
        }
    }

    preprocessContent(container) {
        // Adicionar classes para melhor controle de quebras
        const questoes = container.querySelectorAll('.questao-container');
        questoes.forEach((questao, index) => {
            // Adicionar atributos para controle de quebra
            questao.setAttribute('data-questao-index', index.toString());
            
            // Garantir que questões com muitas alternativas não quebrem mal
            const alternativas = questao.querySelector('.alternativas-container');
            if (alternativas && alternativas.children.length > 4) {
                questao.classList.add('questao-longa');
            }
        });

        // Melhorar formatação de disciplinas em simulados
        const disciplinaTitulos = container.querySelectorAll('.disciplina-titulo');
        disciplinaTitulos.forEach(titulo => {
            titulo.style.breakBefore = 'page';
            titulo.style.pageBreakBefore = 'always';
        });
    }

    postprocessContent(container) {
        // Aplicar melhorias após a renderização do paged.js
        const pages = container.querySelectorAll('.pagedjs_page');
        
        pages.forEach((page, index) => {
            // Adicionar classe para identificação da página
            page.classList.add(`page-${index + 1}`);
            
            // Verificar e corrigir questões órfãs
            this.fixOrphanedQuestions(page);
            
            // Melhorar espaçamento entre questões
            this.optimizeQuestionSpacing(page);
        });
    }

    fixOrphanedQuestions(page) {
        const questoes = page.querySelectorAll('.questao-container');
        
        questoes.forEach(questao => {
            const rect = questao.getBoundingClientRect();
            const pageRect = page.getBoundingClientRect();
            
            // Se apenas o número da questão está visível, mover para próxima página
            if (rect.height < 50 && rect.top > pageRect.bottom - 100) {
                questao.style.breakBefore = 'page';
            }
        });
    }

    optimizeQuestionSpacing(page) {
        const questoes = page.querySelectorAll('.questao-container');
        
        questoes.forEach((questao, index) => {
            // Adicionar espaçamento adequado entre questões
            if (index > 0) {
                questao.style.marginTop = '1.5rem';
            }
        });
    }
}

// Inicializar quando o script for carregado
window.PagedPolyfill = new PagedPolyfill();