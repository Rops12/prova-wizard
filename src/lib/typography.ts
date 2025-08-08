import Typography from 'typography';

// Configuração tipográfica otimizada para documentos educacionais
const typography = new Typography({
  baseFontSize: '11pt',
  baseLineHeight: 1.5,
  headerFontFamily: ['Inter', 'system-ui', 'sans-serif'],
  bodyFontFamily: ['Inter', 'system-ui', 'sans-serif'],
  headerColor: 'hsl(var(--foreground))',
  bodyColor: 'hsl(var(--foreground))',
  headerWeight: 600,
  bodyWeight: 400,
  boldWeight: 600,
  blockMarginBottom: 0.75,
  
  // Escala modular harmoniosa para documentos educacionais
  scaleRatio: 1.25,
  
  // Otimizações para impressão e legibilidade
  overrideStyles: ({ adjustFontSizeTo, scale, rhythm }) => ({
    // Reset base para consistência
    '*': {
      boxSizing: 'border-box',
    },
    
    // Configurações do body
    body: {
      fontFamily: ['Inter', 'system-ui', 'sans-serif'].join(','),
      fontSize: '11pt',
      lineHeight: 1.5,
      color: 'hsl(var(--foreground))',
      backgroundColor: 'hsl(var(--background))',
      fontFeatureSettings: '"kern", "liga", "clig", "calt"',
      fontKerning: 'normal',
      textRendering: 'optimizeLegibility',
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale',
    },
    
    // Headers hierárquicos
    'h1': {
      ...adjustFontSizeTo('18pt'),
      fontWeight: 700,
      lineHeight: 1.2,
      marginBottom: rhythm(1),
      marginTop: rhythm(1.5),
      letterSpacing: '-0.02em',
    },
    'h2': {
      ...adjustFontSizeTo('16pt'),
      fontWeight: 600,
      lineHeight: 1.3,
      marginBottom: rhythm(0.75),
      marginTop: rhythm(1.25),
      letterSpacing: '-0.01em',
    },
    'h3': {
      ...adjustFontSizeTo('14pt'),
      fontWeight: 600,
      lineHeight: 1.3,
      marginBottom: rhythm(0.5),
      marginTop: rhythm(1),
    },
    'h4, h5, h6': {
      ...adjustFontSizeTo('12pt'),
      fontWeight: 600,
      lineHeight: 1.4,
      marginBottom: rhythm(0.5),
      marginTop: rhythm(0.75),
    },
    
    // Parágrafos otimizados
    p: {
      marginBottom: rhythm(0.75),
      textAlign: 'justify',
      hyphenateCharacter: '‐',
      hyphens: 'auto',
      hangingPunctuation: 'first last',
      // Evitar viúvas e órfãs
      orphans: 2,
      widows: 2,
    },
    
    // Listas estruturadas
    'ul, ol': {
      marginLeft: rhythm(1),
      marginBottom: rhythm(0.75),
      paddingLeft: 0,
    },
    'li': {
      marginBottom: rhythm(0.25),
      breakInside: 'avoid',
    },
    'li > ul, li > ol': {
      marginTop: rhythm(0.25),
      marginBottom: rhythm(0.25),
    },
    
    // Questões e conteúdo educacional
    '.questao-container': {
      breakInside: 'avoid',
      pageBreakInside: 'avoid',
      marginBottom: rhythm(1.5),
      orphans: 2,
      widows: 2,
    },
    
    '.questao-enunciado': {
      marginBottom: rhythm(0.75),
      textAlign: 'justify',
      hyphens: 'auto',
    },
    
    '.questao-alternativas': {
      marginTop: rhythm(0.5),
    },
    
    '.alternativa': {
      marginBottom: rhythm(0.4),
      breakInside: 'avoid',
      pageBreakInside: 'avoid',
      displayFlex: 'flex',
      alignItems: 'flex-start',
      gap: rhythm(0.25),
    },
    
    '.alternativa-letra': {
      fontWeight: 600,
      minWidth: '1.5em',
      flexShrink: 0,
    },
    
    '.alternativa-texto': {
      flex: 1,
      textAlign: 'justify',
      hyphens: 'auto',
    },
    
    // Enfatização e destaque
    'strong, b': {
      fontWeight: 600,
    },
    'em, i': {
      fontStyle: 'italic',
    },
    
    // Elementos de código
    'code, pre': {
      fontFamily: ['Fira Code', 'Monaco', 'Consolas', 'monospace'].join(','),
      fontSize: '0.9em',
    },
    
    // Tabelas
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      marginBottom: rhythm(1),
    },
    'th, td': {
      padding: rhythm(0.25),
      borderBottom: '1px solid hsl(var(--border))',
      verticalAlign: 'top',
      textAlign: 'left',
    },
    th: {
      fontWeight: 600,
      backgroundColor: 'hsl(var(--muted))',
    },
    
    // Citações
    blockquote: {
      marginLeft: rhythm(1),
      marginRight: rhythm(1),
      paddingLeft: rhythm(0.75),
      borderLeft: '3px solid hsl(var(--border))',
      fontStyle: 'italic',
      color: 'hsl(var(--muted-foreground))',
    },
    
    // Imagens responsivas
    img: {
      maxWidth: '100%',
      height: 'auto',
      display: 'block',
      marginTop: rhythm(0.5),
      marginBottom: rhythm(0.5),
      breakInside: 'avoid',
      pageBreakInside: 'avoid',
    },
    
    // Separadores
    hr: {
      border: 'none',
      borderTop: '1px solid hsl(var(--border))',
      marginTop: rhythm(1.5),
      marginBottom: rhythm(1.5),
      breakInside: 'avoid',
      pageBreakInside: 'avoid',
    },
    
    // Otimizações para impressão
    '@media print': {
      body: {
        fontSize: '10pt',
        lineHeight: 1.4,
      },
      'h1': {
        fontSize: '16pt',
        pageBreakAfter: 'avoid',
      },
      'h2, h3, h4, h5, h6': {
        pageBreakAfter: 'avoid',
      },
      'p, li': {
        orphans: 3,
        widows: 3,
      },
      'img': {
        maxWidth: '100%',
        pageBreakInside: 'avoid',
      },
      '.questao-container': {
        pageBreakInside: 'avoid',
      },
      '.alternativas-container': {
        pageBreakInside: 'avoid',
      },
    },
  }),
});

// Injetar estilos CSS globalmente
export const injectTypographyStyles = () => {
  if (typeof document === 'undefined') return;
  
  const existingStyle = document.getElementById('typography-styles');
  if (existingStyle) {
    existingStyle.remove();
  }
  
  const style = document.createElement('style');
  style.id = 'typography-styles';
  style.innerHTML = typography.toString();
  document.head.appendChild(style);
};

export default typography;