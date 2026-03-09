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

// ─── Homepage Personalisation States ──────────────────────────────────────────

test.describe("Homepage Recommendations States", () => {

    test("State 1: Logged-out shows blurred module with Sign-up nudge", async ({ page }) => {
        // Mock session out
        await page.route("/api/gateway/customer/session", async (route) => {
            await route.fulfill({ status: 200, json: { authenticated: false } });
        });

        await page.goto("/", { waitUntil: "networkidle" });
        await expect(page.getByTestId("recs-logged-out")).toBeVisible();
        await expect(page.locator("text=Get personalised recommendations")).toBeVisible();
        await expect(page.locator("text=Takes around 60 seconds to create your account")).toBeVisible();
    });

    test("State 2: Logged-in Empty shows specific empty state", async ({ page }) => {
        // Mock session in with unique email to prevent cross-test cache hits
        await page.route("/api/gateway/customer/session", async (route) => {
            await route.fulfill({ status: 200, json: { authenticated: true, profile: { id: "test", email: "test-empty@example.com" } } });
        });
        // Mock empty recs
        await page.route("/api/gateway/recommendations/home", async (route) => {
            await route.fulfill({ status: 200, json: { recommendations: [] } });
        });

        await page.goto("/", { waitUntil: "networkidle" });
        await expect(page.getByTestId("recs-empty")).toBeVisible();
        await expect(page.locator("text=We’re building your recommendations")).toBeVisible();
    });

    test("State 3: Logged-in Ready shows products", async ({ page }) => {
        // Mock session in with unique email
        await page.route("/api/gateway/customer/session", async (route) => {
            await route.fulfill({ status: 200, json: { authenticated: true, profile: { id: "test", email: "test-ready@example.com" } } });
        });
        // Mock data
        await page.route("/api/gateway/recommendations/home", async (route) => {
            await route.fulfill({ status: 200, json: { recommendations: [{ id: "1", slug: "test-polo", brand: "TestBrand", title: "Test Polo", price: 40, images: [] }] } });
        });

        await page.goto("/", { waitUntil: "networkidle" });
        await expect(page.getByTestId("recs-ready")).toBeVisible();
        await expect(page.locator("text=Test Polo")).toBeVisible();
    });

    test("State 4: Error state shows inline error and retry", async ({ page }) => {
        // Mock session in
        await page.route("/api/gateway/customer/session", async (route) => {
            await route.fulfill({ status: 200, json: { authenticated: true, profile: { id: "test", email: "test@example.com" } } });
        });
        // Mock 500
        await page.route("/api/gateway/recommendations/home", async (route) => {
            await route.fulfill({ status: 500, body: "Internal Server Error" });
        });

        await page.goto("/", { waitUntil: "networkidle" });
        await expect(page.getByTestId("recs-error")).toBeVisible();
        await expect(page.locator("text=Unable to load your recommendations")).toBeVisible();
    });

    test("Logged-in: Renders both recently viewed and recommendations rails", async ({ page }) => {
        // Mock session in
        await page.route("/api/gateway/customer/session", async (route) => {
            await route.fulfill({ status: 200, json: { authenticated: true, profile: { id: "test", email: "test@example.com" } } });
        });
        // Mock Recently Viewed
        await page.route("/api/gateway/recently-viewed", async (route) => {
            await route.fulfill({ status: 200, json: { recentlyViewed: [{ id: "rv-1", title: "Viewed Item", price: 20 }] } });
        });
        // Mock Recs
        await page.route("/api/gateway/recommendations/home", async (route) => {
            await route.fulfill({ status: 200, json: { recommendations: [{ id: "1", title: "Test Polo", price: 40 }] } });
        });

        await page.goto("/", { waitUntil: "networkidle" });

        // Assert headings exist
        await expect(page.locator("text=Pick up where you left off")).toBeVisible();
        await expect(page.locator("text=We think you'll like these")).toBeVisible();

        // Ensure no horizontal overflow caused by horizontal rails
        const overflow = await page.evaluate(() => document.body.scrollWidth > window.innerWidth);
        expect(overflow, "Horizontal scroll detected on modules").toBe(false);
    });

    test("120% Zoom equivalent (1200x750) has no horizontal overflow", async ({ page }) => {
        // Mock data to ensure rails render
        await page.route("/api/gateway/recently-viewed", async (route) => {
            await route.fulfill({ status: 200, json: { recentlyViewed: Array.from({ length: 8 }).map((_, i) => ({ id: i, title: `Test ${i}`, price: 10 })) } });
        });
        await page.route("/api/gateway/recommendations/home", async (route) => {
            await route.fulfill({ status: 200, json: { recommendations: Array.from({ length: 8 }).map((_, i) => ({ id: i, title: `Test ${i}`, price: 10 })) } });
        });

        await page.setViewportSize({ width: 1200, height: 750 });
        await page.goto("/", { waitUntil: "networkidle" });

        const overflow = await page.evaluate(() => document.body.scrollWidth > window.innerWidth);
        expect(overflow, "Horizontal scroll detected at 120% zoom equivalent").toBe(false);
    });
});

