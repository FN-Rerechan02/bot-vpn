const pino = require('pino');

const logger = pino({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    transport: {
        target: 'pino-pretty',
        options: {
            colorize: true,
            translateTime: 'SYS:HH:MM:ss Z',
            ignore: 'pid,hostname'
        }
    }
});

module.exports = logger;
