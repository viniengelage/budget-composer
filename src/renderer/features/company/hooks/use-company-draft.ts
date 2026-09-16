import { useCallback, useMemo, useState } from "react";

import type { Company } from "@shared/types";

export function useCompanyDraft(saved: Company) {
  const [draft, setDraft] = useState<Company>(saved);

  const setField = useCallback(
    <Field extends keyof Company>(field: Field, value: Company[Field]) => {
      setDraft((current) => ({ ...current, [field]: value }));
    },
    [],
  );

  const reset = useCallback(() => setDraft(saved), [saved]);

  const dirty = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(saved),
    [draft, saved],
  );

  return { draft, setField, reset, dirty };
}
