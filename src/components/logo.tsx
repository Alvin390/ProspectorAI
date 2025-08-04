import { Target } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center gap-2 p-2">
      <Target className="h-6 w-6 text-primary" />
      <span className="text-lg font-semibold text-foreground">
        ProspectorAI
      </span>
    </div>
  );
}
