# QUALITY_GATES.md — Kingsize Web UI Quality Standards

> **Enforce this before every merge and every Vercel deployment.**
> No exceptions. This prevents responsive regressions accumulating silently.

---

## Mandatory Breakpoints

Every UI change must be verified at **all 7 breakpoints**:

| Label | Dimensions | Device |
|---|---|---|
| Small mobile | 360 × 800 | Budget Android |
| iPhone | 390 × 844 | iPhone 14 |
| Tablet | 768 × 1024 | iPad portrait |
| Small laptop | 1024 × 768 | Surface-style |
| Common laptop | 1366 × 768 | Most common desktop |
| Desktop | 1440 × 900 | MacBook/standard |
| Large desktop | 1920 × 1080 | Full HD |

---

## Automated Tests (Playwright)

### What's tested
- Visual screenshot regression at all 7 breakpoints
- No horizontal scroll (`document.body.scrollWidth <= window.innerWidth`)
- Header visible and not overlapping content
- Hero renders within viewport
- Product grid columns: 1 (mobile) → 2 (tablet) → 4 (desktop)
- No text clipped or hidden by overflow

### Run tests locally

```bash
# First time only — install browsers
npx playwright install --with-deps chromium

# Run all UI tests
npm run test:ui

# Update snapshots when a change is intentional
npm run test:ui:update
```

### Test output
- Screenshots saved to `tests/screenshots/`
- Diffs (when failing) saved to `tests/screenshots/__diff__/`
- Failed tests print the breakpoint and page where regression occurred

---

## Manual Pre-deploy Checklist

Before running `vercel --prod --yes`, check each item:

### Header
- [ ] Logo, pill, search, and utility links have no overlap at 1024px+
- [ ] On tablet/mobile: hamburger menu shows or links collapse correctly
- [ ] Search input never causes horizontal overflow
- [ ] Header height is consistent across breakpoints

### Category Nav
- [ ] No ugly line-wrap in category bar at 1024px
- [ ] On < 1024px: scrollable row or collapsed menu
- [ ] Dropdown panels don't overflow viewport edges

### Hero / Banner
- [ ] Text not clipped at any width
- [ ] Padding scales down gracefully at mobile
- [ ] `Founded in 1972` watermark hidden on mobile

### Product Grids
- [ ] 4 columns → 3 columns → 2 columns → 1 column at correct breakpoints
- [ ] Cards within container bounds
- [ ] No fixed widths exceeding viewport

### Global
- [ ] No horizontal scroll at any breakpoint
- [ ] `box-sizing: border-box` applied globally
- [ ] All images load (check Network tab for 404s)
- [ ] Routing works for all nav links

---

## Definition of Done for Any UI Change

A UI change is **only complete** when:

1. ✅ All 7 breakpoints pass Playwright screenshot tests
2. ✅ No horizontal scroll at any breakpoint
3. ✅ Header + navigation remain usable and readable
4. ✅ No elements overlap or clip
5. ✅ Commit includes updated snapshots only if change is **intentional**
6. ✅ `npm run build` succeeds with zero errors
7. ✅ Deployed to Vercel only after local tests pass

---

## CSS Rules — What We Enforce

### Required globally
```css
*, *::before, *::after {
  box-sizing: border-box;
}
```

### Never do this
```css
/* ❌ Hard widths that break mobile */
width: 1200px;
width: 960px;

/* ❌ Absolute positioning for layout */
position: absolute; /* only for decorative overlays */

/* ❌ Overflow without intent */
overflow: hidden; /* only where explicitly needed */
```

### Always do this
```css
/* ✅ Constrain width responsively */
max-width: 1400px;
width: 100%;

/* ✅ Responsive font sizes */
font-size: clamp(14px, 2vw, 18px);

/* ✅ Grid that respects content */
grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
```

---

## Deploy Workflow

```bash
# 1. Make your changes locally
# 2. Verify visually at localhost:3000 on key breakpoints
# 3. Run automated tests
npm run test:ui

# 4. If tests pass — build check
npm run build

# 5. Commit
git add -A
git commit -m "feat: description of change"
git push

# 6. Deploy to production
vercel --prod --yes
```

**Never deploy directly without passing step 3 (test:ui) first.**
