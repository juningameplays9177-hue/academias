import Link from "next/link";

export default function AcademiaNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-neutral-950 px-6 text-center text-neutral-200">
      <h1 className="text-lg font-semibold">Unidade não encontrada</h1>
      <p className="max-w-md text-sm text-neutral-400">
        Confira o link ou escolha outra academia no hub.
      </p>
      <Link
        href="/select-academia"
        className="rounded-full bg-orange-500 px-5 py-2 text-sm font-medium text-black hover:brightness-110"
      >
        Hub de academias
      </Link>
    </div>
  );
}
