const mainKeyboard = require('../keyboards/mainKeyboard');
const { sendFormattedMessage, editFormattedMessage, readMenuFile } = require('../utils/telegramHelpers'); // Added readMenuFile
const db = require('../utils/db');
const logger = require('../utils/logger');

async function handleMenu(ctx) {
    const user = ctx.state.user; // User object from bot.js middleware
    if (!user) {
        logger.error('User not found in ctx.state.user for menu handler.');
        await sendFormattedMessage(ctx, 'Maaf, data pengguna tidak ditemukan. Silakan coba /start lagi.');
        return;
    }

    // Read the base menu content from the HTML file
    let menuContent = await readMenuFile('main.html');

    // Get the dynamic banner from database.json
    const globalSettings = await db.getGlobalSettings();
    const banner = globalSettings.main_menu_banner || "<b>Welcome to VPN Panel!</b>\n\nThis is a default banner. Please set your custom banner from the admin panel.";


    // Replace placeholders in the HTML content
    const fullText = menuContent
        .replace(/{USERNAME}/g, user.first_name || user.username)
        .replace(/{TELEGRAM_ID}/g, user.id)
        .replace(/{ROLE}/g, user.role.toUpperCase())
        .replace(/{BALANCE}/g, user.balance.toLocaleString('id-ID'))
        .replace(/{MENU_BANNER}/g, banner); // Insert the dynamic banner


    const keyboard = mainKeyboard(user.role);

    // If it's a callback query, try to edit the message. Otherwise, send a new one.
    if (ctx.callbackQuery && ctx.callbackQuery.message) {
        await editFormattedMessage(ctx, ctx.callbackQuery.message.message_id, fullText, { reply_markup: keyboard.reply_markup });
        await ctx.answerCbQuery(); // Acknowledge the callback query
    } else {
        await sendFormattedMessage(ctx, fullText, { reply_markup: keyboard.reply_markup });
    }
}

module.exports = { handleMenu };
