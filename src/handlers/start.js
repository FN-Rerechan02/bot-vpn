const db = require('../utils/db');
const { sendFormattedMessage } = require('../utils/telegramHelpers');
const menuHandler = require('./menu'); // Import menu handler to redirect

async function handleStart(ctx) {
    const userId = ctx.from.id;
    const username = ctx.from.username;
    const firstName = ctx.from.first_name;

    let user = await db.getUser(userId);

    if (!user) {
        // New user
        user = {
            id: userId,
            username: username || '',
            first_name: firstName || '',
            role: 'user', // Default role
            balance: 0,
            vpn_accounts: [],
            autoscripts: []
        };
        await db.addUser(user);
        await sendFormattedMessage(ctx, `Halo <b>${firstName || username}</b>, selamat datang di bot kami!`);
    } else {
        // Existing user, just update username/firstname if changed
        const updated = await db.updateUser(userId, { username: username || '', first_name: firstName || '' });
        if (updated) {
            // Can add a log here if needed
        }
        await sendFormattedMessage(ctx, `Halo kembali, <b>${firstName || username}</b>!`);
    }

    // Always redirect to the main menu after /start
    await menuHandler.handle(ctx);
}

module.exports = { handleStart };
