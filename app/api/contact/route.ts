import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    nome?: string;
    email?: string;
    mensagem?: string;
  };
  if (!body.nome?.trim() || !body.email?.trim() || !body.mensagem?.trim()) {
    return NextResponse.json({ error: "Preencha todos os campos." }, { status: 400 });
  }
  return NextResponse.json({
    ok: true,
    message:
      "Recebemos sua mensagem. A recepção costuma responder em até 1 dia útil.",
  });
}
