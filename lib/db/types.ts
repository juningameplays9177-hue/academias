import type { RoleId } from "@/lib/rbac/roles";

export type AcademiaStatus = "ativo" | "inativa";

export type AcademiaRecord = {
  id: string;
  nome: string;
  slug: string;
  status: AcademiaStatus;
  /** Caminho público opcional (ex.: /images/...). */
  logoUrl?: string | null;
  /**
   * Quando true, admin/professor/aluno dessa unidade não acessam painéis nem APIs tenant.
   * Ultra Admin continua podendo operar a unidade (ex.: religar).
   */
  plataformaDesligada?: boolean;
  /** Contato comercial / recepção da unidade. */
  email?: string | null;
  cidade?: string | null;
  estado?: string | null;
  /** Link “Compartilhar” do Google Maps da unidade. */
  googleMapsUrl?: string | null;
  /** Endereço completo (cartão de visita / site). */
  endereco?: string | null;
  telefone?: string | null;
  /** @handle ou URL — exibido no site. */
  instagram?: string | null;
  /** Subtítulo institucional (ex.: bairro · posicionamento). */
  tagline?: string | null;
  /** Cor da marca principal (hex) — botões, ícones fortes. */
  corPrimaria?: string | null;
  /** Segunda cor primária (hex) — gradientes, faixas, hovers. */
  corPrimariaSecundaria?: string | null;
  /** Terceira cor primária (hex) — fundos suaves, bordas leves. */
  corPrimariaSuave?: string | null;
  /** Fundo principal dos painéis e site (hex) — white-label. */
  corFundo?: string | null;
  /** Cor do texto principal sobre o fundo do tema (hex). */
  corTexto?: string | null;
  /** SEO: descrição padrão quando não há página específica. */
  metaDescription?: string | null;
};

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
  /** Tenant — isolamento total de dados. */
  academiaId: string;
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
  academiaId: string;
  nome: string;
  precoMensal: number;
  beneficios: string[];
  destaque?: boolean;
};

export type ProfessorRecord = {
  id: string;
  academiaId: string;
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
  academiaId: string;
  nome: string;
  descricao: string;
  criadoPorProfessorId: string;
  foco: string;
};

export type ClassSlot = {
  id: string;
  academiaId: string;
  titulo: string;
  diaSemana: string;
  horario: string;
  professorId: string;
  vagas: number;
};

export type NoticeTarget = "todos" | "alunos" | "professores";

export type NoticeRecord = {
  id: string;
  academiaId: string;
  titulo: string;
  corpo: string;
  destino: NoticeTarget;
  criadoEm: string;
  criadoPorUserId: string;
};

export type AttendanceRecord = {
  id: string;
  academiaId: string;
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
  /** Ultra Admin da plataforma: null. Admin operacional: id da academia. */
  academiaId: string | null;
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
  academias: AcademiaRecord[];
  users: AuthUserRecord[];
  students: StudentRecord[];
  plans: PlanRecord[];
  professors: ProfessorRecord[];
  workouts: WorkoutTemplate[];
  classes: ClassSlot[];
  notices: NoticeRecord[];
  attendance: AttendanceRecord[];
};

/**
 * Registro global da rede: metadados das unidades + contas sem tenant (ultra admin).
 * Persistido em `data/platform.json`.
 */
/**
 * Só o necessário para `proxy.ts` (rotas, flags). Sem `logoUrl` em base64 nem users —
 * evita parse de MB em cada request (cold start / primeira aba → 503 em serverless).
 */
export type PlatformRegistryProxyView = {
  version: number;
  platformSettings?: PlatformSettings;
  academias: Pick<
    AcademiaRecord,
    "id" | "slug" | "status" | "plataformaDesligada"
  >[];
};

export type PlatformRegistry = {
  version: number;
  platformSettings?: PlatformSettings;
  academias: AcademiaRecord[];
  /** Apenas `academiaId === null` (ex.: ultra_admin). */
  users: AuthUserRecord[];
  /**
   * Staff com `academiaId` apontando para unidade já removida (evita perda em split).
   * Opcional; mesclado de volta em `readDatabase`.
   */
  orphanTenantUsers?: AuthUserRecord[];
};

/**
 * Dados isolados de uma unidade (arquivo `data/tenants/{academiaId}.json`).
 * Criado/atualizado quando o Ultra Admin cadastra ou altera a academia.
 */
export type TenantDatabase = {
  version: number;
  /** Admins operacionais desta academia (`role: admin`, `academiaId` = esta unidade). */
  users: AuthUserRecord[];
  students: StudentRecord[];
  plans: PlanRecord[];
  professors: ProfessorRecord[];
  workouts: WorkoutTemplate[];
  classes: ClassSlot[];
  notices: NoticeRecord[];
  attendance: AttendanceRecord[];
};
