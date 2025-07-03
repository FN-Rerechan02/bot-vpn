const { Scenes, Markup } = require('telegraf');
const serverDb = require('../utils/serverDb');
const { editFormattedMessage, sendFormattedMessage } = require('../utils/telegramHelpers');
const logger = require('../utils/logger');
const adminCommands = require('../handlers/adminCommands'); // To return to admin flow

const ADMIN_EDIT_SERVER_SCENE_ID = 'adminEditServerScene';

const adminEditServerScene = new Scenes.BaseScene(ADMIN_EDIT_SERVER_SCENE_ID);

adminEditServerScene.enter(async (ctx) => {
    const serverId = ctx.scene.state.serverId;
    const messageIdToEdit = ctx.scene.state.messageIdToEdit;
    
    if (!serverId) {
        await sendFormattedMessage(ctx, 'ID Server tidak ditemukan. Kembali ke panel admin.');
        return ctx.scene.leave();
    }

    const server = await serverDb.readServerDatabase(serverId);
    if (!server) {
        await sendFormattedMessage(ctx, 'Server tidak ditemukan. Kembali ke panel admin.');
        return ctx.scene.leave();
    }

    ctx.scene.state.server = server; // Store server object in session state
    ctx.scene.state.currentStep = 'display_info';

    await displayServerInfo(ctx, messageIdToEdit);
});

// Helper function to display server info and editing options
async function displayServerInfo(ctx, messageId = null) {
    const server = ctx.scene.state.server;
    const protocolsList = server.protocols_available.map(p => `<code>${p.toUpperCase()}</code>`).join(', ');

    const text = `<b>⚙️ Detail Server: ${server.name}</b>\n\n` +
                 `ID: <code>${server.id}</code>\n` +
                 `Lokasi: ${server.location}\n` +
                 `IP Address: <code>${server.ip_address}</code>\n` +
                 `SSH Port: <code>${server.ssh_port}</code>\n` +
                 `SSH User: <code>${server.ssh_username}</code>\n` +
                 `Kapasitas: ${server.accounts_created}/${server.capacity}\n` +
                 `Limit Device Default: ${server.default_device_limit}\n` +
                 `Protokol Aktif: ${protocolsList || '<i>Tidak ada</i>'}\n\n` +
                 `Pilih properti yang ingin diedit atau kembali.`;

    const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('Edit Nama', `edit_prop:name`), Markup.button.callback('Edit IP/Port SSH', `edit_prop:ip_ssh`)],
        [Markup.button.callback('Edit Kapasitas', `edit_prop:capacity`), Markup.button.callback('Edit Limit Device Default', `edit_prop:default_device_limit`)],
        [Markup.button.callback('Kelola Protokol', `edit_prop:protocols_available`)],
        // [Markup.button.callback('Edit Password SSH', `edit_prop:ssh_password`)], // Be very careful with this!
        [Markup.button.callback('⬅️ Kembali ke Daftar Server', `exit_server_edit`)]
    ]);

    if (messageId) {
        await editFormattedMessage(ctx, messageId, text, { reply_markup: keyboard.reply_markup });
    } else {
        const msg = await sendFormattedMessage(ctx, text, { reply_markup: keyboard.reply_markup });
        ctx.scene.state.lastMenuMessageId = msg.message_id; // Store to edit later
    }
    ctx.answerCbQuery();
}

// Callback query handler within the scene
adminEditServerScene.action(/^edit_prop:(\w+)$/, async (ctx) => {
    const prop = ctx.match[1];
    ctx.scene.state.propToEdit = prop;
    ctx.scene.state.currentStep = 'await_input';

    const server = ctx.scene.state.server;
    let promptText = '';
    let currentVal = '';

    switch (prop) {
        case 'name':
            promptText = 'Kirimkan nama baru untuk server ini.';
            currentVal = server.name;
            break;
        case 'ip_ssh':
            promptText = 'Kirimkan IP Address baru dan Port SSH (contoh: <code>1.2.3.4:22</code>).';
            currentVal = `${server.ip_address}:${server.ssh_port}`;
            break;
        case 'capacity':
            promptText = 'Kirimkan kapasitas total baru (jumlah akun) untuk server ini (hanya angka).';
            currentVal = server.capacity;
            break;
        case 'default_device_limit':
            promptText = 'Kirimkan limit perangkat default baru (jumlah IP) untuk akun di server ini (hanya angka).';
            currentVal = server.default_device_limit;
            break;
        case 'protocols_available':
            promptText = 'Kirimkan daftar protokol yang tersedia, pisahkan dengan koma (contoh: <code>ssh,vmess,vless</code>).';
            currentVal = server.protocols_available.join(',');
            break;
        case 'ssh_password': // If you decide to implement this later
            promptText = 'Kirimkan password SSH baru (HATI-HATI! Ini sangat sensitif!).';
            currentVal = '******';
            break;
        default:
            await sendFormattedMessage(ctx, 'Properti tidak dikenal. Silakan coba lagi.');
            return displayServerInfo(ctx, ctx.callbackQuery.message.message_id);
    }

    await editFormattedMessage(ctx, ctx.callbackQuery.message.message_id,
        `<b>Edit Properti: ${prop}</b>\n\n` +
        `Nilai saat ini: <code>${currentVal}</code>\n` +
        `${promptText}\n\n` +
        `Ketik /cancel untuk membatalkan.`
    );
    ctx.answerCbQuery();
});

