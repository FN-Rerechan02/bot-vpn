const { Telegraf, Scenes, session } = require('telegraf');
const config = require('./config');
const { isAdmin } = require('./utils/auth');

const startHandler = require('./handlers/start');
const menuHandler = require('./handlers/menu');
const callbackQueryHandler = require('./handlers/callbackQuery');
const { adminEditBannerScene } = require('./scenes/adminEditBannerScene');
const adminCommands = require('./handlers/adminCommands'); // For commands, not scenes

const bot = new Telegraf(process.env.BOT_TOKEN);

const stage = new Scenes.Stage([adminEditBannerScene]);
bot.use(session());
bot.use(stage.middleware());


bot.use(async (ctx, next) => {
    // Implement fetching user from DB and attaching to ctx.state.user
    // For now, let's mock it or fetch basic info
    ctx.state.user = {
        id: ctx.from.id,
        username: ctx.from.username,
        first_name: ctx.from.first_name,
        role: (await isAdmin(ctx.from.id)) ? 'admin' : 'user', // Basic role check
        balance: 0 // Placeholder
    };
    next();
});

bot.start(startHandler.handle);
bot.command('menu', menuHandler.handle);
bot.command('admin', adminCommands.handleAdminPanel); // Direct command for admin panel

bot.on('callback_query', callbackQueryHandler.handle);

bot.on('text', async (ctx) => {
    // If not in a scene, and not a command, just reply with default message or menu
    if (!ctx.session || !ctx.session.__scenes || Object.keys(ctx.session.__scenes).length === 0) {
        if (ctx.message.text.startsWith('/')) {
            // It's an unrecognized command
            await ctx.telegram.sendMessage(ctx.chat.id, 'Perintah tidak dikenali. Ketik /menu untuk melihat opsi.', {
                parse_mode: 'HTML'
            });
        } else {
            // Regular text message
            await menuHandler.handle(ctx); // Show main menu by default
        }
    }
});


module.exports = { bot };
