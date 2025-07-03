const { Scenes, Markup } = require('telegraf');
const db = require('../utils/db');
const { editFormattedMessage, sendFormattedMessage } = require('../utils/telegramHelpers');
const logger = require('../utils/logger');
const menuHandler = require('../handlers/menu'); // To refresh main menu after editing

const ADMIN_EDIT_BANNER_SCENE_ID = 'adminEditBannerScene';

const adminEditBannerScene = new Scenes.BaseScene(ADMIN_EDIT_BANNER_SCENE_ID);

// Enter scene handler
adminEditBannerScene.enter(async (ctx) => {
    const currentSettings = await db.getGlobalSettings();
    const currentBanner = currentSettings.main_menu_banner || "No banner currently set.";

    const msg = await sendFormattedMessage(ctx,
        `<b>Edit Main Menu Banner</b>\n\n` +
        `Kirimkan teks banner baru untuk menu utama.\n` +
        `Anda bisa menggunakan format HTML (misalnya: <b>bold</b>, <i>italic</i>, <code>code</code>, <a href="URL">link</a>).\n\n` +
        `<b>Banner Saat Ini:</b>\n${currentBanner}\n\n` +
        `Ketik /cancel untuk membatalkan.`
    );
    // Store the message ID sent by the bot so we can delete/edit it later
    ctx.scene.state.promptMessageId = msg.message_id;
});

// Message handler within the scene
adminEditBannerScene.on('text', async (ctx) => {
    const text = ctx.message.text;

    if (text === '/cancel') {
        await sendFormattedMessage(ctx, 'Mengedit banner dibatalkan.');
        if (ctx.scene.state.promptMessageId) {
            await ctx.telegram.deleteMessage(ctx.chat.id, ctx.scene.state.promptMessageId).catch(err => logger.warn('Failed to delete prompt message:', err));
        }
        await ctx.scene.leave();
        await menuHandler.handle(ctx); // Return to main menu
        return;
    }

    try {
        await db.updateGlobalSettings({ main_menu_banner: text });
        await sendFormattedMessage(ctx, 'Banner menu utama berhasil diperbarui!');

        // Attempt to delete the prompt message if stored
        if (ctx.scene.state.promptMessageId) {
            await ctx.telegram.deleteMessage(ctx.chat.id, ctx.scene.state.promptMessageId).catch(err => logger.warn('Failed to delete prompt message:', err));
        }

        // Leave the scene and return to main menu
        await ctx.scene.leave();
        await menuHandler.handle(ctx); // Refresh the main menu to show the new banner
    } catch (error) {
        logger.error('Failed to update main menu banner:', error);
        await sendFormattedMessage(ctx, 'Terjadi kesalahan saat memperbarui banner. Silakan coba lagi.');
        await ctx.scene.leave(); // Exit scene on error
        await menuHandler.handle(ctx);
    }
});

// Handle other types of messages (e.g., photos, stickers) by prompting text again
adminEditBannerScene.on('message', async (ctx) => {
    await sendFormattedMessage(ctx, 'Mohon kirimkan teks untuk banner. Gunakan /cancel untuk membatalkan.');
});

module.exports = {
    adminEditBannerScene
};
