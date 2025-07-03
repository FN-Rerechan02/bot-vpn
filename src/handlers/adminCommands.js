const { adminOnly } = require('../utils/auth');
const adminMenuKeyboard = require('../keyboards/adminMenuKeyboard');
const { sendFormattedMessage, editFormattedMessage, readMenuFile } = require('../utils/telegramHelpers');
const db = require('../utils/db'); // To get server IDs
const serverDb = require('../utils/serverDb'); // To list all servers
const config = require('../config');
const { Markup } = require('telegraf');

// --- Admin Panel Main Display ---
async function handleAdminPanel(ctx) {
    await adminOnly(ctx, async () => {
        let adminMenuContent = await readMenuFile('admin_panel.html');
        const text = adminMenuContent.replace(/{USERNAME}/g, ctx.state.user.first_name || ctx.state.user.username);
        const keyboard = adminMenuKeyboard();

        if (ctx.callbackQuery && ctx.callbackQuery.message) {
            await editFormattedMessage(ctx, ctx.callbackQuery.message.message_id, text, { reply_markup: keyboard.reply_markup });
            await ctx.answerCbQuery();
        } else {
            await sendFormattedMessage(ctx, text, { reply_markup: keyboard.reply_markup });
        }
    });
}

// --- Admin Server Management ---
async function handleManageServers(ctx) {
    await adminOnly(ctx, async () => {
        const serverIds = await serverDb.getAllServerIds();
        let serverListText = `<b>Daftar Server Terdaftar:</b>\n\n`;
        const buttons = [];

        if (serverIds.length === 0) {
            serverListText += `<i>Belum ada server yang terdaftar.</i>\n`;
        } else {
            for (const serverId of serverIds) {
                const serverInfo = await serverDb.readServerDatabase(serverId);
                serverListText += `- <b>${serverInfo.name}</b> (${serverInfo.ip_address || 'N/A'})\n`;
                buttons.push([
                    Markup.button.callback(`⚙️ ${serverInfo.name}`, `${config.CB_PREFIX.ADMIN}:edit_server:${serverId}`)
                ]);
            }
        }

        buttons.push([Markup.button.callback('⬅️ Back to Admin Panel', `${config.CB_PREFIX.ADMIN}:panel`)]);

        const keyboard = Markup.inlineKeyboard(buttons);

        await editFormattedMessage(ctx, ctx.callbackQuery.message.message_id, serverListText, { reply_markup: keyboard.reply_markup });
        await ctx.answerCbQuery();
    });
}

// Handle trigger for editing a specific server (will enter a scene)
async function handleEditServerTrigger(ctx, serverId) {
    await adminOnly(ctx, async () => {
        await ctx.answerCbQuery(); // Acknowledge callback immediately
        await ctx.scene.enter('adminEditServerScene', { serverId: serverId, messageIdToEdit: ctx.callbackQuery.message.message_id });
    });
}

// --- Admin Menu Banner Management ---
async function handleMenuBanners(ctx) {
    await adminOnly(ctx, async () => {
        let menuBannerContent = await readMenuFile('admin_menu_banners.html');
        const keyboard = Markup.inlineKeyboard([
            [Markup.button.callback('Main Menu Banner', `${config.CB_PREFIX.ADMIN}:edit_banner:main`)],
            // Add buttons for other menu banners as they are implemented
            [Markup.button.callback('Order VPN Menu Banner', `${config.CB_PREFIX.ADMIN}:edit_banner:order_vpn`)],
            [Markup.button.callback('Order AutoScript Menu Banner', `${config.CB_PREFIX.ADMIN}:edit_banner:order_autoscript`)],
            [Markup.button.callback('⬅️ Back to Admin Panel', `${config.CB_PREFIX.ADMIN}:panel`)]
        ]);

        await editFormattedMessage(ctx, ctx.callbackQuery.message.message_id, menuBannerContent, { reply_markup: keyboard.reply_markup });
        await ctx.answerCbQuery();
    });
}

// Handle trigger for editing a specific menu banner (will enter a scene)
async function handleEditBannerTrigger(ctx, bannerKey) {
    await adminOnly(ctx, async () => {
        await ctx.answerCbQuery(); // Acknowledge callback immediately
        await ctx.scene.enter('adminEditBannerScene', { bannerKey: bannerKey, messageIdToEdit: ctx.callbackQuery.message.message_id });
    });
}


// --- Placeholder Handlers (from previous version) ---
async function handleBroadcast(ctx) { await adminOnly(ctx, async () => { await editFormattedMessage(ctx, ctx.callbackQuery.message.message_id, 'This is the broadcast feature. (Coming Soon)'); await ctx.answerCbQuery(); }); }
async function handleAddServer(ctx) { await adminOnly(ctx, async () => { await editFormattedMessage(ctx, ctx.callbackQuery.message.message_id, 'This is the Add Server feature. (Coming Soon)'); await ctx.answerCbQuery(); }); }
async function handleChangeUserRole(ctx) { await adminOnly(ctx, async () => { await editFormattedMessage(ctx, ctx.callbackQuery.message.message_id, 'This is the Change User Role feature. (Coming Soon)'); await ctx.answerCbQuery(); }); }
async function handleChangePrices(ctx) { await adminOnly(ctx, async () => { await editFormattedMessage(ctx, ctx.callbackQuery.message.message_id, 'This is the Change Prices feature. (Coming Soon)'); await ctx.answerCbQuery(); }); }
async function handleManageTopup(ctx) { await adminOnly(ctx, async () => { await editFormattedMessage(ctx, ctx.callbackQuery.message.message_id, 'This is the Manage Topup feature. (Coming Soon)'); await ctx.answerCbQuery(); }); }
async function handleChangeAdminFee(ctx) { await adminOnly(ctx, async () => { await editFormattedMessage(ctx, ctx.callbackQuery.message.message_id, 'This is the Change Admin Fee feature. (Coming Soon)'); await ctx.answerCbQuery(); }); }


module.exports = {
    handleAdminPanel,
    handleBroadcast,
    handleAddServer,
    handleManageServers, // New export
    handleEditServerTrigger, // New export
    handleChangeUserRole,
    handleChangePrices,
    handleManageTopup,
    handleChangeAdminFee,
    handleMenuBanners, // Renamed from handleEditBanner to be more generic
    handleEditBannerTrigger // New export for specific banner editing
};
