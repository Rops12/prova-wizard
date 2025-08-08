import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Questao, AlternativaMultiplaEscolha, AfirmativaVerdadeiroFalso } from "@/types";
import { Edit3, Trash2, Plus, GripVertical, Image, FileText, CheckCircle2, XCircle } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "@/hooks/use-toast";

interface QuestaoEditorProps {
  questao?: Questao;
  modoEdicao?: boolean;
  onSalvar: (questao: Questao) => void;
  onCancelar: () => void;
  onRemover?: () => void;
  numeracao?: number;
}

const tiposQuestao = [
  { value: "multipla_escolha", label: "Múltipla Escolha" },
  { value: "dissertativa", label: "Dissertativa" },
  { value: "verdadeiro_falso", label: "Verdadeiro ou Falso" }
];

export function QuestaoEditor({ 
  questao, 
  modoEdicao = false,
  onSalvar, 
  onCancelar, 
  onRemover,
  numeracao 
}: QuestaoEditorProps) {
  const [editando, setEditando] = useState(modoEdicao);
  const [questaoLocal, setQuestaoLocal] = useState<Questao>(questao || {
    id: uuidv4(),
    tipo: "multipla_escolha",
    enunciado: "",
    alternativas: [
      { id: uuidv4(), texto: "", correta: true },
      { id: uuidv4(), texto: "", correta: false },
      { id: uuidv4(), texto: "", correta: false },
      { id: uuidv4(), texto: "", correta: false }
    ]
  });

  const handleSalvar = () => {
    // Validar questão antes de salvar
    if (!questaoLocal.enunciado.trim()) {
      toast({
        title: "Erro de validação",
        description: "O enunciado da questão é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    if (questaoLocal.tipo === "multipla_escolha") {
      const temAlternativaCorreta = questaoLocal.alternativas?.some(alt => alt.correta);
      const alternativasPreenchidas = questaoLocal.alternativas?.every(alt => alt.texto.trim());
      
      if (!temAlternativaCorreta) {
        toast({
          title: "Erro de validação",
          description: "Marque pelo menos uma alternativa como correta.",
          variant: "destructive",
        });
        return;
      }
      
      if (!alternativasPreenchidas) {
        toast({
          title: "Erro de validação",
          description: "Preencha todas as alternativas.",
          variant: "destructive",
        });
        return;
      }
    }

    if (questaoLocal.tipo === "verdadeiro_falso") {
      const afirmativasPreenchidas = questaoLocal.afirmativas?.every(af => af.texto.trim());
      
      if (!afirmativasPreenchidas) {
        toast({
          title: "Erro de validação",
          description: "Preencha todas as afirmativas.",
          variant: "destructive",
        });
        return;
      }
    }

    onSalvar(questaoLocal);
    setEditando(false);
  };

  const handleCancelar = () => {
    if (questao) {
      setQuestaoLocal(questao);
    }
    setEditando(false);
    onCancelar();
  };

  const adicionarAlternativa = () => {
    if (questaoLocal.alternativas) {
      setQuestaoLocal({
        ...questaoLocal,
        alternativas: [...questaoLocal.alternativas, {
          id: uuidv4(),
          texto: "",
          correta: false
        }]
      });
    }
  };

  const removerAlternativa = (id: string) => {
    if (questaoLocal.alternativas && questaoLocal.alternativas.length > 2) {
      setQuestaoLocal({
        ...questaoLocal,
        alternativas: questaoLocal.alternativas.filter(alt => alt.id !== id)
      });
    }
  };

  const atualizarAlternativa = (id: string, campo: keyof AlternativaMultiplaEscolha, valor: any) => {
    if (questaoLocal.alternativas) {
      setQuestaoLocal({
        ...questaoLocal,
        alternativas: questaoLocal.alternativas.map(alt => {
          if (alt.id === id) {
            // Se marcando como correta, desmarcar as outras
            if (campo === 'correta' && valor === true) {
              return { ...alt, [campo]: valor };
            }
            return { ...alt, [campo]: valor };
          }
          // Se marcando outra como correta, desmarcar esta
          if (campo === 'correta' && valor === true) {
            return { ...alt, correta: false };
          }
          return alt;
        })
      });
    }
  };

  const adicionarAfirmativa = () => {
    if (questaoLocal.afirmativas) {
      setQuestaoLocal({
        ...questaoLocal,
        afirmativas: [...questaoLocal.afirmativas, {
          id: uuidv4(),
          texto: "",
          resposta: "V"
        }]
      });
    }
  };

  const removerAfirmativa = (id: string) => {
    if (questaoLocal.afirmativas && questaoLocal.afirmativas.length > 1) {
      setQuestaoLocal({
        ...questaoLocal,
        afirmativas: questaoLocal.afirmativas.filter(af => af.id !== id)
      });
    }
  };

  const atualizarAfirmativa = (id: string, campo: keyof AfirmativaVerdadeiroFalso, valor: any) => {
    if (questaoLocal.afirmativas) {
      setQuestaoLocal({
        ...questaoLocal,
        afirmativas: questaoLocal.afirmativas.map(af =>
          af.id === id ? { ...af, [campo]: valor } : af
        )
      });
    }
  };

  const mudarTipo = (novoTipo: Questao['tipo']) => {
    let novaQuestao: Questao = {
      ...questaoLocal,
      tipo: novoTipo
    };

    // Resetar campos específicos do tipo
    delete novaQuestao.alternativas;
    delete novaQuestao.linhasResposta;
    delete novaQuestao.afirmativas;

    // Configurar campos padrão para o novo tipo
    switch (novoTipo) {
      case "multipla_escolha":
        novaQuestao.alternativas = [
          { id: uuidv4(), texto: "", correta: true },
          { id: uuidv4(), texto: "", correta: false },
          { id: uuidv4(), texto: "", correta: false },
          { id: uuidv4(), texto: "", correta: false }
        ];
        break;
      case "dissertativa":
        novaQuestao.linhasResposta = 5;
        break;
      case "verdadeiro_falso":
        novaQuestao.afirmativas = [
          { id: uuidv4(), texto: "", resposta: "V" }
        ];
        break;
    }

    setQuestaoLocal(novaQuestao);
  };

  // Visualização resumida quando não está editando
  if (!editando && questao) {
    return (
      <Card className="group hover:shadow-educational-card transition-educational">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                {numeracao && (
                  <Badge variant="outline" className="text-xs">
                    {numeracao}
                  </Badge>
                )}
              </div>
              <Badge variant="secondary" className="text-xs">
                {tiposQuestao.find(t => t.value === questao.tipo)?.label}
              </Badge>
            </div>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-educational">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditando(true)}
                className="h-8 w-8 p-0"
              >
                <Edit3 className="h-3 w-3" />
              </Button>
              {onRemover && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRemover}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {questao.enunciado || "Enunciado não definido"}
          </p>
          {questao.tipo === "multipla_escolha" && questao.alternativas && (
            <div className="mt-2 text-xs text-muted-foreground">
              {questao.alternativas.length} alternativas
            </div>
          )}
          {questao.tipo === "dissertativa" && (
            <div className="mt-2 text-xs text-muted-foreground">
              {questao.linhasResposta || 5} linhas para resposta
            </div>
          )}
          {questao.tipo === "verdadeiro_falso" && questao.afirmativas && (
            <div className="mt-2 text-xs text-muted-foreground">
              {questao.afirmativas.length} afirmativas
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Modo de edição
  return (
    <Card className="border-primary/50 shadow-educational-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {numeracao && (
              <Badge variant="outline">
                Questão {numeracao}
              </Badge>
            )}
            <Select
              value={questaoLocal.tipo}
              onValueChange={(value: Questao['tipo']) => mudarTipo(value)}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {tiposQuestao.map(tipo => (
                  <SelectItem key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleCancelar}>
              Cancelar
            </Button>
            <Button size="sm" onClick={handleSalvar}>
              Salvar
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Enunciado */}
        <div className="space-y-2">
          <Label htmlFor="enunciado">Enunciado</Label>
          <Textarea
            id="enunciado"
            placeholder="Digite o enunciado da questão..."
            value={questaoLocal.enunciado}
            onChange={(e) => setQuestaoLocal({ ...questaoLocal, enunciado: e.target.value })}
            className="min-h-[100px]"
          />
        </div>

        {/* Upload de imagem */}
        <div className="space-y-2">
          <Label>Imagem (opcional)</Label>
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-educational cursor-pointer">
            <Image className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Clique para adicionar uma imagem
            </p>
          </div>
        </div>

        <Separator />

        {/* Campos específicos por tipo */}
        {questaoLocal.tipo === "multipla_escolha" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Alternativas</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={adicionarAlternativa}
                className="h-8"
              >
                <Plus className="h-3 w-3 mr-1" />
                Adicionar
              </Button>
            </div>
            
            <div className="space-y-3">
              {questaoLocal.alternativas?.map((alternativa, index) => (
                <div key={alternativa.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <Badge variant={alternativa.correta ? "default" : "outline"} className="w-8 h-8 flex items-center justify-center p-0">
                    {String.fromCharCode(65 + index)}
                  </Badge>
                  
                  <Input
                    placeholder="Digite o texto da alternativa..."
                    value={alternativa.texto}
                    onChange={(e) => atualizarAlternativa(alternativa.id, "texto", e.target.value)}
                    className="flex-1"
                  />
                  
                  <Button
                    variant={alternativa.correta ? "default" : "outline"}
                    size="sm"
                    onClick={() => atualizarAlternativa(alternativa.id, "correta", !alternativa.correta)}
                    className="h-8 w-8 p-0"
                  >
                    {alternativa.correta ? (
                      <CheckCircle2 className="h-3 w-3" />
                    ) : (
                      <XCircle className="h-3 w-3" />
                    )}
                  </Button>
                  
                  {questaoLocal.alternativas && questaoLocal.alternativas.length > 2 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removerAlternativa(alternativa.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {questaoLocal.tipo === "dissertativa" && (
          <div className="space-y-2">
            <Label htmlFor="linhas">Número de linhas para resposta</Label>
            <Input
              id="linhas"
              type="number"
              min="1"
              max="30"
              value={questaoLocal.linhasResposta || 5}
              onChange={(e) => setQuestaoLocal({ 
                ...questaoLocal, 
                linhasResposta: parseInt(e.target.value) || 5 
              })}
              className="w-32"
            />
          </div>
        )}

        {questaoLocal.tipo === "verdadeiro_falso" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Afirmativas</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={adicionarAfirmativa}
                className="h-8"
              >
                <Plus className="h-3 w-3 mr-1" />
                Adicionar
              </Button>
            </div>
            
            <div className="space-y-3">
              {questaoLocal.afirmativas?.map((afirmativa, index) => (
                <div key={afirmativa.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <Badge variant="outline" className="w-8 h-8 flex items-center justify-center p-0">
                    {index + 1}
                  </Badge>
                  
                  <Input
                    placeholder="Digite a afirmativa..."
                    value={afirmativa.texto}
                    onChange={(e) => atualizarAfirmativa(afirmativa.id, "texto", e.target.value)}
                    className="flex-1"
                  />
                  
                  <Select
                    value={afirmativa.resposta}
                    onValueChange={(value: 'V' | 'F') => atualizarAfirmativa(afirmativa.id, "resposta", value)}
                  >
                    <SelectTrigger className="w-16">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="V">V</SelectItem>
                      <SelectItem value="F">F</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {questaoLocal.afirmativas && questaoLocal.afirmativas.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removerAfirmativa(afirmativa.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}