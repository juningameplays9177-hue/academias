import { SelectAcademiaClient } from "@/components/tenant/select-academia-client";

export default function SelectAcademiaPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-neutral-950 to-black px-4 py-12 text-white">
      <div className="mx-auto max-w-5xl">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500">
          Multi-unidade
        </p>
        <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-neutral-400">
          Entre na plataforma, conheça o site institucional ou{" "}
          <span className="font-medium text-neutral-200">escolha a unidade abaixo</span> antes do
          login. Se o seu e-mail estiver cadastrado em mais de uma academia, após autenticar você
          escolhe o painel — os dados ficam sempre isolados por unidade.
        </p>
        <div className="mt-10">
          <SelectAcademiaClient />
        </div>
      </div>
    </div>
  );
}
