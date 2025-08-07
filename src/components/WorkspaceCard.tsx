import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface WorkspaceCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  features: string[];
  onSelect: () => void;
  variant?: "primary" | "secondary";
}

export function WorkspaceCard({ 
  title, 
  description, 
  icon: Icon, 
  features, 
  onSelect,
  variant = "primary" 
}: WorkspaceCardProps) {
  return (
    <Card className="group relative overflow-hidden border-2 hover:border-primary/50 transition-educational hover:shadow-educational-card animate-fade-in">
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-educational ${
        variant === "primary" ? "bg-gradient-to-br from-primary to-primary-hover" : "bg-gradient-to-br from-secondary to-secondary-hover"
      }`} />
      
      <CardHeader className="relative">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-lg ${
            variant === "primary" ? "bg-primary-light text-primary" : "bg-secondary-light text-secondary"
          }`}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-xl font-semibold group-hover:text-primary transition-educational">
              {title}
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-1">
              {description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative">
        <ul className="space-y-2 mb-6">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className={`w-1.5 h-1.5 rounded-full ${
                variant === "primary" ? "bg-primary" : "bg-secondary"
              }`} />
              {feature}
            </li>
          ))}
        </ul>

        <Button 
          onClick={onSelect}
          variant={variant === "primary" ? "default" : "secondary"}
          className="w-full group-hover:shadow-educational-focus transition-educational"
        >
          Iniciar {title}
        </Button>
      </CardContent>
    </Card>
  );
}