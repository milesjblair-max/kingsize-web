
import { dbQuery } from "../src/lib/db";

async function checkImages() {
    try {
        const rows = await dbQuery("SELECT p.id, p.title, pi.url FROM products_catalog p JOIN product_images pi ON p.id = pi.product_id WHERE p.id IN ('HB36728', 'RBPL0972', 'DKWORKSOP')");
        console.log(JSON.stringify(rows, null, 2));
    } catch (err) {
        console.error("DB Error:", err);
    }
}

checkImages();
