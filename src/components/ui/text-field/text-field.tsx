import { useId } from "react";
import { StyleSheet, TextInput, type TextInputProps, View } from "react-native";

import { Icon } from "@/components/ui/icon/icon";
import type { IconName } from "@/components/ui/icon/paths";
import { Text } from "@/components/ui/text/text";
import { color, control, fontSize, radius, space } from "@/styles/tokens";

export type FieldTone = "default" | "success" | "error" | "warning";

export interface TextFieldProps extends Omit<TextInputProps, "style"> {
  /** Sempre visível. Placeholder nunca substitui rótulo. */
  label: string;
  optional?: boolean;
  hint?: string;
  tone?: FieldTone;
  leadingIcon?: IconName;
  trailingIcon?: IconName;
  /** Texto fixo à esquerda do valor, ex.: "R$". */
  prefix?: string;
  /** Texto fixo à direita do valor, ex.: "por m²". */
  suffix?: string;
}

const TONE_BORDER: Record<FieldTone, string> = {
  default: color.border.strong,
  success: color.border.focus,
  error: color.text.danger,
  warning: color.status.pending.text,
};

const TONE_TEXT: Record<FieldTone, "secondary" | "brand" | "danger"> = {
  default: "secondary",
  success: "brand",
  error: "danger",
  warning: "danger",
};

/**
 * Campo de texto com rótulo visível e mensagem de apoio.
 *
 * `tone` cobre os estados desenhados no board `Spec / Campo CNPJ` do Penpot:
 * neutro, sucesso (dados preenchidos), erro (não encontrado) e alerta
 * (empresa baixada na Receita).
 */
export function TextField({
  label,
  optional = false,
  hint,
  tone = "default",
  leadingIcon,
  trailingIcon,
  prefix,
  suffix,
  editable = true,
  ...rest
}: TextFieldProps) {
  const inputId = useId();

  return (
    <View style={styles.wrapper}>
      <Text variant="label" nativeID={inputId}>
        {label}
        {optional ? "  (opcional)" : ""}
      </Text>

      <View
        style={[
          styles.field,
          { borderColor: TONE_BORDER[tone], borderWidth: tone === "default" ? 1.5 : 2 },
          !editable && styles.readonly,
        ]}
      >
        {leadingIcon ? (
          <Icon name={leadingIcon} size={20} tint={color.text.secondary} />
        ) : null}
        {prefix ? (
          <Text variant="body" tone="secondary">
            {prefix}
          </Text>
        ) : null}

        <TextInput
          accessibilityLabel={label}
          accessibilityLabelledBy={inputId}
          placeholderTextColor={color.text.secondary}
          editable={editable}
          style={styles.input}
          {...rest}
        />

        {suffix ? (
          <Text variant="label" tone="secondary">
            {suffix}
          </Text>
        ) : null}
        {trailingIcon ? (
          <Icon
            name={trailingIcon}
            size={22}
            tint={tone === "success" ? color.text.brand : TONE_BORDER[tone]}
          />
        ) : null}
      </View>

      {hint ? (
        <Text variant="caption" tone={TONE_TEXT[tone]} style={styles.hint}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: space[1] + 2 },
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[2] + 2,
    minHeight: control.md + 4,
    paddingHorizontal: space[4],
    borderRadius: radius.md,
    backgroundColor: color.bg.surface,
  },
  readonly: { backgroundColor: color.bg.subtle },
  input: {
    flex: 1,
    fontSize: fontSize.md,
    color: color.text.primary,
    paddingVertical: space[2],
  },
  hint: { marginTop: 2 },
});
