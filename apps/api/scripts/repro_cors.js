// Rreproduction script to verify CORS logic fix
const rawAllowedOrigins = "glotrade-ecom-web.vercel.app"; // Simulating user's env var
const requestOrigin = "https://glotrade-ecom-web.vercel.app";

console.log("--- Current Logic ---");
const allowedOriginsCurrent = rawAllowedOrigins
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

console.log("Allowed Origins:", allowedOriginsCurrent);
const isAllowedCurrent = allowedOriginsCurrent.includes(requestOrigin);
console.log(`Is '${requestOrigin}' allowed?`, isAllowedCurrent);

console.log("\n--- New Logic ---");
const allowedOriginsNew = rawAllowedOrigins
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean)
    .flatMap(o => {
        if (o.startsWith("http")) return [o];
        return [`https://${o}`, `http://${o}`];
    });

console.log("Allowed Origins:", allowedOriginsNew);
const isAllowedNew = allowedOriginsNew.includes(requestOrigin);
console.log(`Is '${requestOrigin}' allowed?`, isAllowedNew);
