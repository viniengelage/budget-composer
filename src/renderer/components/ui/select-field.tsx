import { useId, type ReactNode, type SelectHTMLAttributes } from "react";

import { cn } from "@/utils/cn";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: readonly SelectOption[];
  hint?: ReactNode;
}

export function SelectField({
  label,
  options,
  hint,
  className,
  id,
  ...rest
}: SelectFieldProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const hintId = `${selectId}-hint`;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={selectId} className="text-sm font-semibold text-content">
        {label}
      </label>

      <select
        id={selectId}
        aria-describedby={hint ? hintId : undefined}
        className={cn(
          "min-h-13 rounded-md border-[1.5px] border-line-strong bg-surface px-4",
          "cursor-pointer appearance-none bg-no-repeat pr-11",
          className,
        )}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 256 256'><path fill='%23566B5E' d='M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z'/></svg>\")",
          backgroundPosition: "right 12px center",
          backgroundSize: "22px 22px",
        }}
        {...rest}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {hint ? (
        <p id={hintId} className="text-xs text-content-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
