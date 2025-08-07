import { BookOpen, Edit3 } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export function Logo({ size = "md", showText = true, className = "" }: LogoProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8", 
    lg: "h-12 w-12"
  };

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-3xl"
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative">
        <div className={`${sizeClasses[size]} rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-educational`}>
          <BookOpen className={`${size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : 'h-6 w-6'} text-white`} />
        </div>
        <Edit3 className={`absolute -bottom-1 -right-1 ${size === 'sm' ? 'h-2 w-2' : size === 'md' ? 'h-3 w-3' : 'h-4 w-4'} text-secondary bg-background rounded-full p-0.5`} />
      </div>
      {showText && (
        <span className={`font-bold text-foreground tracking-tight ${textSizeClasses[size]}`}>
          Mecanografia
        </span>
      )}
    </div>
  );
}