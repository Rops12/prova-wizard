import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QuestaoEditor } from "@/components/QuestaoEditor";
import { Preview } from "@/components/Preview";
import { ArrowLeft, Plus, FileText, X, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDocumentoSimulado } from "@/hooks/useDocumento";
import { instituicaoMock, templatesSimulado, questoesExemplo } from "@/data/mockData";
import { Template } from "@/types";

export default function SimuladoCreator() {
  const navigate = useNavigate();
  const { 
    documento, 
    abaAtiva, 
    setAbaAtiva,
    criarDocumento, 
    adicionarDisciplina, 
    removerDisciplina,
    adicionarQuestao, 
    atualizarQuestao, 
    removerQuestao,
    getCadernoAtivo
  } = useDocumentoSimulado();
  
  const [templateSelecionado, setTemplateSelecionado] = useState<Template | null>(null);
  const [nomeSimulado, setNomeSimulado] = useState("");
  const [disciplinasDisponiveis, setDisciplinasDisponiveis] = useState<string[]>(instituicaoMock.disciplinas);
  const [questaoEditando, setQuestaoEditando] = useState<string | null>(null);
  const [mostrandoConfiguracoes, setMostrandoConfiguracoes] = useState(false);

  const cadernoAtivo = getCadernoAtivo();
  const documentoConfigurado = documento !== null;

  const iniciarDocumento = () => {
    if (templateSelecionado && nomeSimulado) {
      // Iniciar com algumas disciplinas padrão
      const disciplinasIniciais = ["Português", "Matemática", "História"];
      criarDocumento(templateSelecionado, nomeSimulado, disciplinasIniciais);
    }
  };

  const adicionarNovaDisciplina = (disciplina: string) => {
    if (documento && !documento.cadernos.find(c => c.disciplina === disciplina)) {
      adicionarDisciplina(disciplina);
      setAbaAtiva(disciplina);
    }
  };

  const adicionarQuestaoExemplo = () => {
    if (documento && abaAtiva) {
      const questaoExemplo = questoesExemplo[Math.floor(Math.random() * questoesExemplo.length)];
      adicionarQuestao(abaAtiva, { 
        ...questaoExemplo, 
        disciplina: abaAtiva 
      });
    }
  };

  const disciplinasNaoAdicionadas = disciplinasDisponiveis.filter(
    disciplina => !documento?.cadernos.find(c => c.disciplina === disciplina)
  );

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
            <h1 className="text-3xl font-bold text-foreground">Criador de Simulados</h1>
            <p className="text-muted-foreground">Crie simulados multidisciplinares complexos</p>
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
                      {templatesSimulado.map(template => (
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
                          <div className="flex gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {template.configuracao.colunas} colunas
                            </Badge>
                            {template.configuracao.incluiCapa && (
                              <Badge variant="outline" className="text-xs">
                                Com capa
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Configuração do Simulado */}
                <Card>
                  <CardHeader>
                    <CardTitle>Informações do Simulado</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="nome">Nome do Simulado</Label>
                      <Input
                        id="nome"
                        placeholder="Ex: Simulado ENEM 2024 - 1º Semestre"
                        value={nomeSimulado}
                        onChange={(e) => setNomeSimulado(e.target.value)}
                      />
                    </div>

                    <Button 
                      onClick={iniciarDocumento}
                      disabled={!templateSelecionado || !nomeSimulado.trim()}
                      className="w-full"
                    >
                      Iniciar Simulado
                    </Button>
                  </CardContent>
                </Card>
              </>
            ) : (
              <>
                {/* Controles do Simulado */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {documento.nome}
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
                        <p><span className="font-medium">Template:</span> {documento.template.nome}</p>
                        <p><span className="font-medium">Disciplinas:</span> {documento.cadernos.length}</p>
                        <p><span className="font-medium">Total de questões:</span> {
                          documento.cadernos.reduce((acc, caderno) => acc + caderno.questoes.length, 0)
                        }</p>
                      </div>
                    </CardContent>
                  )}
                </Card>

                {/* Gerenciamento de Disciplinas */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Disciplinas</CardTitle>
                      {disciplinasNaoAdicionadas.length > 0 && (
                        <Select onValueChange={adicionarNovaDisciplina}>
                          <SelectTrigger className="w-48">
                            <SelectValue placeholder="Adicionar disciplina" />
                          </SelectTrigger>
                          <SelectContent>
                            {disciplinasNaoAdicionadas.map(disciplina => (
                              <SelectItem key={disciplina} value={disciplina}>
                                {disciplina}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Tabs value={abaAtiva} onValueChange={setAbaAtiva} className="w-full">
                      <TabsList className="grid w-full grid-cols-3 gap-1">
                        {documento.cadernos.slice(0, 3).map(caderno => (
                          <TabsTrigger 
                            key={caderno.disciplina} 
                            value={caderno.disciplina}
                            className="relative text-xs"
                          >
                            {caderno.disciplina}
                            <Badge variant="secondary" className="ml-1 text-xs">
                              {caderno.questoes.length}
                            </Badge>
                            {documento.cadernos.length > 1 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="absolute -top-1 -right-1 h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removerDisciplina(caderno.disciplina);
                                }}
                              >
                                <X className="h-2 w-2" />
                              </Button>
                            )}
                          </TabsTrigger>
                        ))}
                      </TabsList>

                      {/* Abas adicionais se houver mais de 3 disciplinas */}
                      {documento.cadernos.length > 3 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {documento.cadernos.slice(3).map(caderno => (
                            <Button
                              key={caderno.disciplina}
                              variant={abaAtiva === caderno.disciplina ? "default" : "outline"}
                              size="sm"
                              onClick={() => setAbaAtiva(caderno.disciplina)}
                              className="relative text-xs"
                            >
                              {caderno.disciplina}
                              <Badge variant="secondary" className="ml-1">
                                {caderno.questoes.length}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="absolute -top-1 -right-1 h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removerDisciplina(caderno.disciplina);
                                }}
                              >
                                <X className="h-2 w-2" />
                              </Button>
                            </Button>
                          ))}
                        </div>
                      )}

                      {/* Conteúdo das abas */}
                      {documento.cadernos.map(caderno => (
                        <TabsContent key={caderno.disciplina} value={caderno.disciplina} className="mt-6">
                          <Card>
                            <CardHeader>
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">
                                  Questões de {caderno.disciplina} ({caderno.questoes.length})
                                </CardTitle>
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
                                  >
                                    <Plus className="h-4 w-4 mr-1" />
                                    Nova Questão
                                  </Button>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              {questaoEditando === "nova" && abaAtiva === caderno.disciplina && (
                                <QuestaoEditor
                                  modoEdicao={true}
                                  onSalvar={(questao) => {
                                    adicionarQuestao(caderno.disciplina, questao);
                                    setQuestaoEditando(null);
                                  }}
                                  onCancelar={() => setQuestaoEditando(null)}
                                  numeracao={caderno.questoes.length + 1}
                                />
                              )}
                              
                              {caderno.questoes.map((questao, index) => (
                                <QuestaoEditor
                                  key={questao.id}
                                  questao={questao}
                                  onSalvar={(questaoAtualizada) => {
                                    atualizarQuestao(caderno.disciplina, questao.id, questaoAtualizada);
                                  }}
                                  onCancelar={() => {}}
                                  onRemover={() => removerQuestao(caderno.disciplina, questao.id)}
                                  numeracao={index + 1}
                                />
                              ))}
                              
                              {caderno.questoes.length === 0 && questaoEditando !== "nova" && (
                                <div className="text-center text-muted-foreground py-12">
                                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                  <p>Nenhuma questão em {caderno.disciplina}</p>
                                  <p className="text-sm">Clique em "Nova Questão" para começar</p>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </TabsContent>
                      ))}
                    </Tabs>
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