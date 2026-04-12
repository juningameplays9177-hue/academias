import type { RoleId } from "@/lib/rbac/roles";

export type StudentStatus = "ativo" | "pendente" | "bloqueado" | "inativo";

export type StudentPanelFlags = {
  treino: boolean;
  dieta: boolean;
  agenda: boolean;
  progresso: boolean;
  avaliacao: boolean;
};

export type StudentRecord = {
  id: string;
  nome: string;
  email: string;
  /** Senha própria (cadastro pelo site). Alunos sem campo usam senha demo global no login. */
  password?: string;
  /** CPF só dígitos (11) após normalização */
  cpf?: string;
  telefone: string;
  planoId: string;
  status: StudentStatus;
  professorId: string | null;
  permissoes: StudentPanelFlags;
  treinos: string[];
  /** Mensagem curta exibida no painel do aluno (ex.: financeiro) */
  avisoPainel?: string;
  /** Meta calórica diária (kcal) definida pelo professor de referência. */
  metaKcalDia?: number;
  /**
   * Total de kcal que o aluno registrou por dia (chave YYYY-MM-DD, fuso SP).
   * Soma de “Registrar refeição” na balança.
   */
  consumoKcalPorDia?: Record<string, number>;
  progressoPct: number;
  criadoEm: string;
};

export type PlanRecord = {
  id: string;
  nome: string;
  precoMensal: number;
  beneficios: string[];
  destaque?: boolean;
};

export type ProfessorRecord = {
  id: string;
  nome: string;
  email: string;
  especialidade: string;
  telefone: string;
  /** Se definida, o login do professor usa esta senha em vez da senha demo global. */
  senhaPlataforma?: string;
  /** Bloqueia login do professor na plataforma. */
  contaBloqueada?: boolean;
};

export type WorkoutTemplate = {
  id: string;
  nome: string;
  descricao: string;
  criadoPorProfessorId: string;
  foco: string;
};

export type ClassSlot = {
  id: string;
  titulo: string;
  diaSemana: string;
  horario: string;
  professorId: string;
  vagas: number;
};

export type NoticeTarget = "todos" | "alunos" | "professores";

export type NoticeRecord = {
  id: string;
  titulo: string;
  corpo: string;
  destino: NoticeTarget;
  criadoEm: string;
  criadoPorUserId: string;
};

export type AttendanceRecord = {
  id: string;
  alunoId: string;
  aulaId: string;
  dataISO: string;
  presente: boolean;
};

export type AuthStaffStatus = "ativo" | "bloqueado";

export type AuthUserRecord = {
  id: string;
  email: string;
  /** Apenas demonstração — nunca em produção */
  password: string;
  name: string;
  role: RoleId;
  /** Conta staff (admin / ultra). Ausente = ativo (compatível com JSON antigo). */
  status?: AuthStaffStatus;
};

/** Configuração global persistida (ex.: site público desligado). */
export type PlatformSettings = {
  /** Quando true, só sessão Ultra Admin acessa o restante do sistema. */
  sitePublicoDesligado?: boolean;
};

export type AppDatabase = {
  version: number;
  platformSettings?: PlatformSettings;
  users: AuthUserRecord[];
  students: StudentRecord[];
  plans: PlanRecord[];
  professors: ProfessorRecord[];
  workouts: WorkoutTemplate[];
  classes: ClassSlot[];
  notices: NoticeRecord[];
  attendance: AttendanceRecord[];
};
