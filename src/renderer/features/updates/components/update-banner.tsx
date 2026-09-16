import { Button, Icon } from "@/components/ui";

export interface UpdateBannerProps {
  version: string | null;
  applying: boolean;
  onApply: () => void;
  onDismiss: () => void;
}

/**
 * Aparece só quando a atualização já foi baixada e é aplicar-e-pronto. Não é
 * modal: a pessoa pode terminar o orçamento que está fazendo e atualizar
 * depois. E não é discreto: uma faixa verde no alto da tela é vista.
 */
export function UpdateBanner({
  version,
  applying,
  onApply,
  onDismiss,
}: UpdateBannerProps) {
  return (
    <div className="flex items-center gap-4 border-b border-brand-300 bg-brand-soft px-10 py-4">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-700 text-white">
        <Icon name="check-circle" size={24} />
      </span>

      <div className="min-w-0 flex-1">
        <p className="font-semibold text-brand-800">
          Tem uma versão nova do programa
          {version === null ? "" : ` (${version})`}, pronta para instalar.
        </p>
        <p className="text-sm text-content-muted">
          Leva alguns segundos e o programa abre de novo sozinho. Seus orçamentos
          continuam salvos.
        </p>
      </div>

      <Button
        label="Atualizar agora"
        icon="check-circle"
        loading={applying}
        onClick={onApply}
      />
      <Button
        label="Agora não"
        variant="ghost"
        disabled={applying}
        onClick={onDismiss}
      />
    </div>
  );
}
