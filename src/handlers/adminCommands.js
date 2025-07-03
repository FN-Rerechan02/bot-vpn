const { adminOnly } = require('../utils/auth');
const adminMenuKeyboard = require('../keyboards/adminMenuKeyboard');
const { sendFormattedMessage, editFormattedMessage, readMenuFile } = require('../utils/telegramHelpers'); // Added readMenuFile
const config = require('../config');

// Display the admin panel
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

// Handler for broadcast (placeholder)
async function handleBroadcast(ctx) {
    await adminOnly(ctx, async () => {
        await editFormattedMessage(ctx, ctx.callbackQuery.message.message_id, 'This is the broadcast feature. (Coming Soon)');
        await ctx.answerCbQuery();
    });
}

// Handler for Add Server (placeholder)
async function handleAddServer(ctx) {
    await adminOnly(ctx, async () => {
        await editFormattedMessage(ctx, ctx.callbackQuery.message.message_id, 'This is the Add Server feature. (Coming Soon)');
        await ctx.answerCbQuery();
    });
}

// Handler for Manage Servers (placeholder)
async function handleManageServers(ctx) {
    await adminOnly(ctx, async () => {
        await editFormattedMessage(ctx, ctx.callbackQuery.message.message_id, 'This is the Manage Servers feature. (Coming Soon)');
        await ctx.answerCbQuery();
    });
}

// Handler for Change User Role (placeholder)
async function handleChangeUserRole(ctx) {
    await adminOnly(ctx, async () => {
        await editFormattedMessage(ctx, ctx.callbackQuery.message.message_id, 'This is the Change User Role feature. (Coming Soon)');
        await ctx.answerCbQuery();
    });
}

// Handler for Change Prices (placeholder)
async function handleChangePrices(ctx) {
    await adminOnly(ctx, async () => {
        await editFormattedMessage(ctx, ctx.callbackQuery.message.message_id, 'This is the Change Prices feature. (Coming Soon)');
        await ctx.answerCbQuery();
    });
}

// Handler for Manage Topup (placeholder)
async function handleManageTopup(ctx) {
    await adminOnly(ctx, async () => {
        await editFormattedMessage(ctx, ctx.callbackQuery.message.message_id, 'This is the Manage Topup feature. (Coming Soon)');
        await ctx.answerCbQuery();
    });
}

// Handler for Change Admin Fee (placeholder)
async function handleChangeAdminFee(ctx) {
    await adminOnly(ctx, async () => {
        await editFormattedMessage(ctx, ctx.callbackQuery.message.message_id, 'This is the Change Admin Fee feature. (Coming Soon)');
        await ctx.answerCbQuery();
    });
}

// Handler to enter the scene for editing banner
async function handleEditBanner(ctx) {
    await adminOnly(ctx, async () => {
        await ctx.answerCbQuery(); // Acknowledge callback immediately
        await ctx.scene.enter('adminEditBannerScene', { messageIdToEdit: ctx.callbackQuery.message.message_id });
    });
}


module.exports = {
    handleAdminPanel,
    handleBroadcast,
    handleAddServer,
    handleManageServers,
    handleChangeUserRole,
    handleChangePrices,
    handleManageTopup,
    handleChangeAdminFee,
    handleEditBanner
};
