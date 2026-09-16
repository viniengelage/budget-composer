import { ICON_PATHS, type IconName } from "@/components/ui/icon-paths";

export type { IconName };

export interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
}

/**
 * Phosphor (peso regular), com os paths embutidos: nenhum ícone depende de
 * rede nem de fonte externa para aparecer.
 *
 * `aria-hidden` sempre: nesta interface ícone nunca carrega significado
 * sozinho, ele acompanha um rótulo de texto.
 */
export function Icon({ name, size = 22, className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={size}
      height={size}
      viewBox="0 0 256 256"
      className={className}
      style={{ flexShrink: 0 }}
    >
      <path d={ICON_PATHS[name]} fill="currentColor" />
    </svg>
  );
}
