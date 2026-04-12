import { lastNBrDateKeys } from "@/lib/date/br-date-key";
import type { AppDatabase } from "@/lib/db/types";

export const DEMO_PASSWORD = "123456";

export function createSeedDatabase(): AppDatabase {
  const now = new Date().toISOString();
  const [k0, k1, k2] = lastNBrDateKeys(3);
  return {
    version: 1,
    platformSettings: {
      sitePublicoDesligado: false,
    },
    users: [
      {
        id: "usr-admin-1",
        email: "admin@academia.com",
        password: DEMO_PASSWORD,
        name: "Renata Moraes",
        role: "admin",
      },
    ],
    professors: [
      {
        id: "prof-1",
        nome: "Marcos Antônio Vieira",
        email: "professor@academia.com",
        especialidade: "Musculação · periodização",
        telefone: "(11) 98204-7712",
      },
      {
        id: "prof-2",
        nome: "Camila Rocha Duarte",
        email: "camila.rocha@beirariofit.com.br",
        especialidade: "Funcional · mobilidade",
        telefone: "(11) 99711-2044",
      },
    ],
    plans: [
      {
        id: "plan-basico",
        nome: "Off-peak",
        precoMensal: 129.9,
        beneficios: [
          "Acesso 6h–14h em dias de semana",
          "1 avaliação física / trimestre",
          "App com check-in e fila de aparelhos",
        ],
      },
      {
        id: "plan-inter",
        nome: "Full time",
        precoMensal: 189.9,
        beneficios: [
          "Horário liberado",
          "1 aula experimental / mês (funcional ou bike)",
          "Armário médio incluso",
        ],
        destaque: true,
      },
      {
        id: "plan-premium",
        nome: "Performance",
        precoMensal: 279.9,
        beneficios: [
          "Tudo do Full time",
          "2 sessões com coach / mês",
          "Prioridade em turmas lotadas",
          "Nutrição básica no app",
        ],
      },
    ],
    students: [
      {
        id: "stu-1",
        nome: "João Pedro Silveira",
        email: "aluno@academia.com",
        telefone: "(11) 98122-9033",
        planoId: "plan-premium",
        status: "ativo",
        professorId: "prof-1",
        permissoes: {
          treino: true,
          dieta: true,
          agenda: true,
          progresso: true,
          avaliacao: true,
        },
        treinos: ["Peito · estabilidade", "Costas · tração", "Pernas B"],
        avisoPainel: "",
        metaKcalDia: 2300,
        consumoKcalPorDia: {
          [k2]: 1800,
          [k1]: 2100,
          [k0]: 1950,
        },
        progressoPct: 62,
        criadoEm: now,
      },
      {
        id: "stu-2",
        nome: "Letícia Amaral",
        email: "leticia.amaral@gmail.com",
        telefone: "(11) 99204-1188",
        planoId: "plan-inter",
        status: "ativo",
        professorId: "prof-2",
        permissoes: {
          treino: true,
          dieta: false,
          agenda: true,
          progresso: true,
          avaliacao: false,
        },
        treinos: ["Full body leve", "Core + mobilidade"],
        avisoPainel: "Mensalidade em aberto — regularize na recepção.",
        metaKcalDia: 2000,
        progressoPct: 38,
        criadoEm: now,
      },
      {
        id: "stu-3",
        nome: "Rafael Costa",
        email: "rafa.costa@outlook.com",
        telefone: "(11) 97002-4410",
        planoId: "plan-basico",
        status: "pendente",
        professorId: "prof-1",
        permissoes: {
          treino: true,
          dieta: false,
          agenda: true,
          progresso: false,
          avaliacao: false,
        },
        treinos: ["Adaptação · semana 1"],
        avisoPainel: "Cadastro pendente de assinatura do termo LGPD.",
        progressoPct: 12,
        criadoEm: now,
      },
    ],
    workouts: [
      {
        id: "wo-1",
        nome: "Empurrar · ombro saudável",
        descricao: "Supino reto + inclinado com pausa; face pull no final.",
        criadoPorProfessorId: "prof-1",
        foco: "Peito · deltoide posterior",
      },
      {
        id: "wo-2",
        nome: "Condicionamento 20'",
        descricao: "Circuito AMRAP leve — técnica antes de velocidade.",
        criadoPorProfessorId: "prof-2",
        foco: "Metabólico",
      },
    ],
    classes: [
      {
        id: "cls-1",
        titulo: "Bike indoor",
        diaSemana: "terça",
        horario: "19:10",
        professorId: "prof-2",
        vagas: 6,
      },
      {
        id: "cls-2",
        titulo: "Força · membros inferiores",
        diaSemana: "quinta",
        horario: "07:15",
        professorId: "prof-1",
        vagas: 4,
      },
    ],
    notices: [
      {
        id: "nt-1",
        titulo: "Manutenção elétrica",
        corpo: "Sábado, 6h–8h, setor de esteiras fica interditado. Demais áreas normais.",
        destino: "alunos",
        criadoEm: now,
        criadoPorUserId: "usr-admin-1",
      },
    ],
    attendance: [
      {
        id: "att-1",
        alunoId: "stu-1",
        aulaId: "cls-1",
        dataISO: now,
        presente: true,
      },
    ],
  };
}
