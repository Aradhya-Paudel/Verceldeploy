const winston = require('winston');
const path = require('path');

// Ensure log level is set
const level = process.env.LOG_LEVEL || 'info';

// Define log format
const format = winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
);

// Create logger instance
const logger = winston.createLogger({
    level,
    format,
    defaultMeta: { service: 'hospital-backend' },
    transports: [
        // - Write all logs with importance level of `error` or less to `error.log`
        new winston.transports.File({ filename: path.join(__dirname, '../logs/error.log'), level: 'error' }),
        // - Write all logs with importance level of `info` or less to `combined.log`
        new winston.transports.File({ filename: path.join(__dirname, '../logs/combined.log') }),
    ],
});

// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple(),
    }));
}

module.exports = logger;
