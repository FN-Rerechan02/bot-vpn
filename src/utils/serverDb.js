const fs = require('fs').promises;
const path = require('path');
const logger = require('./logger');

const SERVERS_DIR = path.resolve(__dirname, '../../data/servers');

async function ensureServerDbFile(serverId) {
    try {
        await fs.mkdir(SERVERS_DIR, { recursive: true });
        const filePath = path.join(SERVERS_DIR, `${serverId}.json`);
        await fs.access(filePath);
    } catch (error) {
        if (error.code === 'ENOENT') {
            await fs.writeFile(path.join(SERVERS_DIR, `${serverId}.json`), JSON.stringify({
                id: serverId,
                name: `Server ${serverId}`,
                location: "Unknown",
                ip_address: "",
                ssh_port: 22,
                ssh_username: "root",
                ssh_password: "", // In production, use SSH keys or a secure vault!
                capacity: 100,
                accounts_created: 0,
                default_device_limit: 2,
                daily_price_multiplier: 1, // Adjust price for this specific server
                protocols_available: ["ssh", "openvpn"],
                script_paths: {
                    "add_ssh": "/etc/funny/script/add-ssh",
                    "extend_ssh": "/etc/funny/script/extend-ssh",
                    "delete_ssh": "/etc/funny/script/delete-ssh"
                }
            }, null, 2));
            logger.info(`Created new server database for ${serverId}`);
        } else {
            logger.error(`Error ensuring server DB for ${serverId}:`, error);
            throw error;
        }
    }
}

async function readServerDatabase(serverId) {
    await ensureServerDbFile(serverId);
    try {
        const data = await fs.readFile(path.join(SERVERS_DIR, `${serverId}.json`), 'utf8');
        return JSON.parse(data);
    } catch (error) {
        logger.error(`Error reading server DB for ${serverId}:`, error);
        return null; // Or throw error, depending on desired behavior
    }
}

async function writeServerDatabase(serverId, data) {
    await ensureServerDbFile(serverId);
    try {
        await fs.writeFile(path.join(SERVERS_DIR, `${serverId}.json`), JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        logger.error(`Error writing to server DB for ${serverId}:`, error);
    }
}

// NEW FUNCTION
async function getAllServerIds() {
    try {
        await fs.mkdir(SERVERS_DIR, { recursive: true }); // Ensure directory exists
        const files = await fs.readdir(SERVERS_DIR);
        return files
            .filter(file => file.endsWith('.json'))
            .map(file => file.replace('.json', ''));
    } catch (error) {
        logger.error('Error getting all server IDs:', error);
        return [];
    }
}


module.exports = {
    readServerDatabase,
    writeServerDatabase,
    getAllServerIds // Export new function
};
