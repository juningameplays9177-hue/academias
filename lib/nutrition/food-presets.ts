/** kcal aproximadas por 100 g (referência genérica — uso educativo). */
export type FoodPreset = {
  id: string;
  nome: string;
  kcalPer100g: number;
};

export const FOOD_PRESETS: FoodPreset[] = [
  // Arroz, grãos, massas
  { id: "arroz-branco", nome: "Arroz branco cozido", kcalPer100g: 130 },
  { id: "arroz-integral", nome: "Arroz integral cozido", kcalPer100g: 124 },
  { id: "arroz-parbolizado", nome: "Arroz parboilizado cozido", kcalPer100g: 128 },
  { id: "feijao-preto", nome: "Feijão preto cozido", kcalPer100g: 77 },
  { id: "feijao-carioca", nome: "Feijão carioca cozido", kcalPer100g: 76 },
  { id: "feijao-branco", nome: "Feijão branco cozido", kcalPer100g: 88 },
  { id: "lentilha-cozida", nome: "Lentilha cozida", kcalPer100g: 116 },
  { id: "grao-bico", nome: "Grão-de-bico cozido", kcalPer100g: 164 },
  { id: "ervilha", nome: "Ervilha em grão cozida", kcalPer100g: 81 },
  { id: "milho-verde", nome: "Milho verde em grão cozido", kcalPer100g: 96 },
  { id: "cuscuz-milho", nome: "Cuscuz de milho (cozido)", kcalPer100g: 112 },
  { id: "polenta", nome: "Polenta / angu", kcalPer100g: 85 },
  { id: "quinoa-cozida", nome: "Quinoa cozida", kcalPer100g: 120 },
  { id: "aveia-flocos", nome: "Aveia em flocos (seca)", kcalPer100g: 389 },
  { id: "granola", nome: "Granola", kcalPer100g: 471 },
  { id: "macarrao-cozido", nome: "Macarrão cozido (sem óleo)", kcalPer100g: 158 },
  { id: "macarrao-integral", nome: "Macarrão integral cozido", kcalPer100g: 124 },
  { id: "lasanha", nome: "Lasanha bolonhesa (média)", kcalPer100g: 163 },
  { id: "nhoque", nome: "Nhoque ao molho", kcalPer100g: 140 },
  { id: "canja", nome: "Canja de galinha", kcalPer100g: 34 },
  { id: "sopa-legumes", nome: "Sopa de legumes", kcalPer100g: 35 },

  // Pães e farinhas
  { id: "pao-frances", nome: "Pão francês", kcalPer100g: 300 },
  { id: "pao-forma", nome: "Pão de forma", kcalPer100g: 265 },
  { id: "pao-integral", nome: "Pão integral", kcalPer100g: 253 },
  { id: "pao-queijo", nome: "Pão de queijo", kcalPer100g: 325 },
  { id: "bisnaguinha", nome: "Bisnaguinha / hot dog roll", kcalPer100g: 280 },
  { id: "croissant", nome: "Croissant", kcalPer100g: 406 },
  { id: "tapioca-seca", nome: "Goma de tapioca (seca)", kcalPer100g: 360 },
  { id: "farofa", nome: "Farofa pronta", kcalPer100g: 400 },
  { id: "mandioca-cozida", nome: "Mandioca / aipim cozida", kcalPer100g: 125 },
  { id: "inhame", nome: "Inhame cozido", kcalPer100g: 118 },
  { id: "batata-inglesa-cozida", nome: "Batata inglesa cozida", kcalPer100g: 86 },
  { id: "batata-doce", nome: "Batata-doce cozida", kcalPer100g: 86 },
  { id: "pure-batata", nome: "Purê de batata (com leite/manteiga)", kcalPer100g: 113 },

  // Carnes e ovos
  { id: "frango-grelhado", nome: "Frango grelhado (sem pele)", kcalPer100g: 165 },
  { id: "frango-pele", nome: "Frango assado com pele", kcalPer100g: 215 },
  { id: "peito-peru", nome: "Peito de peru (fatiado)", kcalPer100g: 100 },
  { id: "carne-moida", nome: "Carne moída refogada", kcalPer100g: 260 },
  { id: "patinho", nome: "Carne bovina magra (patinho cozido)", kcalPer100g: 220 },
  { id: "alcatra", nome: "Alcatra grelhada", kcalPer100g: 271 },
  { id: "picanha", nome: "Picanha grelhada", kcalPer100g: 289 },
  { id: "linguica", nome: "Linguiça toscana / calabresa frita", kcalPer100g: 310 },
  { id: "bacon", nome: "Bacon frito", kcalPer100g: 541 },
  { id: "presunto", nome: "Presunto cozido", kcalPer100g: 145 },
  { id: "mortadela", nome: "Mortadela", kcalPer100g: 283 },
  { id: "salsicha", nome: "Salsicha cozida", kcalPer100g: 247 },
  { id: "hamburguer", nome: "Hambúrguer bovino grelhado", kcalPer100g: 254 },
  { id: "costela", nome: "Costela bovina assada", kcalPer100g: 373 },
  { id: "porco", nome: "Carne suína magra grelhada", kcalPer100g: 242 },
  { id: "ovo-cozido", nome: "Ovo de galinha cozido", kcalPer100g: 155 },
  { id: "ovo-frito", nome: "Ovo frito (com óleo)", kcalPer100g: 196 },
  { id: "clara-ovo", nome: "Clara de ovo (cozida)", kcalPer100g: 52 },

  // Peixes e frutos do mar
  { id: "tilapia", nome: "Filé de tilápia grelhado", kcalPer100g: 96 },
  { id: "sardinha", nome: "Sardinha em lata (óleo)", kcalPer100g: 208 },
  { id: "atum-lata", nome: "Atum em lata (água)", kcalPer100g: 116 },
  { id: "salmao", nome: "Salmão grelhado", kcalPer100g: 208 },
  { id: "camarao", nome: "Camarão cozido", kcalPer100g: 99 },
  { id: "polvo", nome: "Polvo cozido", kcalPer100g: 164 },
  { id: "lula", nome: "Lula grelhada", kcalPer100g: 92 },
  { id: "bacalhau", nome: "Bacalhau dessalgado cozido", kcalPer100g: 82 },

  // Laticínios
  { id: "leite-integral", nome: "Leite integral", kcalPer100g: 61 },
  { id: "leite-desnatado", nome: "Leite desnatado", kcalPer100g: 35 },
  { id: "iogurte-natural", nome: "Iogurte natural", kcalPer100g: 61 },
  { id: "iogurte-grego", nome: "Iogurte grego natural", kcalPer100g: 97 },
  { id: "requeijao", nome: "Requeijão cremoso", kcalPer100g: 257 },
  { id: "queijo-minas", nome: "Queijo minas frescal", kcalPer100g: 264 },
  { id: "queijo-mussarela", nome: "Queijo mussarela", kcalPer100g: 280 },
  { id: "queijo-prato", nome: "Queijo prato", kcalPer100g: 360 },
  { id: "queijo-cottage", nome: "Queijo cottage", kcalPer100g: 98 },
  { id: "ricota", nome: "Ricota", kcalPer100g: 140 },
  { id: "creme-leite", nome: "Creme de leite", kcalPer100g: 221 },
  { id: "manteiga", nome: "Manteiga", kcalPer100g: 717 },
  { id: "margarina", nome: "Margarina", kcalPer100g: 717 },

  // Frutas
  { id: "banana-prata", nome: "Banana prata", kcalPer100g: 89 },
  { id: "banana-nanica", nome: "Banana nanica", kcalPer100g: 92 },
  { id: "maca", nome: "Maçã com casca", kcalPer100g: 52 },
  { id: "laranja", nome: "Laranja (polpa)", kcalPer100g: 45 },
  { id: "mamao", nome: "Mamão papaya", kcalPer100g: 43 },
  { id: "melancia", nome: "Melancia", kcalPer100g: 30 },
  { id: "melao", nome: "Melão", kcalPer100g: 34 },
  { id: "uva", nome: "Uva", kcalPer100g: 69 },
  { id: "morango", nome: "Morango", kcalPer100g: 30 },
  { id: "abacate", nome: "Abacate", kcalPer100g: 160 },
  { id: "abacaxi", nome: "Abacaxi", kcalPer100g: 48 },
  { id: "manga", nome: "Manga", kcalPer100g: 60 },
  { id: "kiwi", nome: "Kiwi", kcalPer100g: 61 },
  { id: "pera", nome: "Pera", kcalPer100g: 57 },
  { id: "pessego", nome: "Pêssego", kcalPer100g: 39 },
  { id: "limao", nome: "Limão (polpa)", kcalPer100g: 29 },
  { id: "coco-ralado", nome: "Coco ralado fresco", kcalPer100g: 354 },
  { id: "tamarindo", nome: "Tamarindo (polpa doce)", kcalPer100g: 239 },

  // Legumes e saladas
  { id: "alface", nome: "Alface", kcalPer100g: 14 },
  { id: "rucula", nome: "Rúcula", kcalPer100g: 25 },
  { id: "tomate", nome: "Tomate", kcalPer100g: 18 },
  { id: "pepino", nome: "Pepino", kcalPer100g: 15 },
  { id: "cenoura", nome: "Cenoura cozida", kcalPer100g: 35 },
  { id: "brocolis", nome: "Brócolis cozido", kcalPer100g: 35 },
  { id: "couve", nome: "Couve refogada", kcalPer100g: 69 },
  { id: "espinafre", nome: "Espinafre cozido", kcalPer100g: 23 },
  { id: "abobrinha", nome: "Abobrinha refogada", kcalPer100g: 24 },
  { id: "berinjela", nome: "Berinjela grelhada", kcalPer100g: 25 },
  { id: "pimentao", nome: "Pimentão cru", kcalPer100g: 27 },
  { id: "beterraba", nome: "Beterraba cozida", kcalPer100g: 49 },
  { id: "vagem", nome: "Vagem cozida", kcalPer100g: 25 },

  // Oleaginosas, óleos, doces
  { id: "azeite", nome: "Azeite de oliva", kcalPer100g: 884 },
  { id: "oleo-soja", nome: "Óleo de soja", kcalPer100g: 884 },
  { id: "amendoim", nome: "Amendoim torrado", kcalPer100g: 606 },
  { id: "castanha-caju", nome: "Castanha de caju", kcalPer100g: 553 },
  { id: "amendoa", nome: "Amêndoas", kcalPer100g: 579 },
  { id: "nozes", nome: "Nozes", kcalPer100g: 654 },
  { id: "pasta-amendoim", nome: "Pasta de amendoim", kcalPer100g: 588 },
  { id: "chocolate-ao-leite", nome: "Chocolate ao leite", kcalPer100g: 535 },
  { id: "chocolate-70", nome: "Chocolate amargo (~70% cacau)", kcalPer100g: 598 },
  { id: "acucar", nome: "Açúcar refinado", kcalPer100g: 387 },
  { id: "mel", nome: "Mel", kcalPer100g: 304 },
  { id: "geleia", nome: "Geleia de frutas", kcalPer100g: 265 },
  { id: "doce-leite", nome: "Doce de leite", kcalPer100g: 315 },
  { id: "brigadeiro", nome: "Brigadeiro", kcalPer100g: 360 },
  { id: "pudim", nome: "Pudim de leite", kcalPer100g: 143 },
  { id: "sorvete", nome: "Sorvete (média)", kcalPer100g: 207 },
  { id: "biscoito-agua", nome: "Biscoito de água e sal", kcalPer100g: 432 },
  { id: "biscoito-recheado", nome: "Biscoito recheado", kcalPer100g: 472 },
  { id: "pipoca", nome: "Pipoca (com manteiga leve)", kcalPer100g: 387 },
  { id: "batata-frita", nome: "Batata frita", kcalPer100g: 312 },
  { id: "pure-instantaneo", nome: "Purê de batata em flocos (instantâneo)", kcalPer100g: 326 },

  // Bebidas e industrializados
  { id: "cafe-preto", nome: "Café preto sem açúcar", kcalPer100g: 2 },
  { id: "cafe-leite", nome: "Café com leite (média)", kcalPer100g: 41 },
  { id: "cha-preto", nome: "Chá mate / preto sem açúcar", kcalPer100g: 1 },
  { id: "refrigerante", nome: "Refrigerante comum", kcalPer100g: 38 },
  { id: "suco-laranja", nome: "Suco de laranja natural", kcalPer100g: 45 },
  { id: "suco-caixinha", nome: "Suco de caixinha (integral)", kcalPer100g: 54 },
  { id: "isotonico", nome: "Bebida isotônica", kcalPer100g: 25 },
  { id: "cerveja", nome: "Cerveja (média)", kcalPer100g: 41 },
  { id: "vinho", nome: "Vinho tinto", kcalPer100g: 85 },
  { id: "achocolatado", nome: "Achocolatado (com leite em pó)", kcalPer100g: 400 },
  { id: "whey", nome: "Whey protein (pó, média)", kcalPer100g: 400 },
  { id: "barra-cereal", nome: "Barra de cereal", kcalPer100g: 400 },
  { id: "milk-shake", nome: "Milk-shake (média)", kcalPer100g: 112 },

  // Pratos e fast-food (médias)
  { id: "feijoada", nome: "Feijoada (prato montado médio)", kcalPer100g: 120 },
  { id: "strogonoff", nome: "Strogonoff de frango com arroz", kcalPer100g: 130 },
  { id: "escondidinho", nome: "Escondidinho de carne seca", kcalPer100g: 165 },
  { id: "pastel", nome: "Pastel frito (média carne/queijo)", kcalPer100g: 289 },
  { id: "coxinha", nome: "Coxinha de frango", kcalPer100g: 283 },
  { id: "risole", nome: "Risole de presunto e queijo", kcalPer100g: 271 },
  { id: "pizza-mussarela", nome: "Pizza mussarela (fatia média)", kcalPer100g: 266 },
  { id: "sanduiche-natural", nome: "Sanduíche natural", kcalPer100g: 180 },
  { id: "x-salada", nome: "X-salada (média)", kcalPer100g: 220 },
  { id: "marmita-fit", nome: "Marmita fitness (frango + arroz + legumes)", kcalPer100g: 110 },
  { id: "yakisoba", nome: "Yakisoba", kcalPer100g: 145 },
  { id: "sushi", nome: "Sushi / sashimi variado (média)", kcalPer100g: 150 },
  { id: "temaki", nome: "Temaki salmão (média)", kcalPer100g: 180 },
  { id: "acai-tigela", nome: "Açaí na tigela (com granola e banana)", kcalPer100g: 140 },
  { id: "tapioca-queijo", nome: "Tapioca recheada com queijo", kcalPer100g: 195 },
  { id: "crepioca", nome: "Crepioca", kcalPer100g: 160 },
  { id: "omelete", nome: "Omelete (2 ovos + recheio leve)", kcalPer100g: 154 },
  { id: "vatapa", nome: "Vatapá", kcalPer100g: 175 },
  { id: "moqueca", nome: "Moqueca de peixe", kcalPer100g: 95 },
  { id: "bobo-camarao", nome: "Bobó de camarão", kcalPer100g: 120 },
];

export const CUSTOM_FOOD_ID = "custom";

export function normalizeSearchText(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim();
}

const SORTED_PRESETS = [...FOOD_PRESETS].sort((a, b) =>
  a.nome.localeCompare(b.nome, "pt-BR"),
);

/** Lista para exibir na busca: filtra por nome (ignora acentos). */
export function filterFoodPresets(query: string, limit = 100): FoodPreset[] {
  const q = normalizeSearchText(query);
  if (!q) return SORTED_PRESETS.slice(0, limit);
  const hits = FOOD_PRESETS.filter((f) =>
    normalizeSearchText(f.nome).includes(q),
  ).sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  return hits.slice(0, limit);
}

export function kcalForPortion(
  kcalPer100g: number,
  pesoGramsPorPorcao: number,
  quantidadePorcoes: number,
) {
  const g = Math.max(0, pesoGramsPorPorcao) * Math.max(0, quantidadePorcoes);
  return (Math.max(0, kcalPer100g) / 100) * g;
}
