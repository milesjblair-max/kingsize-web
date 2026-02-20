# Services (Microservices Backend)

This directory simulates the **Microservices Backend** of the Zalando model.

## Concept
In a real Zalando architecture, these would be separate API services (e.g., a Catalogue Service, a Pricing Service, a CMS Service) running on different servers. Here, we simulate them as TypeScript modules that "fetch" data.

## Rules
1. **Data Ownership**: The frontend components (in `src/features`) should not hardcode data. They should call these services to get it.
2. **Backend-Steered UI**: The `cms.ts` service will determine *what* to show on the page. If the backend says "Show Hero Banner A", the frontend renders it. This allows experimentation without redeploying the frontend.

## Files
- `api.ts`: A shared utility for making requests (simulated).
- `catalogue.ts`: Fetches product details, prices, and stock.
- `cms.ts`: Fetches the layout configuration for the homepage.
