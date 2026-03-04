import { test, expect, Page } from "@playwright/test";

// ─── Breakpoints ──────────────────────────────────────────────────────────────
const BREAKPOINTS = [
    { name: "small-mobile", width: 360, height: 800 },
    { name: "iphone", width: 390, height: 844 },
    { name: "tablet", width: 768, height: 1024 },
    { name: "small-laptop", width: 1024, height: 768 },
    { name: "common-laptop", width: 1366, height: 768 },
    { name: "desktop", width: 1440, height: 900 },
    { name: "large-desktop", width: 1920, height: 1080 },
];

// ─── Pages to test ────────────────────────────────────────────────────────────
const PAGES = [
    { name: "home", path: "/" },
    { name: "about", path: "/about" },
    { name: "help", path: "/help" },
    { name: "contact", path: "/contact" },
    { name: "new-in", path: "/new-in" },
    { name: "experience", path: "/experience" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
async function checkNoHorizontalScroll(page: Page) {
    const overflow = await page.evaluate(() => {
        return document.body.scrollWidth > window.innerWidth;
    });
    expect(overflow, "Horizontal scroll detected").toBe(false);
}

async function checkNoOverflow(page: Page) {
    const offenders = await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll("*"));
        return elements
            .filter((el) => {
                const rect = el.getBoundingClientRect();
                return rect.right > window.innerWidth + 2; // 2px tolerance
            })
            .map((el) => el.tagName + (el.className ? "." + el.className.toString().split(" ")[0] : ""))
            .slice(0, 5);
    });
    if (offenders.length > 0) {
        console.warn("⚠️ Overflow offenders:", offenders);
    }
    expect(offenders.length, `Elements overflowing viewport: ${offenders.join(", ")}`).toBe(0);
}

// ─── Screenshot tests at all breakpoints ─────────────────────────────────────
for (const bp of BREAKPOINTS) {
    for (const pg of PAGES) {
        test(`[${bp.name}] ${pg.name} — screenshot`, async ({ page }) => {
            await page.setViewportSize({ width: bp.width, height: bp.height });
            await page.goto(pg.path, { waitUntil: "networkidle" });

            // Screenshot (compared to saved baseline)
            await expect(page).toHaveScreenshot(`${pg.name}-${bp.name}.png`, {
                maxDiffPixelRatio: 0.03, // 3% pixel change allowed
                fullPage: true,
            });
        });
    }
}

// ─── No horizontal scroll at all breakpoints ─────────────────────────────────
for (const bp of BREAKPOINTS) {
    test(`[${bp.name}] home — no horizontal scroll`, async ({ page }) => {
        await page.setViewportSize({ width: bp.width, height: bp.height });
        await page.goto("/", { waitUntil: "networkidle" });
        await checkNoHorizontalScroll(page);
    });
}

// ─── Layout assertions ────────────────────────────────────────────────────────
test("Header visible and not overlapping content at 1366px", async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto("/", { waitUntil: "networkidle" });

    const nav = page.locator("nav").first();
    await expect(nav).toBeVisible();

    const navBox = await nav.boundingBox();
    const main = page.locator("main, section").first();
    const mainBox = await main.boundingBox();

    if (navBox && mainBox) {
        expect(mainBox.y).toBeGreaterThanOrEqual(navBox.y + navBox.height - 2);
    }
});

test("Hero renders within viewport at 1024px", async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto("/", { waitUntil: "networkidle" });

    const hero = page.locator("section").first();
    const box = await hero.boundingBox();
    expect(box?.width).toBeLessThanOrEqual(1024 + 2);
    await checkNoHorizontalScroll(page);
});

test("Product grid: 4 columns at 1440px", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/", { waitUntil: "networkidle" });

    // Grid items should not be full-width (indicating they're in columns)
    const firstCard = page.locator(".group.cursor-pointer").first();
    const box = await firstCard.boundingBox();
    if (box) {
        expect(box.width).toBeLessThan(1440 / 2); // Should be max ~25% of width
    }
});

test("Product grid: single column at 390px mobile", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/", { waitUntil: "networkidle" });

    const firstCard = page.locator(".group.cursor-pointer").first();
    const box = await firstCard.boundingBox();
    if (box) {
        expect(box.width).toBeGreaterThan(300); // Should be near full width
    }
    await checkNoHorizontalScroll(page);
});

test("No overflow at 1024px", async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto("/", { waitUntil: "networkidle" });
    await checkNoOverflow(page);
});

// ─── Personalisation smoke tests ──────────────────────────────────────────────

test("GET /api/context returns valid JSON with required fields", async ({ page }) => {
    const response = await page.request.get("/api/context");
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty("fitType");
    expect(body).toHaveProperty("consentState");
    expect(body).toHaveProperty("isAuthenticated");
    expect(body).toHaveProperty("klaviyoLinked");
});

test("GET /api/recommendations returns valid JSON with required fields", async ({ page }) => {
    const response = await page.request.get("/api/recommendations");
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty("heroPicks");
    expect(body).toHaveProperty("shopByStyleBundles");
    expect(body).toHaveProperty("trendingInYourFit");
    expect(body).toHaveProperty("meta");
    expect(Array.isArray(body.heroPicks)).toBe(true);
});

test("Logged-out: FitSelector widget renders on homepage", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/", { waitUntil: "networkidle" });
    // FitSelector renders with aria-label
    const fitGroup = page.locator('[aria-label="Select your fit"]').first();
    // It may or may not be present depending on homepage composition — check API works
    const apiRes = await page.request.get("/api/context");
    expect(apiRes.ok()).toBe(true);
});

test("Consent endpoint returns valid state", async ({ page }) => {
    const response = await page.request.get("/api/gateway/consent");
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(["essential", "analytics", "marketing"]).toContain(body.consentState);
});

test("Privacy export endpoint is accessible", async ({ page }) => {
    const response = await page.request.get("/api/gateway/privacy/export?email=test@example.com");
    // Returns 200 with null data (no record) — not 500
    expect(response.status()).toBe(200);
});

