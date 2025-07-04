const { Markup } = require('telegraf');
const config = require('../config');

const adminMenuKeyboard = () => {
    return Markup.inlineKeyboard([
        [Markup.button.callback('Broadcast Message', `${config.CB_PREFIX.ADMIN}:broadcast`)],
        [Markup.button.callback('Add Server', `${config.CB_PREFIX.ADMIN}:add_server`)],
        [Markup.button.callback('Manage Servers', `${config.CB_PREFIX.ADMIN}:manage_servers`)], // Existing, now goes to server list
        [Markup.button.callback('Change User Role', `${config.CB_PREFIX.ADMIN}:change_role`)],
        [Markup.button.callback('Change Prices', `${config.CB_PREFIX.ADMIN}:change_prices`)],
        [Markup.button.callback('Manage Topup', `${config.CB_PREFIX.ADMIN}:manage_topup`)],
        [Markup.button.callback('Change Admin Fee', `${config.CB_PREFIX.ADMIN}:change_admin_fee`)],
        [Markup.button.callback('Edit Menu Banners', `${config.CB_PREFIX.ADMIN}:edit_banner_select`)], // Changed callback
        [Markup.button.callback('⬅️ Back to Main Menu', `${config.CB_PREFIX.MENU}:main`)]
    ]);
};

module.exports = adminMenuKeyboard;