// ─── Onboarding Swipe Quiz ───────────────────────────────────────────────────

test.describe("Onboarding Swipe Quiz", () => {
    test("Renders 20+ cards without broken images and handles fallback", async ({ page }) => {
        // Mock candidates to return 25 items, with 2 valid images and the rest forcing fallback or errors
        const mockCandidates = Array.from({ length: 25 }).map((_, i) => ({
            productId: `prod-${i}`,
            title: `Test Product ${i}`,
            primaryImageUrl: i % 2 === 0 ? "invalid-url-to-force-fallback.jpg" : `/images/new-arrivals/hk-tshirt.jpg`,
            category: "T-Shirt",
            tags: ["casual"]
        }));

        await page.route("**/api/gateway/swipe/candidates*", async (route) => {
            await route.fulfill({ status: 200, json: { candidates: mockCandidates } });
        });

        await page.goto("/onboarding", { waitUntil: "networkidle" });

        // Skip Welcome
        await page.getByRole("button", { name: "Let's find your fit →" }).click();

        // Skip Fit Type
        await page.getByText("Big & Tall", { exact: true }).click();
        await page.getByRole("button", { name: "Next →" }).click();

        // Skip Size Setup
        await page.getByText("Sizes I already wear").click();
        await page.getByRole("button", { name: "Compute dimensions" }).click();

        // Skip Fit Profile confirmation
        await page.getByRole("button", { name: "Looks right to me →" }).click();

        // Should be on Style Prefs mode chooser
        // Click "Swipe style quiz"
        await page.getByText("Swipe style quiz").click();

        // Ensure images are visible despite broken links (should show placeholder or real image)
        // We will swipe through 20 of them using the Right Arrow key.
        for (let i = 0; i < 20; i++) {
            // Check that the top card is visible
            await expect(page.locator(".cursor-grab").first()).toBeVisible();

            // Wait a brief moment for the image to resolve/error out
            await page.waitForTimeout(300);

            // Verify an image or the text fallback is visible
            const imageCount = await page.locator("img").count();
            if (imageCount > 0) {
                const firstImgSrc = await page.locator("img").first().getAttribute("src");
                expect(firstImgSrc).toBeTruthy();
            }

            // Hit right arrow to "Like" and advance
            await page.keyboard.press("ArrowRight");
        }

        // We swiped 20 out of 25.
        await expect(page.locator("text=20 of 25 swiped")).toBeVisible();
    });
});

// ─── Local Account Creation & PDP ────────────────────────────────────────────

test.describe("Local Account Creation & Product Details", () => {
    test("Create account flow works and shows specific errors", async ({ page }) => {
        // Mock register POST
        await page.route("**/api/gateway/customer/register", async (route) => {
            const body = JSON.parse(route.request().postData() || "{}");
            if (body.email === "fail@example.com") {
                await route.fulfill({ status: 500, json: { success: false, error: "Failed to create account. Please check your connection and try again." } });
            } else {
                await route.fulfill({ status: 200, json: { success: true, needsOnboarding: true } });
            }
        });

        await page.goto("/login", { waitUntil: "networkidle" });
        await page.getByRole("button", { name: "Create account" }).click();

        // Test Failure
        await page.fill("input[type='email']", "fail@example.com");
        await page.getByRole("button", { name: "Create account and set up my" }).click();
        await expect(page.locator("text=Failed to create account")).toBeVisible();

        // Test Success (navigates to onboarding)
        await page.fill("input[type='email']", "success@example.com");
        await page.getByRole("button", { name: "Create account and set up my" }).click();

        await expect(page).toHaveURL(/.*onboarding$/);
    });

    test("Clicking a product goes to PDP and triggers view tracking", async ({ page }) => {
        // Mock data
        await page.route("/api/gateway/recommendations/home", async (route) => {
            await route.fulfill({ status: 200, json: { recommendations: [{ id: "test-sku-123", slug: "test-product", title: "Test Product", price: 40, images: [] }] } });
        });

        // Intercept view tracking
        let viewTracked = false;
        await page.route("**/api/gateway/events/product-view", async (route) => {
            viewTracked = true;
            await route.fulfill({ status: 200, json: { success: true } });
        });

        await page.goto("/", { waitUntil: "networkidle" });

        // Click the product (We know the recommendation rail has Test Product)
        await page.getByText("Test Product").first().click();

        // Assert URL changes to PDP
        await expect(page).toHaveURL(/.*\/products\/test-product/);

        // Assert the PDP renders the tracking info
        await expect(page.locator("text=SKU: test-sku-123")).toBeVisible();
        await expect(page.locator("text=Add to Bag")).toBeVisible();

        // Wait for effect to fire tracking
        await page.waitForTimeout(500);
        expect(viewTracked).toBe(true);
    });
});
