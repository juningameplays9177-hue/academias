import { SelectAcademiaClient } from "@/components/tenant/select-academia-client";

export default function SelectAcademiaPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-neutral-950 to-black px-4 py-12 text-white">
      <div className="mx-auto max-w-5xl">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500">
          Multi-unidade
        </p>
        <div className="mt-10">
          <SelectAcademiaClient />
        </div>
      </div>
    </div>
  );
}
