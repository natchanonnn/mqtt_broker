var config = module.exports = {}

config.settings = {
    port: 1883,
    http: {
        port: 8883
    }
};

config.connection = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS
};