const rateLimit = require('express-rate-limit');

const locationApiLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 100, // Limit each IP to 100 requests per `window` (here, per hour)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: {
        error: "Too many requests, please try again later",
        code: "RATE_LIMIT_EXCEEDED"
    }
});

module.exports = locationApiLimiter;
