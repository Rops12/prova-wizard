import { useState, useCallback } from "react";
import { DocumentoProva, DocumentoSimulado, Questao, Template, MetadadosDocumento, CadernoSimulado } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { toast } from "@/hooks/use-toast";

// Hook para gerenciar documentos de prova
export function useDocumentoProva() {
  const [documento, setDocumento] = useState<DocumentoProva | null>(null);

  const criarDocumento = useCallback((template: Template, metadados: MetadadosDocumento) => {
    const novoDocumento: DocumentoProva = {
      id: uuidv4(),
      tipo: "prova",
      template,
      metadados,
      questoes: [],
      criadoEm: new Date(),
      atualizadoEm: new Date()
    };
    setDocumento(novoDocumento);
    return novoDocumento;
  }, []);

  const adicionarQuestao = useCallback((questao: Questao) => {
    setDocumento(prev => {
      if (!prev) return prev;
      const novaQuestao = { ...questao, id: uuidv4() };
      return {
        ...prev,
        questoes: [...prev.questoes, novaQuestao],
        atualizadoEm: new Date()
      };
    });
  }, []);

  const atualizarQuestao = useCallback((id: string, questaoAtualizada: Partial<Questao>) => {
    setDocumento(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        questoes: prev.questoes.map(q => 
          q.id === id ? { ...q, ...questaoAtualizada } : q
        ),
        atualizadoEm: new Date()
      };
    });
  }, []);

  const removerQuestao = useCallback((id: string) => {
    setDocumento(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        questoes: prev.questoes.filter(q => q.id !== id),
        atualizadoEm: new Date()
      };
    });
  }, []);

  const reordenarQuestoes = useCallback((questoesReordenadas: Questao[]) => {
    setDocumento(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        questoes: questoesReordenadas,
        atualizadoEm: new Date()
      };
    });
  }, []);

  const atualizarMetadados = useCallback((novosMetadados: Partial<MetadadosDocumento>) => {
    setDocumento(prev => {
      if (!prev) return prev;
      
      // Notificar sobre atualização
      toast({
        title: "Metadados atualizados",
        description: "As informações do documento foram atualizadas com sucesso.",
      });
      
      return {
        ...prev,
        metadados: { ...prev.metadados, ...novosMetadados },
        atualizadoEm: new Date()
      };
    });
  }, []);

  const validarDocumento = useCallback(() => {
    if (!documento) return false;
    
    const temQuestoes = documento.questoes.length > 0;
    const metadadosCompletos = documento.metadados.disciplina && 
                              documento.metadados.serie && 
                              documento.metadados.turma;
    
    return temQuestoes && metadadosCompletos;
  }, [documento]);

  return {
    documento,
    criarDocumento,
    adicionarQuestao,
    atualizarQuestao,
    removerQuestao,
    reordenarQuestoes,
    atualizarMetadados,
    validarDocumento
  };
}

