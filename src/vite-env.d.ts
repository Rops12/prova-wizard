// src/vite-env.d.ts

/// <reference types="vite/client" />

// Adicione este bloco de código
declare module '*?raw' {
  const content: string;
  export default content;
}