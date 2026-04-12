import { SitePublicSwitch } from "@/components/ultra/site-public-switch";
import { UltraDirectoryClient } from "@/components/ultra/ultra-directory-client";

export default function UltraHomePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Usuários da academia</h1>
        <p className="mt-1 max-w-3xl text-sm text-neutral-400">
          Visão unificada de staff, professores e alunos. Ações críticas exigem confirmação explícita;
          você não pode excluir a própria sessão.
        </p>
      </div>
      <SitePublicSwitch />
      <UltraDirectoryClient />
    </div>
  );
}
