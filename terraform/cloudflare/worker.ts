/**
 * Edge Worker: Privacy & Geo-Context Header Injection
 *
 * This Cloudflare Worker provides Next.js with the user's geographical location
 * for Algolia/Pinecone personalization, without exposing raw IPs unnecessarily,
 * and strips potentially sensitive PII query parameters before hitting the origin.
 */

// @ts-nocheck
// This file uses Cloudflare Worker runtime types (ExecutionContext, request.cf) which are
// not part of the standard TypeScript lib. Deploy via `wrangler deploy` or paste into
// the Cloudflare Workers dashboard. It is excluded from the Next.js typecheck.
export default {
    async fetch(request: Request, env: any, ctx: ExecutionContext) {
        const url = new URL(request.url);

        // 1. Privacy: Strip accidental PII from query strings before hitting origin
        // Prevents emails/names from leaking into Vercel/Node analytics logs
        const sensitiveKeys = ['email', 'phone', 'name', 'address'];
        let modified = false;
        sensitiveKeys.forEach(key => {
            if (url.searchParams.has(key)) {
                url.searchParams.delete(key);
                modified = true;
            }
        });

        // 2. Clone request to modify headers safely
        const newRequest = new Request(modified ? url.toString() : request, request);

        // 3. Forward verified Country and City to Next.js for Algolia/Pinecone personalization
        // This allows backend services to personalize content securely
        const country = request.cf?.country || 'XX';
        const city = request.cf?.city || 'Unknown';

        newRequest.headers.set('x-ks-country', country as string);
        newRequest.headers.set('x-ks-city', city as string);

        // 4. (Optional) Strip the raw CF-Connecting-IP header entirely
        // Uncomment this if strict internal privacy policy requires IP minimization at the edge
        // newRequest.headers.delete('CF-Connecting-IP'); 

        return fetch(newRequest);
    }
};