// Hook para gerenciar documentos de simulado
export function useDocumentoSimulado() {
  const [documento, setDocumento] = useState<DocumentoSimulado | null>(null);
  const [abaAtiva, setAbaAtiva] = useState<string>("");

  const criarDocumento = useCallback((template: Template, nome: string, disciplinas: string[]) => {
    const cadernos: CadernoSimulado[] = disciplinas.map(disciplina => ({
      disciplina,
      questoes: []
    }));

    const novoDocumento: DocumentoSimulado = {
      id: uuidv4(),
      tipo: "simulado",
      template,
      nome,
      cadernos,
      criadoEm: new Date(),
      atualizadoEm: new Date()
    };
    
    setDocumento(novoDocumento);
    setAbaAtiva(disciplinas[0] || "");
    return novoDocumento;
  }, []);

  const adicionarDisciplina = useCallback((disciplina: string) => {
    setDocumento(prev => {
      if (!prev) return prev;
      const novoCaderno: CadernoSimulado = {
        disciplina,
        questoes: []
      };
      return {
        ...prev,
        cadernos: [...prev.cadernos, novoCaderno],
        atualizadoEm: new Date()
      };
    });
  }, []);

  const removerDisciplina = useCallback((disciplina: string) => {
    setDocumento(prev => {
      if (!prev) return prev;
      const novosCadernos = prev.cadernos.filter(c => c.disciplina !== disciplina);
      return {
        ...prev,
        cadernos: novosCadernos,
        atualizadoEm: new Date()
      };
    });
    
    // Se a aba ativa foi removida, muda para a primeira disponível
    setAbaAtiva(prev => {
      if (documento && prev === disciplina) {
        const cadernos = documento.cadernos.filter(c => c.disciplina !== disciplina);
        return cadernos.length > 0 ? cadernos[0].disciplina : "";
      }
      return prev;
    });
  }, [documento]);

  const adicionarQuestao = useCallback((disciplina: string, questao: Questao) => {
    setDocumento(prev => {
      if (!prev) return prev;
      const novaQuestao = { ...questao, id: uuidv4(), disciplina };
      return {
        ...prev,
        cadernos: prev.cadernos.map(caderno =>
          caderno.disciplina === disciplina
            ? { ...caderno, questoes: [...caderno.questoes, novaQuestao] }
            : caderno
        ),
        atualizadoEm: new Date()
      };
    });
  }, []);

  const atualizarQuestao = useCallback((disciplina: string, id: string, questaoAtualizada: Partial<Questao>) => {
    setDocumento(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        cadernos: prev.cadernos.map(caderno =>
          caderno.disciplina === disciplina
            ? {
                ...caderno,
                questoes: caderno.questoes.map(q =>
                  q.id === id ? { ...q, ...questaoAtualizada } : q
                )
              }
            : caderno
        ),
        atualizadoEm: new Date()
      };
    });
  }, []);

  const removerQuestao = useCallback((disciplina: string, id: string) => {
    setDocumento(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        cadernos: prev.cadernos.map(caderno =>
          caderno.disciplina === disciplina
            ? { ...caderno, questoes: caderno.questoes.filter(q => q.id !== id) }
            : caderno
        ),
        atualizadoEm: new Date()
      };
    });
  }, []);

  const reordenarQuestoes = useCallback((disciplina: string, questoesReordenadas: Questao[]) => {
    setDocumento(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        cadernos: prev.cadernos.map(caderno =>
          caderno.disciplina === disciplina
            ? { ...caderno, questoes: questoesReordenadas }
            : caderno
        ),
        atualizadoEm: new Date()
      };
    });
  }, []);

  const getCadernoAtivo = useCallback(() => {
    if (!documento || !abaAtiva) return null;
    return documento.cadernos.find(c => c.disciplina === abaAtiva) || null;
  }, [documento, abaAtiva]);

  const validarDocumento = useCallback(() => {
    if (!documento) return false;
    
    const temQuestoes = documento.cadernos.some(c => c.questoes.length > 0);
    const temNome = documento.nome.trim().length > 0;
    const temDisciplinas = documento.cadernos.length > 0;
    
    return temQuestoes && temNome && temDisciplinas;
  }, [documento]);

  const obterEstatisticas = useCallback(() => {
    if (!documento) return null;
    
    const totalQuestoes = documento.cadernos.reduce((acc, caderno) => acc + caderno.questoes.length, 0);
    const questoesPorTipo = documento.cadernos.reduce((acc, caderno) => {
      caderno.questoes.forEach(questao => {
        acc[questao.tipo] = (acc[questao.tipo] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);
    
    return {
      totalQuestoes,
      totalDisciplinas: documento.cadernos.length,
      questoesPorTipo,
      questoesPorDisciplina: documento.cadernos.map(c => ({
        disciplina: c.disciplina,
        quantidade: c.questoes.length
      }))
    };
  }, [documento]);
  return {
    documento,
    abaAtiva,
    setAbaAtiva,
    criarDocumento,
    adicionarDisciplina,
    removerDisciplina,
    adicionarQuestao,
    atualizarQuestao,
    removerQuestao,
    reordenarQuestoes,
    getCadernoAtivo,
    validarDocumento,
    obterEstatisticas
  };
}