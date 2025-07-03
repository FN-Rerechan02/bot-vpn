const fs = require('fs').promises; // Added fs.promises
const path = require('path'); // Added path
const config = require('../config');
const logger = require('./logger');

const MENU_DIR = path.resolve(__dirname, '../../menu'); // New: Path to menu files

async function readMenuFile(filename) {
    try {
        const filePath = path.join(MENU_DIR, filename);
        return await fs.readFile(filePath, 'utf8');
    } catch (error) {
        logger.error(`Error reading menu file ${filename}:`, error);
        return `Failed to load menu: ${filename}. Please contact admin.`;
    }
}

async function sendFormattedMessage(ctx, text, extra = {}) {
    const messageId = config.generateMessageId();
    const fullText = `${text}\n\n<pre>ID: ${messageId}</pre>`; // Add ID at the bottom
    try {
        return await ctx.telegram.sendMessage(ctx.chat.id, fullText, {
            parse_mode: 'HTML',
            ...extra
        });
    } catch (error) {
        logger.error(`Error sending message to ${ctx.chat.id}:`, error);
        // Attempt to send a plain text fallback if HTML fails
        return await ctx.telegram.sendMessage(ctx.chat.id, `Error displaying message. Please try again.\n\n${text}`, { ...extra });
    }
}

async function editFormattedMessage(ctx, messageId, text, extra = {}) {
    const generatedMessageId = config.generateMessageId();
    const fullText = `${text}\n\n<pre>ID: ${generatedMessageId}</pre>`; // Add new ID
    try {
        return await ctx.telegram.editMessageText(ctx.chat.id, messageId, null, fullText, {
            parse_mode: 'HTML',
            ...extra
        });
    } catch (error) {
        logger.error(`Error editing message ${messageId} for ${ctx.chat.id}:`, error);
        // If edit fails (e.g., message not found), send new message as fallback
        return await sendFormattedMessage(ctx, text, extra);
    }
}

async function deleteBotMessage(ctx, messageId) {
    try {
        await ctx.telegram.deleteMessage(ctx.chat.id, messageId);
    } catch (error) {
        // Ignore "message to delete not found" errors, log others
        if (error.code !== 400 || !error.description.includes("message to delete not found")) {
            logger.error(`Error deleting message ${messageId} for ${ctx.chat.id}:`, error);
        }
    }
}

async function sendNotification(text) {
    if (!config.NOTIFICATION_GROUP_ID) {
        logger.warn('NOTIFICATION_GROUP_ID is not set in .env. Cannot send notification.');
        return;
    }
    try {
        const extra = { parse_mode: 'HTML' };
        if (config.NOTIFICATION_TOPIC_ID) {
            extra.message_thread_id = config.NOTIFICATION_TOPIC_ID;
        }
        await global.bot.telegram.sendMessage(config.NOTIFICATION_GROUP_ID, text, extra);
        logger.info('Notification sent to admin group.');
    } catch (error) {
        logger.error('Failed to send notification to admin group:', error);
    }
}

module.exports = {
    readMenuFile, // Export the new function
    sendFormattedMessage,
    editFormattedMessage,
    deleteBotMessage,
    sendNotification
};
