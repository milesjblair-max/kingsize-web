
const { dbQuery } = require("./src/lib/db");

async function check() {
    try {
        const products = await dbQuery("SELECT p.id, pi.url FROM products_catalog p JOIN product_images pi ON pi.product_id = p.id LIMIT 5");
        console.log("DB URLs:", JSON.stringify(products, null, 2));

        const candidates = await dbQuery("SELECT product_id, url FROM product_images WHERE is_primary = TRUE LIMIT 5");
        console.log("Primary URLs:", JSON.stringify(candidates, null, 2));
    } catch (e) {
        console.error(e);
    }
}
check();
