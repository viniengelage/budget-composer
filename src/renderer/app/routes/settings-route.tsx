import { useEffect, useState } from "react";

import { Page, PageBody, PageHeader } from "@/components/layouts/page";
import { Button, Card, Spinner } from "@/components/ui";
import { useCompany, useUpdateCompany } from "@/features/company/api/company";
import {
  AddressCard,
  CompanyDetailsCard,
  PaymentCard,
  ValidityCard,
} from "@/features/company/components/company-cards";
import { LogoCard } from "@/features/company/components/logo-card";
import { PdfHeaderPreview } from "@/features/company/components/pdf-header-preview";
import { useCompanyDraft } from "@/features/company/hooks/use-company-draft";
import {
  validateCompany,
  type CompanyFormErrors,
} from "@/features/company/types/company-schema";
import type { Company } from "@shared/types";

export function SettingsRoute() {
  const { data: company, isPending } = useCompany();

  if (isPending || company === undefined) {
    return (
      <Page>
        <PageHeader
          title="Configurações"
          subtitle="Estes dados aparecem no cabeçalho de todos os orçamentos"
        />
        <PageBody>
          <div className="flex items-center justify-center gap-3 p-16 text-content-muted">
            <Spinner size={28} />
            Carregando seus dados…
          </div>
        </PageBody>
      </Page>
    );
  }

  return <SettingsContent company={company} />;
}

function SettingsContent({ company }: { company: Company }) {
  const { draft, setField, dirty } = useCompanyDraft(company);
  const [errors, setErrors] = useState<CompanyFormErrors>({});
  const [justSaved, setJustSaved] = useState(false);

  const updateCompany = useUpdateCompany();

  // A confirmação só some sozinha; nada some sem a pessoa ver que salvou.
  useEffect(() => {
    if (!justSaved) return;
    const timer = setTimeout(() => setJustSaved(false), 4000);
    return () => clearTimeout(timer);
  }, [justSaved]);

  const save = () => {
    const found = validateCompany(draft);
    setErrors(found ?? {});
    if (found) return;

    updateCompany.mutate(draft, {
      onSuccess: () => setJustSaved(true),
    });
  };

  return (
    <Page>
      <PageHeader
        title="Configurações"
        subtitle="Estes dados aparecem no cabeçalho de todos os orçamentos"
        action={
          <div className="flex items-center gap-4">
            <SaveStatus dirty={dirty} justSaved={justSaved} />
            <Button
              label="Salvar alterações"
              icon="check-circle"
              size="lg"
              disabled={!dirty}
              loading={updateCompany.isPending}
              onClick={save}
            />
          </div>
        }
      />

      <PageBody className="grid grid-cols-[minmax(0,1fr)_360px] items-start gap-6">
        <div className="flex flex-col gap-6">
          <CompanyDetailsCard company={draft} errors={errors} onChange={setField} />
          <AddressCard company={draft} errors={errors} onChange={setField} />
          <PaymentCard company={draft} errors={errors} onChange={setField} />
          <ValidityCard company={draft} errors={errors} onChange={setField} />
        </div>

        <div className="flex flex-col gap-6">
          <LogoCard
            logoUri={draft.logoUri}
            companyName={draft.name}
            onChange={(logoUri) => setField("logoUri", logoUri)}
          />

          <Card title="Como aparece no PDF">
            <PdfHeaderPreview company={draft} />
            <p className="text-xs text-content-muted">
              A logo entra num espaço quadrado. Imagens largas ficam com sobra nas
              laterais.
            </p>
          </Card>

          {updateCompany.error ? (
            <p className="rounded-md bg-danger-50 px-4 py-3 text-sm text-content-danger">
              {updateCompany.error.message}
            </p>
          ) : null}
        </div>
      </PageBody>
    </Page>
  );
}

function SaveStatus({ dirty, justSaved }: { dirty: boolean; justSaved: boolean }) {
  if (justSaved && !dirty) {
    return <span className="font-semibold text-content-brand">Alterações salvas</span>;
  }
  if (dirty) {
    return <span className="text-content-muted">Você tem alterações não salvas</span>;
  }
  return null;
}
