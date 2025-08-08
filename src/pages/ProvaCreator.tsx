import { useState } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { QuestaoEditor } from "@/components/QuestaoEditor";
import { Preview } from "@/components/Preview";
import { ArrowLeft, Plus, FileText, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useDocumentoProva } from "@/hooks/useDocumento";
import { instituicaoMock, templatesProva, questoesExemplo } from "@/data/mockData";
import { Template, MetadadosDocumento, Questao } from "@/types";

export default function ProvaCreator() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { documento, criarDocumento, adicionarQuestao, atualizarQuestao, removerQuestao, atualizarMetadados, validarDocumento } = useDocumentoProva();
  
  const [templateSelecionado, setTemplateSelecionado] = useState<Template | null>(null);
  const [metadados, setMetadados] = useState<MetadadosDocumento>({
    disciplina: "",
    serie: "",
    turma: "",
    professor: "",
    titulo: ""
  });
  const [questaoEditando, setQuestaoEditando] = useState<string | null>(null);
  const [mostrandoConfiguracoes, setMostrandoConfiguracoes] = useState(false);

  const iniciarDocumento = () => {
    if (templateSelecionado && metadados.disciplina && metadados.serie && metadados.turma) {
      criarDocumento(templateSelecionado, metadados);
      toast({
        title: "Documento criado",
        description: `${templateSelecionado.nome} criado com sucesso!`,
      });
    }
  };

  const adicionarQuestaoExemplo = () => {
    if (documento) {
      const questaoExemplo = questoesExemplo[Math.floor(Math.random() * questoesExemplo.length)];
      adicionarQuestao({ 
        ...questaoExemplo, 
        disciplina: metadados.disciplina 
      });
      toast({
        title: "Questão adicionada",
        description: "Questão de exemplo adicionada com sucesso!",
      });
    }
  };

  const documentoConfigurado = documento !== null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Criador de Provas</h1>
            <p className="text-muted-foreground">Crie provas e atividades para disciplinas específicas</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-200px)]">
          {/* Painel de Configuração */}
          <div className="space-y-6 overflow-auto">
            {!documentoConfigurado ? (
              <>
                {/* Seleção de Template */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Selecionar Template
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-3">
                      {templatesProva.map(template => (
                        <div
                          key={template.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-educational hover:border-primary/50 ${
                            templateSelecionado?.id === template.id 
                              ? "border-primary bg-primary-light" 
                              : "border-border"
                          }`}
                          onClick={() => setTemplateSelecionado(template)}
                        >
                          <h3 className="font-semibold">{template.nome}</h3>
                          <p className="text-sm text-muted-foreground">{template.descricao}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Metadados */}
                <Card>
                  <CardHeader>
                    <CardTitle>Informações da Prova</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="disciplina">Disciplina</Label>
                        <Select onValueChange={(value) => setMetadados(prev => ({ ...prev, disciplina: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                          <SelectContent>
                            {instituicaoMock.disciplinas.map(disciplina => (
                              <SelectItem key={disciplina} value={disciplina}>
                                {disciplina}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="serie">Série</Label>
                        <Select onValueChange={(value) => setMetadados(prev => ({ ...prev, serie: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                          <SelectContent>
                            {instituicaoMock.series.map(serie => (
                              <SelectItem key={serie} value={serie}>
                                {serie}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="turma">Turma</Label>
                        <Select onValueChange={(value) => setMetadados(prev => ({ ...prev, turma: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                          <SelectContent>
                            {instituicaoMock.turmas.map(turma => (
                              <SelectItem key={turma} value={turma}>
                                {turma}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="professor">Professor(a)</Label>
                        <Input
                          id="professor"
                          placeholder="Nome do professor"
                          value={metadados.professor}
                          onChange={(e) => setMetadados(prev => ({ ...prev, professor: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="titulo">Título Personalizado (opcional)</Label>
                      <Input
                        id="titulo"
                        placeholder="Ex: Avaliação Bimestral de..."
                        value={metadados.titulo}
                        onChange={(e) => setMetadados(prev => ({ ...prev, titulo: e.target.value }))}
                      />
                    </div>

                    <Button 
                      onClick={iniciarDocumento}
                      disabled={!templateSelecionado || !metadados.disciplina || !metadados.serie || !metadados.turma}
                      className="w-full"
                    >
                      Iniciar Documento
                    </Button>
                  </CardContent>
                </Card>
              </>
            ) : (
              <>
                {/* Controles do Documento */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {documento.template.nome}
                      </CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setMostrandoConfiguracoes(!mostrandoConfiguracoes)}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  {mostrandoConfiguracoes && (
                    <CardContent className="pt-0">
                      <div className="text-sm space-y-2 p-4 bg-muted rounded-lg">
                        <p><span className="font-medium">Disciplina:</span> {documento.metadados.disciplina}</p>
                        <p><span className="font-medium">Série:</span> {documento.metadados.serie}</p>
                        <p><span className="font-medium">Turma:</span> {documento.metadados.turma}</p>
                        {documento.metadados.professor && (
                          <p><span className="font-medium">Professor:</span> {documento.metadados.professor}</p>
                        )}
                      </div>
                    </CardContent>
                  )}
                </Card>

                {/* Lista de Questões */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Questões ({documento.questoes.length})</CardTitle>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={adicionarQuestaoExemplo}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Exemplo
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => setQuestaoEditando("nova")}
                          disabled={!validarDocumento() && documento?.questoes.length === 0}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Nova Questão
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {questaoEditando === "nova" && (
                      <QuestaoEditor
                        modoEdicao={true}
                        onSalvar={(questao) => {
                          adicionarQuestao(questao);
                          setQuestaoEditando(null);
                          toast({
                            title: "Questão salva",
                            description: "Nova questão adicionada com sucesso!",
                          });
                        }}
                        onCancelar={() => setQuestaoEditando(null)}
                        numeracao={documento.questoes.length + 1}
                      />
                    )}
                    
                    {documento.questoes.map((questao, index) => (
                      <QuestaoEditor
                        key={questao.id}
                        questao={questao}
                        onSalvar={(questaoAtualizada) => {
                          atualizarQuestao(questao.id, questaoAtualizada);
                          toast({
                            title: "Questão atualizada",
                            description: "Questão editada com sucesso!",
                          });
                        }}
                        onCancelar={() => {}}
                        onRemover={() => {
                          removerQuestao(questao.id);
                          toast({
                            title: "Questão removida",
                            description: "Questão removida com sucesso!",
                          });
                        }}
                        numeracao={index + 1}
                      />
                    ))}
                    
                    {documento.questoes.length === 0 && questaoEditando !== "nova" && (
                      <div className="text-center text-muted-foreground py-12">
                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Nenhuma questão adicionada ainda</p>
                        <p className="text-sm">Clique em "Nova Questão" para começar</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Preview */}
          <div className="lg:sticky lg:top-8">
            <Preview documento={documento} />
          </div>
        </div>
      </div>
    </div>
  );
}