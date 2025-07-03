const fs = require('fs').promises;
const path = require('path');
const logger = require('./logger');

const DB_PATH = path.resolve(__dirname, '../../data/database.json');

async function ensureDbFile() {
    const dataDir = path.dirname(DB_PATH);
    try {
        await fs.mkdir(dataDir, { recursive: true });
        await fs.access(DB_PATH);
    } catch (error) {
        if (error.code === 'ENOENT') {
            await fs.writeFile(DB_PATH, JSON.stringify({ users: [], global_settings: { main_menu_banner: "" } }, null, 2));
            logger.info('Created new database.json');
        } else {
            logger.error('Error ensuring database.json:', error);
            throw error;
        }
    }
}

async function readDatabase() {
    await ensureDbFile();
    try {
        const data = await fs.readFile(DB_PATH, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        logger.error('Error reading database.json:', error);
        return { users: [], global_settings: { main_menu_banner: "" } };
    }
}

async function writeDatabase(data) {
    await ensureDbFile();
    try {
        await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        logger.error('Error writing to database.json:', error);
    }
}

async function getUser(telegramId) {
    const db = await readDatabase();
    return db.users.find(u => u.id === telegramId);
}

async function addUser(user) {
    const db = await readDatabase();
    if (!db.users.some(u => u.id === user.id)) {
        db.users.push(user);
        await writeDatabase(db);
        logger.info(`User ${user.id} added.`);
        return true;
    }
    return false;
}

async function updateUser(telegramId, updates) {
    const db = await readDatabase();
    const index = db.users.findIndex(u => u.id === telegramId);
    if (index !== -1) {
        db.users[index] = { ...db.users[index], ...updates };
        await writeDatabase(db);
        logger.info(`User ${telegramId} updated.`);
        return true;
    }
    return false;
}

async function getGlobalSettings() {
    const db = await readDatabase();
    return db.global_settings || {};
}

async function updateGlobalSettings(updates) {
    const db = await readDatabase();
    db.global_settings = { ...db.global_settings, ...updates };
    await writeDatabase(db);
    logger.info('Global settings updated.');
}

module.exports = {
    readDatabase,
    writeDatabase,
    getUser,
    addUser,
    updateUser,
    getGlobalSettings,
    updateGlobalSettings
};
