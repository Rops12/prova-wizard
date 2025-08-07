import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Settings, HelpCircle } from "lucide-react";

interface HeaderProps {
  showActions?: boolean;
}

export function Header({ showActions = true }: HeaderProps) {
  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Logo size="md" />
          
          {showActions && (
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <HelpCircle className="h-4 w-4" />
                Ajuda
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <Settings className="h-4 w-4" />
                Configurações
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}