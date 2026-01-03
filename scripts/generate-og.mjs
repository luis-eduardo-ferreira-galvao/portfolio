import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();

// De onde vem a imagem “fonte” do OG.
// Sugestão: você mantém uma imagem por post aqui, em alta resolução.
const OG_SOURCE_DIR = path.join(ROOT, "src", "og"); // você vai criar
const OG_OUTPUT_DIR = path.join(ROOT, "public", "images", "og");

// Padrão OG recomendado (social preview)
const WIDTH = 1200;
const HEIGHT = 630;

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function listFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile())
    .map((e) => path.join(dir, e.name));
}

function outNameFromInput(inputFile) {
  // Ex: src/og/gds3710-nx-witness.png -> public/images/og/gds3710-nx-witness.webp
  const base = path.parse(inputFile).name;
  return `${base}.webp`;
}

async function buildOne(inputFile) {
  const outFile = path.join(OG_OUTPUT_DIR, outNameFromInput(inputFile));

  await sharp(inputFile)
    .resize(WIDTH, HEIGHT, { fit: "cover", position: "centre" })
    .webp({ quality: 82 })
    .toFile(outFile);

  return outFile;
}

async function main() {
  await ensureDir(OG_OUTPUT_DIR);

  // Se a pasta não existir ainda, não quebra o build
  try {
    await fs.access(OG_SOURCE_DIR);
  } catch {
    console.log(`[og] Pasta ${OG_SOURCE_DIR} não existe. Pulando geração de OG images.`);
    return;
  }

  const inputs = await listFiles(OG_SOURCE_DIR);
  if (inputs.length === 0) {
    console.log("[og] Nenhuma imagem em src/og. Nada a fazer.");
    return;
  }

  const results = [];
  for (const input of inputs) {
    const out = await buildOne(input);
    results.push(out);
  }

  console.log(`[og] Geradas ${results.length} OG images em public/images/og`);
}

main().catch((err) => {
  console.error("[og] Falhou:", err);
  process.exit(1);
});
