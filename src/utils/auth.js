const config = require('../config');
const db = require('./db');

async function isAdmin(telegramId) {
    // Check against ADMIN_ID from .env first
    if (config.ADMIN_ID && telegramId === config.ADMIN_ID) {
        return true;
    }

    // Then check user role from database
    const user = await db.getUser(telegramId);
    return user && user.role === 'admin';
}

// Middleware to check if user is admin
const adminOnly = async (ctx, next) => {
    if (await isAdmin(ctx.from.id)) {
        await next();
    } else {
        await ctx.reply('Akses ditolak. Anda bukan admin.');
    }
};

module.exports = {
    isAdmin,
    adminOnly
};
