module.exports = {
    // Telegram IDs
    ADMIN_ID: process.env.ADMIN_ID ? parseInt(process.env.ADMIN_ID) : null,
    NOTIFICATION_GROUP_ID: process.env.NOTIFICATION_GROUP_ID || null,
    NOTIFICATION_TOPIC_ID: process.env.NOTIFICATION_TOPIC_ID || null, // Optional for topics

    DEFAULT_WELCOME_MESSAGE: "Selamat datang di bot kami! Ketik /menu untuk memulai.",
    LOADING_MESSAGE: "Sedang memproses...",

    DEFAULT_VPN_PRICES: {
        "ssh": { "daily": 5000 },
        "openvpn": { "daily": 7500 },
        "vmess": { "daily": 8000 },
        "vless": { "daily": 8500 },
        "trojan": { "daily": 9000 },
        "shadowsocks": { "daily": 6000 },
        "wireguard": { "daily": 10000 },
        "warp_wireguard": { "daily": 7000 },
        "udp_zivpn": { "daily": 5500 }
    },
    DEFAULT_DEVICE_LIMIT: 2,


    CB_PREFIX: {
        MENU: 'menu',
        ADMIN: 'admin',
        VPN_ORDER: 'vpn_order',
        AUTOSCRIPT_ORDER: 'autoscript_order'
    },

    generateMessageId: () => Math.random().toString(36).substring(2, 9).toUpperCase(),
};
