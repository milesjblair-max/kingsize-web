
const fs = require("fs");
const path = require("path");

const PUBLIC_PRODUCTS_DIR = path.resolve(__dirname, "..", "public", "products");

function renameFiles(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            renameFiles(fullPath);
        } else if (entry.isFile() && /\.(jpg|jpeg|png|webp)$/i.test(entry.name)) {
            const name = path.basename(entry.name, path.extname(entry.name));
            const ext = path.extname(entry.name);
            const parts = name.split("_");

            if (parts.length >= 2) {
                const positional = new Set(["FRONT", "BACK", "SIDE", "FLAT", "MODEL", "DETAIL", "25"]);
                const filtered = parts.filter((p) => !positional.has(p.toUpperCase()));

                if (filtered.length >= 2) {
                    const colourCode = filtered[filtered.length - 1];
                    const sku = filtered.slice(0, -1).join("_");
                    const newName = `${sku}_${colourCode}${ext}`;
                    const newPath = path.join(dir, newName);

                    if (fullPath !== newPath) {
                        console.log(`Renaming: ${entry.name} -> ${newName}`);
                        if (!fs.existsSync(newPath)) {
                            fs.renameSync(fullPath, newPath);
                        } else {
                            console.log(`  Target exists, skipping or merging: ${newName}`);
                            if (entry.name.toUpperCase().includes("FRONT")) {
                                fs.renameSync(fullPath, newPath + ".tmp");
                                if (fs.existsSync(newPath)) fs.unlinkSync(newPath);
                                fs.renameSync(newPath + ".tmp", newPath);
                            }
                        }
                    }
                }
            }
        }
    }
}

console.log("🚀 Starting image renaming (JS version)...");
renameFiles(PUBLIC_PRODUCTS_DIR);
console.log("✅ Done!");
