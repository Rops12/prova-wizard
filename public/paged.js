// Polyfill customizado para paged.js com melhorias de renderização
class PagedPolyfill {
    constructor() {
        this.previewer = null;
        this.isReady = false;
        this.initializePreviewer();
    }

    async initializePreviewer() {
        // Aguardar o paged.js estar disponível
        while (!window.Paged) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        this.previewer = new window.Paged.Previewer();
        this.isReady = true;
        
        // Configurar handlers para melhor controle de quebras
        this.setupBreakHandlers();
    }

    setupBreakHandlers() {
        if (!this.previewer) return;

        // Handler para controle de quebras de questões
        this.previewer.on('page', (page) => {
            const pageElement = page.element;
            
            // Verificar se há questões órfãs (início de questão no final da página)
            const questoes = pageElement.querySelectorAll('.questao-container');
            questoes.forEach(questao => {
                const rect = questao.getBoundingClientRect();
                const pageRect = pageElement.getBoundingClientRect();
                
                // Se a questão está muito próxima do final da página, forçar quebra
                if (rect.bottom > pageRect.bottom - 50) {
                    questao.style.breakBefore = 'page';
                }
            });
        });

        // Handler para otimizar layout de alternativas
        this.previewer.on('renderNode', (node) => {
            if (node.classList?.contains('alternativas-container')) {
                // Garantir que alternativas fiquem juntas
                node.style.breakInside = 'avoid';
                node.style.pageBreakInside = 'avoid';
            }
            
            if (node.classList?.contains('afirmativas-container')) {
                // Garantir que afirmativas fiquem juntas
                node.style.breakInside = 'avoid';
                node.style.pageBreakInside = 'avoid';
            }
        });
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