import { Header } from "@/components/Header";
import { WorkspaceCard } from "@/components/WorkspaceCard";
import { FileText, Users, BookOpen, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary-light/20 to-secondary-light/20">
      <Header />
      
      <main className="container mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-primary to-secondary shadow-educational">
              <BookOpen className="h-12 w-12 text-white" />
            </div>
          </div>
          
          <h1 className="text-5xl font-bold text-foreground mb-6 tracking-tight">
            Bem-vindo ao <span className="text-primary">Mecanografia</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Plataforma moderna para criação, formatação e geração de documentos avaliativos educacionais. 
            Simplifique seu processo de criação de provas, atividades e simulados com ferramentas profissionais.
          </p>
        </div>

        {/* Workspace Selection */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-4">Escolha seu Workspace</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Selecione o tipo de documento que deseja criar. Cada workspace é otimizado para suas necessidades específicas.
          </p>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <WorkspaceCard
              title="Prova ou Atividade"
              description="Para documentos de disciplina única"
              icon={FileText}
              features={[
                "Templates especializados (Prova Global, Microteste, Atividade)",
                "Fluxo linear e simplificado",
                "Questões múltipla escolha, dissertativas e V/F",
                "Geração de PDF profissional"
              ]}
              onSelect={() => navigate("/prova-creator")}
              variant="primary"
            />
            
            <WorkspaceCard
              title="Simulado"
              description="Para documentos multidisciplinares complexos"
              icon={Users}
              features={[
                "Templates ENEM e simulados tradicionais",
                "Gerenciamento por abas (disciplinas)",
                "Layout em duas colunas otimizado",
                "Paginação automática para impressão"
              ]}
              onSelect={() => navigate("/simulado-creator")}
              variant="secondary"
            />
          </div>
        </div>

        {/* Features Preview */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-educational-card animate-slide-up">
          <h3 className="text-2xl font-bold text-center mb-8">Recursos Principais</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 rounded-lg bg-primary-light/50 hover:bg-primary-light transition-educational">
              <Target className="h-8 w-8 text-primary mx-auto mb-4" />
              <h4 className="font-semibold mb-2">Eficiência</h4>
              <p className="text-sm text-muted-foreground">Reduza drasticamente o tempo de formatação com templates pré-configurados</p>
            </div>
            
            <div className="text-center p-6 rounded-lg bg-secondary-light/50 hover:bg-secondary-light transition-educational">
              <BookOpen className="h-8 w-8 text-secondary mx-auto mb-4" />
              <h4 className="font-semibold mb-2">Consistência</h4>
              <p className="text-sm text-muted-foreground">Mantenha identidade visual unificada com fonte Inter e layouts profissionais</p>
            </div>
            
            <div className="text-center p-6 rounded-lg bg-primary-light/50 hover:bg-primary-light transition-educational">
              <FileText className="h-8 w-8 text-primary mx-auto mb-4" />
              <h4 className="font-semibold mb-2">Flexibilidade</h4>
              <p className="text-sm text-muted-foreground">Suporte a múltiplos tipos de questões e formatos de avaliação</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
