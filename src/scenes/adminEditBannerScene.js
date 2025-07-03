const { Scenes, Markup } = require('telegraf');
const db = require('../utils/db');
const { editFormattedMessage, sendFormattedMessage } = require('../utils/telegramHelpers');
const logger = require('../utils/logger');
const menuHandler = require('../handlers/menu');
const adminCommands = require('../handlers/adminCommands'); // To go back to admin panel

const ADMIN_EDIT_BANNER_SCENE_ID = 'adminEditBannerScene';

const adminEditBannerScene = new Scenes.BaseScene(ADMIN_EDIT_BANNER_SCENE_ID);

// Enter scene handler
adminEditBannerScene.enter(async (ctx) => {
    const bannerKey = ctx.scene.state.bannerKey; // 'main', 'order_vpn', etc.
    const messageIdToEdit = ctx.scene.state.messageIdToEdit;

    const currentSettings = await db.getGlobalSettings();
    const currentBanner = currentSettings[bannerKey + '_banner'] || "No banner currently set for this menu.";

    let bannerName = '';
    switch (bannerKey) {
        case 'main': bannerName = 'Menu Utama'; break;
        case 'order_vpn': bannerName = 'Order VPN'; break;
        case 'order_autoscript': bannerName = 'Order AutoScript'; break;
        // Add more cases for other menu banners as you implement them
        default: bannerName = bannerKey; break;
    }


    const text = `<b>Edit Banner Menu ${bannerName}</b>\n\n` +
                 `Kirimkan teks banner baru untuk menu <b>${bannerName}</b>.\n` +
                 `Anda bisa menggunakan format HTML (misalnya: <b>bold</b>, <i>italic</i>, <code>code</code>, <a href="URL">link</a>).\n\n` +
                 `<b>Banner Saat Ini:</b>\n${currentBanner}\n\n` +
                 `Ketik /cancel untuk membatalkan.`;

    if (messageIdToEdit) {
        await editFormattedMessage(ctx, messageIdToEdit, text);
    } else {
        const msg = await sendFormattedMessage(ctx, text);
        ctx.scene.state.promptMessageId = msg.message_id; // Store for deletion
    }
});

// Message handler within the scene
adminEditBannerScene.on('text', async (ctx) => {
    const text = ctx.message.text;
    const bannerKey = ctx.scene.state.bannerKey;
    const messageIdToEdit = ctx.scene.state.messageIdToEdit; // The original message to edit

    if (text === '/cancel') {
        await sendFormattedMessage(ctx, 'Mengedit banner dibatalkan.');
        if (ctx.scene.state.promptMessageId) {
            await ctx.telegram.deleteMessage(ctx.chat.id, ctx.scene.state.promptMessageId).catch(err => logger.warn('Failed to delete prompt message:', err));
        }
        await ctx.scene.leave();
        await adminCommands.handleMenuBanners(ctx); // Go back to banner selection
        return;
    }

    try {
        const updates = {};
        updates[`${bannerKey}_banner`] = text; // Update the correct banner key
        await db.updateGlobalSettings(updates);

        let bannerName = '';
        switch (bannerKey) {
            case 'main': bannerName = 'Menu Utama'; break;
            case 'order_vpn': bannerName = 'Order VPN'; break;
            case 'order_autoscript': bannerName = 'Order AutoScript'; break;
            default: bannerName = bannerKey; break;
        }

        await sendFormattedMessage(ctx, `Banner menu <b>${bannerName}</b> berhasil diperbarui!`);

        if (ctx.scene.state.promptMessageId) {
            await ctx.telegram.deleteMessage(ctx.chat.id, ctx.scene.state.promptMessageId).catch(err => logger.warn('Failed to delete prompt message:', err));
        }

        await ctx.scene.leave();
        // Go back to the menu banner selection
        await adminCommands.handleMenuBanners(ctx); // Return to menu banners list
    } catch (error) {
        logger.error(`Failed to update ${bannerKey} banner:`, error);
        await sendFormattedMessage(ctx, 'Terjadi kesalahan saat memperbarui banner. Silakan coba lagi.');
        await ctx.scene.leave();
        await adminCommands.handleMenuBanners(ctx);
    }
});

adminEditBannerScene.on('message', async (ctx) => {
    await sendFormattedMessage(ctx, 'Mohon kirimkan teks untuk banner. Gunakan /cancel untuk membatalkan.');
});

module.exports = {
    adminEditBannerScene
};
