require('dotenv').config();
const { bot } = require('./src/bot');
const logger = require('./src/utils/logger');

bot.catch((err, ctx) => {
    logger.error(`Error for ${ctx.updateType}`, err);
    if (ctx.chat && ctx.chat.type === 'private') {
        ctx.reply('Maaf, terjadi kesalahan. Silakan coba lagi nanti atau hubungi admin.');
    }
});

bot.launch()
    .then(() => {
        logger.info('Bot started successfully!');
        console.log('Bot is running...');
    })
    .catch((err) => {
        logger.error('Failed to start the bot:', err);
        process.exit(1);
    });

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
