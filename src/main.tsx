import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { injectTypographyStyles } from './lib/typography'

// Inicializar estilos tipográficos globalmente
injectTypographyStyles();

createRoot(document.getElementById("root")!).render(<App />);
