import { useId, type ComponentPropsWithRef, type ReactNode } from "react";

import { cn } from "@/utils/cn";

export interface TextareaFieldProps extends ComponentPropsWithRef<"textarea"> {
  label: string;
  optional?: boolean;
  hint?: ReactNode;
  hideLabel?: boolean;
}

export function TextareaField({
  label,
  optional = false,
  hint,
  hideLabel = false,
  className,
  id,
  rows = 4,
  ...rest
}: TextareaFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const hintId = `${fieldId}-hint`;

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={fieldId}
        className={cn("text-sm font-semibold text-content", hideLabel && "sr-only")}
      >
        {label}
        {optional ? (
          <span className="font-normal text-content-muted"> (opcional)</span>
        ) : null}
      </label>

      <textarea
        id={fieldId}
        rows={rows}
        aria-describedby={hint ? hintId : undefined}
        className={cn(
          "resize-none rounded-md border-[1.5px] border-line-strong bg-surface px-4 py-3",
          "focus:outline-3 focus:outline-brand-700 focus:outline-offset-2",
          "placeholder:text-neutral-400",
          className,
        )}
        {...rest}
      />

      {hint ? (
        <p id={hintId} className="text-xs text-content-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
