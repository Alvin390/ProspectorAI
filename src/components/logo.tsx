import { Target } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2 p-2", className)}>
      <Target className="h-6 w-6 text-primary" />
      <span className="text-lg font-semibold text-foreground">
        ProspectorAI
      </span>
    </div>
  );
}
