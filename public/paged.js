// public/paged.js
class PagedPolyfill {
    constructor() {
        this.previewer = new Paged.Previewer();
    }

    // A função agora recebe o 'container' como um argumento
    render(content, container) {
        // O CSS será carregado diretamente no iframe, então podemos deixar o array de estilos vazio
        this.previewer.preview(content, ["/paged.css"], container);
    }
}

window.PagedPolyfill = new PagedPolyfill();