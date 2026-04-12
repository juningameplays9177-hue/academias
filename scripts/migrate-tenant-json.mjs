import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "..", "data", "database.json");

const TENANT = "acad_beira_rio";
const TENANT2 = "acad_iron_moema";

const raw = fs.readFileSync(dbPath, "utf-8");
const db = JSON.parse(raw);

if (!db.academias) {
  db.academias = [
    {
      id: TENANT,
      nome: "Beira Rio Fit",
      slug: "beira-rio-fit",
      status: "ativo",
      logoUrl: null,
    },
    {
      id: TENANT2,
      nome: "Iron House · Moema",
      slug: "iron-house-moema",
      status: "ativo",
      logoUrl: null,
    },
  ];
}

for (const u of db.users) {
  if (u.role === "ultra_admin") u.academiaId = null;
  else if (u.academiaId === undefined) u.academiaId = TENANT;
}

for (const p of db.professors) {
  if (p.academiaId === undefined) p.academiaId = TENANT;
}

for (const pl of db.plans) {
  if (pl.academiaId === undefined) pl.academiaId = TENANT;
}

for (const s of db.students) {
  if (s.academiaId === undefined) s.academiaId = TENANT;
}

for (const w of db.workouts) {
  if (w.academiaId === undefined) w.academiaId = TENANT;
}

for (const c of db.classes) {
  if (c.academiaId === undefined) c.academiaId = TENANT;
}

for (const n of db.notices) {
  if (n.academiaId === undefined) n.academiaId = TENANT;
}

for (const a of db.attendance) {
  if (a.academiaId === undefined) a.academiaId = TENANT;
}

const hasMulti = db.students.some(
  (s) => s.email?.toLowerCase() === "multi@tenant.demo",
);
if (!hasMulti) {
  db.students.push({
    id: "stu-multi-br",
    academiaId: TENANT,
    nome: "Carla Duarte",
    email: "multi@tenant.demo",
    password: "123456",
    telefone: "(21) 98888-0001",
    planoId: "plan-basico",
    status: "ativo",
    professorId: "prof-1",
    permissoes: {
      treino: true,
      dieta: false,
      agenda: true,
      progresso: true,
      avaliacao: false,
    },
    treinos: [],
    avisoPainel: "Conta demo multi-academia — Beira Rio Fit.",
    progressoPct: 0,
    criadoEm: new Date().toISOString(),
  });
  db.students.push({
    id: "stu-multi-moema",
    academiaId: TENANT2,
    nome: "Carla Duarte",
    email: "multi@tenant.demo",
    password: "123456",
    telefone: "(11) 97777-0002",
    planoId: "plan-moema-basico",
    status: "ativo",
    professorId: "prof-moema-1",
    permissoes: {
      treino: true,
      dieta: true,
      agenda: true,
      progresso: true,
      avaliacao: true,
    },
    treinos: ["Adaptação Moema"],
    avisoPainel: "Conta demo multi-academia — Iron House Moema.",
    progressoPct: 5,
    criadoEm: new Date().toISOString(),
  });
}

const moemaPlans = [
  {
    id: "plan-moema-basico",
    academiaId: TENANT2,
    nome: "Off-peak Moema",
    precoMensal: 149.9,
    beneficios: ["Acesso manhã", "App check-in", "1 avaliação / trimestre"],
  },
  {
    id: "plan-moema-inter",
    academiaId: TENANT2,
    nome: "Full time Moema",
    precoMensal: 219.9,
    beneficios: ["Horário liberado", "Armário incluso", "Bike 1x mês"],
    destaque: true,
  },
  {
    id: "plan-moema-premium",
    academiaId: TENANT2,
    nome: "Performance Moema",
    precoMensal: 319.9,
    beneficios: ["Coach dedicado", "Nutrição básica", "Prioridade turmas"],
  },
];

for (const pl of moemaPlans) {
  if (!db.plans.some((p) => p.id === pl.id)) db.plans.push(pl);
}

if (!db.professors.some((p) => p.id === "prof-moema-1")) {
  db.professors.push({
    id: "prof-moema-1",
    academiaId: TENANT2,
    nome: "Ricardo Fontes",
    email: "ricardo.fontes@ironhouse.com.br",
    especialidade: "HIIT · força",
    telefone: "(11) 94567-8899",
  });
}

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), "utf-8");
console.log("OK", dbPath);
