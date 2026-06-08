import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const out = "com.hudsonbrendon.ai-usage.sdPlugin/imgs";
mkdirSync(join(out, "plugin"), { recursive: true });
mkdirSync(join(out, "actions"), { recursive: true });

/** [svg source, output path without extension, base px size] */
const jobs = [
  ["assets/plugin-icon.svg", "plugin/icon", 28],
  ["assets/category-icon.svg", "plugin/category", 28],
  ["assets/claude-key.svg", "actions/claude", 20],
  ["assets/codex-key.svg", "actions/codex", 20],
  ["assets/claude-key.svg", "actions/claude-key", 72],
  ["assets/codex-key.svg", "actions/codex-key", 72],
];

for (const [src, dest, size] of jobs) {
  await sharp(src).resize(size, size).png().toFile(join(out, `${dest}.png`));
  await sharp(src).resize(size * 2, size * 2).png().toFile(join(out, `${dest}@2x.png`));
  console.log(`rendered ${dest} (${size}px, ${size * 2}px@2x)`);
}
