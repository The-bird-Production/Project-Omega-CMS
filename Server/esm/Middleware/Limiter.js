import { rateLimit } from "express-rate-limit";
const rateLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 15 minutes
    max: 100, // Limite à 100 requêtes par fenêtre de temps
    message: {
        success: false,
        error: "Trop de requêtes. Veuillez réessayer plus tard.",
    },
    headers: true, // Inclure les headers RateLimit
    keyGenerator: (req) => req.ip, // Utilisation de l'IP comme clé
    handler: (req, res, next) => {
        console.warn(`Rate limit dépassé pour ${req.ip}`);
        res.status(429).json({
            success: false,
            error: "Trop de requêtes. Réessayez plus tard.",
        });
    },
});
export default rateLimiter;