adminEditServerScene.action('exit_server_edit', async (ctx) => {
    await sendFormattedMessage(ctx, 'Keluar dari mode edit server.');
    await ctx.answerCbQuery();
    await ctx.scene.leave();
    await adminCommands.handleManageServers(ctx); // Go back to server list
});

// Text message handler within the scene (for input)
adminEditServerScene.on('text', async (ctx) => {
    if (ctx.message.text === '/cancel') {
        await sendFormattedMessage(ctx, 'Pembatalan edit properti server.');
        await ctx.scene.leave();
        await adminCommands.handleManageServers(ctx); // Go back to server list
        return;
    }

    if (ctx.scene.state.currentStep !== 'await_input') {
        return sendFormattedMessage(ctx, 'Silakan pilih properti yang ingin diedit terlebih dahulu.');
    }

    const prop = ctx.scene.state.propToEdit;
    const newValue = ctx.message.text;
    const server = ctx.scene.state.server; // Get the latest server state

    try {
        let updatedValue;
        switch (prop) {
            case 'name':
                updatedValue = newValue;
                break;
            case 'ip_ssh':
                const parts = newValue.split(':');
                if (parts.length !== 2 || isNaN(parseInt(parts[1]))) {
                    await sendFormattedMessage(ctx, 'Format IP/Port SSH salah. Harap gunakan format <code>IP:Port</code> (contoh: <code>1.2.3.4:22</code>).');
                    return;
                }
                server.ip_address = parts[0];
                server.ssh_port = parseInt(parts[1]);
                break;
            case 'capacity':
            case 'default_device_limit':
                updatedValue = parseInt(newValue);
                if (isNaN(updatedValue) || updatedValue < 0) {
                    await sendFormattedMessage(ctx, 'Input harus angka positif.');
                    return;
                }
                break;
            case 'protocols_available':
                updatedValue = newValue.split(',').map(p => p.trim().toLowerCase()).filter(p => p !== '');
                break;
            case 'ssh_password': // If implemented
                updatedValue = newValue;
                break;
            default:
                await sendFormattedMessage(ctx, 'Properti tidak dikenal untuk diupdate.');
                return;
        }

        if (prop !== 'ip_ssh') { // Update property normally if not 'ip_ssh'
            server[prop] = updatedValue;
        }
        
        await serverDb.writeServerDatabase(server.id, server); // Save updated server to its file

        await sendFormattedMessage(ctx, `Properti <b>${prop}</b> berhasil diperbarui menjadi <code>${newValue}</code>.`);
        
        // Return to display info with updated data
        ctx.scene.state.currentStep = 'display_info';
        await displayServerInfo(ctx, ctx.message.message_id); // Edit the last message
    } catch (error) {
        logger.error(`Error updating server property ${prop} for ${server.id}:`, error);
        await sendFormattedMessage(ctx, 'Terjadi kesalahan saat menyimpan perubahan. Silakan coba lagi.');
        ctx.scene.state.currentStep = 'display_info'; // Reset step
        await displayServerInfo(ctx, ctx.message.message_id);
    }
});

adminEditServerScene.on('message', async (ctx) => {
    if (ctx.scene.state.currentStep === 'await_input') {
        await sendFormattedMessage(ctx, 'Mohon kirimkan teks/angka yang sesuai dengan properti yang diedit. Gunakan /cancel untuk membatalkan.');
    } else {
        // If not in input step, ignore other messages or redirect to menu
        await sendFormattedMessage(ctx, 'Perintah tidak dikenali di sini. Silakan gunakan tombol.');
    }
});

module.exports = {
    adminEditServerScene
};
