export class MeasurementUtils {
  private static tempElement: HTMLElement | null = null;

  // Criar elemento temporário para medições
  static createMeasurementElement(): HTMLElement {
    if (this.tempElement) {
      document.body.removeChild(this.tempElement);
    }

    const element = document.createElement('div');
    element.style.position = 'absolute';
    element.style.visibility = 'hidden';
    element.style.height = 'auto';
    element.style.width = '400px'; // largura padrão
    element.style.fontSize = '14px';
    element.style.lineHeight = '1.5';
    element.style.padding = '16px';
    element.className = 'measurement-temp';
    
    document.body.appendChild(element);
    this.tempElement = element;
    return element;
  }

  // Medir altura de texto
  static measureTextHeight(text: string, className?: string): number {
    const element = this.createMeasurementElement();
    element.innerHTML = text;
    
    if (className) {
      element.className += ` ${className}`;
    }

    const height = element.offsetHeight;
    return height;
  }

  // Limpeza
  static cleanup(): void {
    if (this.tempElement) {
      document.body.removeChild(this.tempElement);
      this.tempElement = null;
    }
  }
}