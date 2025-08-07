import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function SimuladoCreator() {
  const navigate = useNavigate();

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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-lg p-6 shadow-educational-card">
              <h2 className="text-xl font-semibold mb-4">Configuração do Simulado</h2>
              <p className="text-muted-foreground">Em desenvolvimento...</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-card border border-border rounded-lg p-6 shadow-educational-card">
              <h2 className="text-xl font-semibold mb-4">Preview</h2>
              <p className="text-muted-foreground">Preview do documento será exibido aqui...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}