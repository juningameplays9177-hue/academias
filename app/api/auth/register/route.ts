import { NextResponse } from "next/server";
import { readDatabase, mutateDatabase } from "@/lib/db/file-store";
import type { StudentRecord } from "@/lib/db/types";
import { isValidCpf, normalizeCpf } from "@/lib/validation/cpf";

function normalizePhone(value: string): string {
  return value.replace(/\D/g, "");
}

function isValidPhoneBr(digits: string): boolean {
  if (digits.length < 10 || digits.length > 13) return false;
  return true;
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    nome?: string;
    email?: string;
    senha?: string;
    confirmarSenha?: string;
    cpf?: string;
    celular?: string;
  };

  const nome = body.nome?.trim() ?? "";
  const email = body.email?.trim().toLowerCase() ?? "";
  const senha = body.senha ?? "";
  const confirmarSenha = body.confirmarSenha ?? "";
  const cpfNorm = normalizeCpf(body.cpf ?? "");
  const celular = normalizePhone(body.celular ?? "");

  if (nome.length < 3) {
    return NextResponse.json(
      { error: "Informe o nome completo." },
      { status: 400 },
    );
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "E-mail inválido." }, { status: 400 });
  }
  if (senha.length < 6) {
    return NextResponse.json(
      { error: "A senha deve ter pelo menos 6 caracteres." },
      { status: 400 },
    );
  }
  if (senha !== confirmarSenha) {
    return NextResponse.json(
      { error: "A confirmação de senha não confere." },
      { status: 400 },
    );
  }
  if (!isValidCpf(cpfNorm)) {
    return NextResponse.json({ error: "CPF inválido." }, { status: 400 });
  }
  if (!isValidPhoneBr(celular)) {
    return NextResponse.json(
      { error: "Informe um celular válido (DDD + número)." },
      { status: 400 },
    );
  }

  const db = await readDatabase();
  const defaultAcademiaId =
    db.academias.find(
      (a) => a.status === "ativo" && !a.plataformaDesligada,
    )?.id ?? null;
  if (!defaultAcademiaId) {
    return NextResponse.json(
      {
        error:
          "Cadastro temporariamente indisponível: todas as unidades estão suspensas ou inativas.",
      },
      { status: 503 },
    );
  }

  if (
    db.users.some((u) => u.email.toLowerCase() === email) ||
    db.professors.some(
      (p) =>
        p.email.toLowerCase() === email && p.academiaId === defaultAcademiaId,
    ) ||
    db.students.some(
      (s) =>
        s.email.toLowerCase() === email && s.academiaId === defaultAcademiaId,
    )
  ) {
    return NextResponse.json(
      { error: "Este e-mail já está cadastrado nesta unidade." },
      { status: 409 },
    );
  }
  if (db.students.some((s) => s.cpf && normalizeCpf(s.cpf) === cpfNorm)) {
    return NextResponse.json(
      { error: "CPF já cadastrado." },
      { status: 409 },
    );
  }

  const displayPhone =
    celular.length === 11
      ? `(${celular.slice(0, 2)}) ${celular.slice(2, 7)}-${celular.slice(7)}`
      : celular.length === 10
        ? `(${celular.slice(0, 2)}) ${celular.slice(2, 6)}-${celular.slice(6)}`
        : celular;

  const planoPadrao =
    db.plans.find((p) => p.academiaId === defaultAcademiaId)?.id ?? "";

  const novo: StudentRecord = {
    id: crypto.randomUUID(),
    academiaId: defaultAcademiaId,
    nome,
    email,
    password: senha,
    cpf: cpfNorm,
    telefone: displayPhone,
    planoId: planoPadrao || "plan-basico",
    status: "pendente",
    professorId: null,
    permissoes: {
      treino: true,
      dieta: false,
      agenda: true,
      progresso: true,
      avaliacao: false,
    },
    treinos: [],
    avisoPainel:
      "Cadastro feito pelo site — finalize na recepção documentos e plano.",
    progressoPct: 0,
    criadoEm: new Date().toISOString(),
  };

  await mutateDatabase((draft) => {
    draft.students.push(novo);
  });

  return NextResponse.json({
    ok: true,
    message:
      "Cadastro recebido. Você já pode entrar com seu e-mail e senha (painel do aluno).",
  });
}
