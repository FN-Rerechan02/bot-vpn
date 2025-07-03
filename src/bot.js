const { Telegraf, Scenes, session } = require('telegraf');
const config = require('./config');
const { isAdmin } = require('./utils/auth');

// Import handlers
const startHandler = require('./handlers/start');
const menuHandler = require('./handlers/menu');
const callbackQueryHandler = require('./handlers/callbackQuery');
const { adminEditBannerScene } = require('./scenes/adminEditBannerScene');
const { adminEditServerScene } = require('./scenes/adminEditServerScene'); // NEW SCENE IMPORT
const adminCommands = require('./handlers/adminCommands');

const bot = new Telegraf(process.env.BOT_TOKEN);

// --- Session and Scenes ---
const stage = new Scenes.Stage([adminEditBannerScene, adminEditServerScene]); // NEW SCENE ADDED
bot.use(session());
bot.use(stage.middleware());

// --- Global Middlewares ---
bot.use(async (ctx, next) => {
    ctx.state.user = {
        id: ctx.from.id,
        username: ctx.from.username,
        first_name: ctx.from.first_name,
        role: (await isAdmin(ctx.from.id)) ? 'admin' : 'user',
        balance: 0 // Placeholder
    };
    next();
});

// --- Command Handlers ---
bot.start(startHandler.handle);
bot.command('menu', menuHandler.handle);
bot.command('admin', adminCommands.handleAdminPanel);

// --- Callback Query Handler ---
bot.on('callback_query', callbackQueryHandler.handle);

// --- Message Handlers (e.g., text messages not part of a scene) ---
bot.on('text', async (ctx) => {
    if (!ctx.session || !ctx.session.__scenes || Object.keys(ctx.session.__scenes).length === 0) {
        if (ctx.message.text.startsWith('/')) {
            await ctx.telegram.sendMessage(ctx.chat.id, 'Perintah tidak dikenali. Ketik /menu untuk melihat opsi.', {
                parse_mode: 'HTML'
            });
        } else {
            await menuHandler.handle(ctx);
        }
    }
});

module.exports = { bot };
