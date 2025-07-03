const { Markup } = require('telegraf');
const config = require('../config');

const mainKeyboard = (userRole) => {
    const buttons = [
        [Markup.button.callback('Order VPN', `${config.CB_PREFIX.MENU}:order_vpn`)],
        [Markup.button.callback('Order AutoScript', `${config.CB_PREFIX.MENU}:order_autoscript`)],
        [Markup.button.callback('Transfer Saldo', `${config.CB_PREFIX.MENU}:transfer_saldo`)],
        [Markup.button.url('Term of Service', `https://database.rerechanstore.eu.org`)] // Example external link
    ];

    // Add admin panel button if user is admin
    if (userRole === 'admin') {
        buttons.push([Markup.button.callback('Admin Panel', `${config.CB_PREFIX.ADMIN}:panel`)]);
    }

    return Markup.inlineKeyboard(buttons);
};

module.exports = mainKeyboard;
