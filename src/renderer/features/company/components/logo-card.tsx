import { useRef, useState } from "react";

import { Button, Card } from "@/components/ui";
import { prepareLogo } from "@/lib/image/prepare-logo";

export interface LogoCardProps {
  logoUri: string | null;
  companyName: string;
  onChange: (logoUri: string | null) => void;
}

export function LogoCard({ logoUri, companyName, onChange }: LogoCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [working, setWorking] = useState(false);

  const pick = async (file: File | undefined) => {
    if (!file) return;

    setWorking(true);
    setError(null);

    const result = await prepareLogo(file);
    setWorking(false);

    if (result.ok) onChange(result.dataUrl);
    else setError(result.message);
  };

  return (
    <Card title="Logo da empresa">
      <div className="flex h-36 items-center justify-center overflow-hidden rounded-md bg-subtle">
        {logoUri === null ? (
          <span className="flex h-20 w-20 items-center justify-center rounded-md bg-brand-700 text-xl font-bold text-white">
            {initialsOf(companyName)}
          </span>
        ) : (
          <img
            src={logoUri}
            alt="Logo da sua empresa, como vai sair impressa"
            className="h-full w-full object-contain p-3"
          />
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg"
        className="hidden"
        onChange={(event) => {
          void pick(event.target.files?.[0]);
          event.target.value = "";
        }}
      />

      <Button
        label={logoUri === null ? "Escolher imagem" : "Trocar imagem"}
        icon="note-pencil"
        variant="secondary"
        fullWidth
        loading={working}
        onClick={() => inputRef.current?.click()}
      />

      {logoUri === null ? null : (
        <button
          type="button"
          onClick={() => {
            setError(null);
            onChange(null);
          }}
          className="cursor-pointer self-center rounded-sm font-semibold text-content-danger hover:underline"
        >
          Remover imagem
        </button>
      )}

      {error ? (
        <p className="rounded-md bg-danger-50 px-4 py-3 text-sm text-content-danger">
          {error}
        </p>
      ) : (
        <p className="text-xs text-content-muted">
          PNG ou JPG, quadrada. O ideal é 400×400 pixels.
        </p>
      )}
    </Card>
  );
}

function initialsOf(name: string): string {
  const parts = name
    .split(/\s+/)
    .filter((part) => part.length > 2)
    .slice(0, 2);

  if (parts.length === 0) return name.slice(0, 2).toUpperCase() || "OG";
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}
