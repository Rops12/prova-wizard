// public/paged.js
class PagedPolyfill {
    constructor() {
        this.previewer = new Paged.Previewer();
    }

    render(content) {
        this.previewer.preview(content, ["/paged.css"], document.querySelector("#paged-preview-container"));
    }
}

window.PagedPolyfill = new PagedPolyfill();