// public/paged.js
class PagedPolyfill {
    constructor() {
        this.previewer = new Paged.Previewer();
    }

    render(content, container) {
        // Passamos um array vazio pois os estilos já são carregados pela tag <link> no iframe.
        this.previewer.preview(content, [], container);
    }
}

window.PagedPolyfill = new PagedPolyfill();