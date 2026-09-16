import { useId, type InputHTMLAttributes, type ReactNode } from "react";

import { Icon, type IconName } from "@/components/ui/icon";
import { cn } from "@/utils/cn";

export type FieldTone = "default" | "success" | "error" | "warning";

export interface TextFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  /** Rótulo visível sempre. Placeholder nunca substitui rótulo. */
  label: string;
  optional?: boolean;
  hint?: ReactNode;
  tone?: FieldTone;
  leadingIcon?: IconName;
  trailingIcon?: IconName;
  prefix?: string;
  suffix?: string;
}

const BORDER: Record<FieldTone, string> = {
  default: "border-[1.5px] border-line-strong",
  success: "border-2 border-brand-700",
  error: "border-2 border-danger-600",
  warning: "border-2 border-warning-600",
};

const HINT: Record<FieldTone, string> = {
  default: "text-content-muted",
  success: "text-content-brand",
  error: "text-content-danger",
  warning: "text-warning-600",
};

const TRAILING: Record<FieldTone, string> = {
  default: "text-content-muted",
  success: "text-brand-700",
  error: "text-danger-600",
  warning: "text-warning-600",
};

export function TextField({
  label,
  optional = false,
  hint,
  tone = "default",
  leadingIcon,
  trailingIcon,
  prefix,
  suffix,
  readOnly,
  className,
  id,
  ...rest
}: TextFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = `${inputId}-hint`;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-semibold text-content">
        {label}
        {optional ? (
          <span className="font-normal text-content-muted"> (opcional)</span>
        ) : null}
      </label>

      <div
        className={cn(
          "flex items-center gap-2.5 rounded-md px-4 min-h-13",
          "focus-within:outline focus-within:outline-3 focus-within:outline-brand-700 focus-within:outline-offset-2",
          BORDER[tone],
          readOnly ? "bg-subtle" : "bg-surface",
        )}
      >
        {leadingIcon ? (
          <Icon name={leadingIcon} size={20} className="text-content-muted" />
        ) : null}
        {prefix ? <span className="text-content-muted">{prefix}</span> : null}

        <input
          id={inputId}
          readOnly={readOnly}
          aria-describedby={hint ? hintId : undefined}
          aria-invalid={tone === "error" || undefined}
          className={cn(
            "min-w-0 flex-1 bg-transparent py-2.5 outline-none",
            "placeholder:text-neutral-400",
            className,
          )}
          {...rest}
        />

        {suffix ? (
          <span className="text-sm font-medium text-content-muted">{suffix}</span>
        ) : null}
        {trailingIcon ? (
          <Icon name={trailingIcon} size={22} className={TRAILING[tone]} />
        ) : null}
      </div>

      {hint ? (
        <p id={hintId} className={cn("text-xs", HINT[tone])}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}
