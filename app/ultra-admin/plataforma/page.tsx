import { AcademiasPlataformaSwitches } from "@/components/ultra/academias-plataforma-switches";
import { SitePublicSwitch } from "@/components/ultra/site-public-switch";
import { UltraAssumeTenant } from "@/components/ultra/ultra-assume-tenant";

export default function UltraPlataformaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Plataforma e site público</h1>
        <p className="mt-1 max-w-3xl text-sm text-neutral-400">
          Suspenda o acesso <strong className="text-neutral-200">por unidade</strong>, ligue ou
          desligue o site para toda a rede, e escolha em qual academia operar como administração.
        </p>
      </div>
      <AcademiasPlataformaSwitches />
      <UltraAssumeTenant />
      <SitePublicSwitch />
    </div>
  );
}
