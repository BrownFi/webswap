import fs from "fs";
import path from "path";

import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MODULES_DIR = resolve(__dirname, ".");
const OUTPUT_FILE = resolve(MODULES_DIR, "__empty_module.ts");

const SUBDIRS = ["hooks", "components", "utils"];

function getExportedNames(filePath: string): string[] {
    const content = fs.readFileSync(filePath, "utf-8");
    const matches = [...content.matchAll(/export\s+(?:const|function|class)\s+(\w+)/g)];
    return matches.map((m) => m[1]);
}

function getExportsFromDirRecursive(dirPath: string): string[] {
    if (!fs.existsSync(dirPath)) return [];

    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    const names: string[] = [];

    for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
            names.push(...getExportsFromDirRecursive(fullPath));
        } else if (entry.isFile() && (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx"))) {
            names.push(...getExportedNames(fullPath));
        }
    }

    return names;
}

function generateEmptyValue(name: string, category: string): string {
    if (category === "components") return `${name}: () => null`;
    if (category === "hooks") return `${name}: () => ({})`;
    if (category === "utils") return `${name}: () => undefined`;
    return `${name}: undefined`;
}

function run() {
    const allExports: Record<string, string[]> = {
        hooks: [],
        components: [],
        utils: [],
    };

    const moduleDirs = fs
        .readdirSync(MODULES_DIR)
        .filter((name) => fs.statSync(path.join(MODULES_DIR, name)).isDirectory() && name !== "__empty_module");

    for (const mod of moduleDirs) {
        for (const sub of SUBDIRS) {
            const subPath = path.join(MODULES_DIR, mod, sub);
            const exports = getExportsFromDirRecursive(subPath);
            for (const e of exports) {
                if (!allExports[sub].includes(e)) {
                    allExports[sub].push(e);
                }
            }
        }
    }

    const resultLines = [`// AUTO-GENERATED FILE\n`, `export default {`];

    for (const category of SUBDIRS) {
        const items = allExports[category];
        resultLines.push(`  ${category}: {`);
        for (const name of items) {
            resultLines.push(`    ${generateEmptyValue(name, category)},`);
        }
        resultLines.push(`  },`);
    }

    resultLines.push(`};\n`);

    fs.writeFileSync(OUTPUT_FILE, resultLines.join("\n"), "utf-8");

    console.log(`✅ __empty_module.ts generated at: ${OUTPUT_FILE}`);
}

run();
