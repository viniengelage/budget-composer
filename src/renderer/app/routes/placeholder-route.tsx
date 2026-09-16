import { Page, PageBody, PageHeader } from "@/components/layouts/page";
import { EmptyState, type IconName } from "@/components/ui";

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
    <Page>
      <PageHeader title={title} subtitle={subtitle} />
      <PageBody>
        <div className="flex h-full items-center justify-center rounded-lg border border-line bg-surface shadow-card">
          <EmptyState
            icon={icon}
            tone="neutral"
            title="Em construção"
            description={description}
          />
        </div>
      </PageBody>
    </Page>
  );
}
