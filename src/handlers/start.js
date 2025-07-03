const db = require('../utils/db');
const { sendFormattedMessage } = require('../utils/telegramHelpers');
const menuHandler = require('./menu'); // Import menu handler to redirect
const logger = require('../utils/logger'); // Import logger

async function handleStart(ctx) {
    const userId = ctx.from.id;
    const username = ctx.from.username;
    const firstName = ctx.from.first_name;

    let user = await db.getUser(userId);

    if (!user) {
        // User not found: Register new user
        user = {
            id: userId,
            username: username || '',
            first_name: firstName || '',
            role: 'user', // Default role for new users
            balance: 0,
            vpn_accounts: [],
            autoscripts: []
        };
        const added = await db.addUser(user);
        if (added) {
            logger.info(`New user registered: ${userId} (${firstName || username})`);
            await sendFormattedMessage(ctx, `Halo <b>${firstName || username}</b>, selamat datang di bot kami!`);
        } else {
            // Should theoretically not happen if getUser() returned null, but as a safeguard
            logger.error(`Failed to add new user ${userId} despite not finding them.`);
            await sendFormattedMessage(ctx, 'Maaf, terjadi masalah saat pendaftaran Anda. Silakan coba lagi.');
            return;
        }
    } else {
        // User already exists: Just update their info and log
        await db.updateUser(userId, { username: username || '', first_name: firstName || '' });
        logger.info(`Existing user logged in: ${userId} (${firstName || username})`);
    }

    // Always redirect to the main menu after /start
    await menuHandler.handle(ctx);
}

module.exports = { handleStart };
