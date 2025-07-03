const config = require('../config');
const menuHandler = require('./menu');
const adminCommands = require('./adminCommands');
const logger = require('../utils/logger');
const { editFormattedMessage, readMenuFile } = require('../utils/telegramHelpers'); // Added readMenuFile

async function handle(ctx) {
    const callbackData = ctx.callbackQuery.data;
    logger.debug(`Callback Query Received: ${callbackData}`);

    if (callbackData.startsWith(`${config.CB_PREFIX.MENU}:`)) {
        const action = callbackData.split(':')[1];
        switch (action) {
            case 'main':
                await menuHandler.handle(ctx); // Back to main menu
                break;
            case 'order_vpn':
                await ctx.answerCbQuery('Order VPN...');
                const vpnMenuContent = await readMenuFile('order_vpn.html');
                await editFormattedMessage(ctx, ctx.callbackQuery.message.message_id, vpnMenuContent); // Placeholder
                break;
            case 'order_autoscript':
                await ctx.answerCbQuery('Order AutoScript (Coming Soon!)');
                await editFormattedMessage(ctx, ctx.callbackQuery.message.message_id, 'Fitur Order AutoScript akan segera hadir!'); // Placeholder
                break;
            case 'transfer_saldo':
                await ctx.answerCbQuery('Transfer Saldo (Coming Soon!)');
                await editFormattedMessage(ctx, ctx.callbackQuery.message.message_id, 'Fitur Transfer Saldo akan segera hadir!'); // Placeholder
                break;
            case 'tos': // For external URL, Telegraf handles this automatically if it's Markup.url
                await ctx.answerCbQuery('Membuka Syarat & Ketentuan...');
                break;
            default:
                await ctx.answerCbQuery('Aksi tidak dikenali!');
                await editFormattedMessage(ctx, ctx.callbackQuery.message.message_id, 'Aksi menu tidak dikenali.');
                break;
        }
    } else if (callbackData.startsWith(`${config.CB_PREFIX.ADMIN}:`)) {
        const action = callbackData.split(':')[1];
        switch (action) {
            case 'panel':
                await adminCommands.handleAdminPanel(ctx); // Re-display admin panel
                break;
            case 'broadcast':
                await adminCommands.handleBroadcast(ctx);
                break;
            case 'add_server':
                await adminCommands.handleAddServer(ctx);
                break;
            case 'manage_servers':
                await adminCommands.handleManageServers(ctx);
                break;
            case 'change_role':
                await adminCommands.handleChangeUserRole(ctx);
                break;
            case 'change_prices':
                await adminCommands.handleChangePrices(ctx);
                break;
            case 'manage_topup':
                await adminCommands.handleManageTopup(ctx);
                break;
            case 'change_admin_fee':
                await adminCommands.handleChangeAdminFee(ctx);
                break;
            case 'edit_banner':
                await adminCommands.handleEditBanner(ctx); // Trigger scene
                break;
            default:
                await ctx.answerCbQuery('Aksi admin tidak dikenali!');
                await editFormattedMessage(ctx, ctx.callbackQuery.message.message_id, 'Aksi admin tidak dikenali.');
                break;
        }
    } else {
        // Handle other general callbacks or log unknown ones
        logger.warn(`Unknown callback data received: ${callbackData}`);
        await ctx.answerCbQuery('Aksi tidak dikenali.');
    }
}

module.exports = { handle };
