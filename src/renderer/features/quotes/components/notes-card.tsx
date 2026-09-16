import { Card, TextareaField } from "@/components/ui";

export interface NotesCardProps {
  notes: string;
  onChange: (notes: string) => void;
}

export function NotesCard({ notes, onChange }: NotesCardProps) {
  return (
    <Card title="Observações" step={4}>
      <TextareaField
        label="Observações que saem impressas no orçamento"
        hideLabel
        rows={4}
        placeholder="Prazo de até 5 dias úteis. Garantia de pega de 30 dias com irrigação adequada."
        value={notes}
        onChange={(event) => onChange(event.target.value)}
        hint="Os dados do Pix entram no PDF automaticamente."
      />
    </Card>
  );
}
