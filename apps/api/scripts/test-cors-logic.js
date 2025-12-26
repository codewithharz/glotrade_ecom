
const testOrigins = [
    "https://glotrade.online",
    "https://www.glotrade.online",
    "http://localhost:3000",
    "http://localhost:8080"
];

const rawAllowedOrigins = "https://glotrade.online,http://localhost:3000";

const allowedOrigins = rawAllowedOrigins
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean)
    .flatMap((o) => {
        // If it's a localhost entry, ensure it works with http (and https if needed)
        if (o.includes("localhost")) {
            if (o.startsWith("http")) return [o];
            return [`http://${o}`, `https://${o}`]; // Allow both for localhost dev setups
        }

        // For non-localhost, handle www and protocol
        let domain = o;
        let protocol = "https"; // Default to https

        if (o.startsWith("http://")) {
            protocol = "http";
            domain = o.slice(7);
        } else if (o.startsWith("https://")) {
            protocol = "https";
            domain = o.slice(8);
        }

        // Normalize: remove trailing slash if present
        if (domain.endsWith("/")) domain = domain.slice(0, -1);

        const isWww = domain.startsWith("www.");
        const baseDomain = isWww ? domain.slice(4) : domain;

        // Return both www and non-www variants
        return [
            `${protocol}://${baseDomain}`,
            `${protocol}://www.${baseDomain}`
        ];
    });

console.log("Allowed Origins:", allowedOrigins);

testOrigins.forEach(origin => {
    let allowed = false;
    if (allowedOrigins.includes(origin)) allowed = true;
    else {
        // Check for trailing slash mismatch
        const originNoSlash = origin.endsWith('/') ? origin.slice(0, -1) : origin;
        if (allowedOrigins.includes(originNoSlash)) allowed = true;
    }

    console.log(`Origin: ${origin} -> ${allowed ? 'ALLOWED' : 'BLOCKED'}`);
});
