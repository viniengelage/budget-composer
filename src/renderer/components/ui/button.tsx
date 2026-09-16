import type { ButtonHTMLAttributes } from "react";

import { Icon, type IconName } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/utils/cn";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "sm" | "md" | "lg";

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  /** Sempre obrigatório: nenhum botão desta interface é só ícone. */
  label: string;
  icon?: IconName;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
}

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-brand-700 text-white hover:bg-brand-800 active:bg-brand-800 border border-transparent",
  secondary:
    "bg-surface text-content border-[1.5px] border-line-strong hover:bg-subtle active:bg-subtle",
  danger:
    "bg-danger-600 text-white hover:brightness-95 active:brightness-90 border border-transparent",
  ghost:
    "bg-transparent text-content-brand border border-transparent hover:bg-subtle active:bg-subtle",
};

const SIZES: Record<Size, string> = {
  sm: "h-11 px-4 text-sm",
  md: "h-12 px-6 text-sm",
  lg: "h-14 px-8 text-base",
};

const ICON_SIZES: Record<Size, number> = { sm: 18, md: 19, lg: 22 };

export function Button({
  label,
  icon,
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  disabled,
  className,
  type = "button",
  ...rest
}: ButtonProps) {
  const isDisabled = disabled === true || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading}
      className={cn(
        "inline-flex items-center justify-center gap-2.5 rounded-md font-semibold",
        "transition-colors duration-150 cursor-pointer select-none",
        "disabled:cursor-not-allowed disabled:opacity-45",
        VARIANTS[variant],
        SIZES[size],
        fullWidth && "w-full",
        className,
      )}
      {...rest}
    >
      {loading ? (
        <Spinner size={ICON_SIZES[size]} />
      ) : icon ? (
        <Icon name={icon} size={ICON_SIZES[size]} />
      ) : null}
      {label}
    </button>
  );
}
