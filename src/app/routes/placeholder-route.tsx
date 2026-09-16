import { StyleSheet, View } from "react-native";

import { Page, PageHeader } from "@/components/layouts/app-shell";
import { EmptyState, type IconName } from "@/components/ui";
import { color } from "@/styles/tokens";

export interface PlaceholderRouteProps {
  title: string;
  subtitle: string;
  icon: IconName;
  description: string;
}

export function PlaceholderRoute({
  title,
  subtitle,
  icon,
  description,
}: PlaceholderRouteProps) {
  return (
    <Page header={<PageHeader title={title} subtitle={subtitle} />}>
      <View style={styles.panel}>
        <EmptyState
          icon={icon}
          tone="neutral"
          title="Em construção"
          description={description}
        />
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  panel: {
    flex: 1,
    backgroundColor: color.bg.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: color.border.default,
    justifyContent: "center",
  },
});
