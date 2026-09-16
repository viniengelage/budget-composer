import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Modal } from "@/components/ui/modal";

export interface ConfirmDialogProps {
  title: string;
  question: string;
  detail?: string;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
  busy?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  title,
  question,
  detail,
  confirmLabel,
  cancelLabel = "Não, deixar como está",
  destructive = false,
  busy = false,
  error = null,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal
      title={title}
      onClose={onCancel}
      footer={
        <>
          <Button label={cancelLabel} variant="secondary" onClick={onCancel} />
          <Button
            label={confirmLabel}
            variant={destructive ? "danger" : "primary"}
            loading={busy}
            onClick={onConfirm}
          />
        </>
      }
    >
      <div className="flex gap-4">
        <span
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
            destructive ? "bg-danger-50 text-danger-600" : "bg-brand-soft text-brand-700"
          }`}
        >
          <Icon name="warning-circle" size={28} />
        </span>
        <div className="flex flex-col gap-2">
          <p className="font-semibold">{question}</p>
          {detail ? <p className="text-sm text-content-muted">{detail}</p> : null}
        </div>
      </div>

      {error ? (
        <p className="rounded-md bg-danger-50 px-4 py-3 text-sm text-content-danger">
          {error}
        </p>
      ) : null}
    </Modal>
  );
}
