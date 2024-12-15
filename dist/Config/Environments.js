'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.environmentsConfig = environmentsConfig;
//import 'dotenv/config';
let env = process.env;
let config;
function environmentsConfig() {
    if (!config) {
        config = {
            port: env.SERVER_PORT || "3150",
            mongoDb: env.MONGO_URL || "mongodb://localhost:27017/reclamoDB",
            securityServer: env.AUTH_SERVICE_URL || "http://localhost:3000",
            rabbitUrl: env.RABBIT_URL || "amqp://localhost",
            redisUrl: env.REDIS_URL || 'redis://localhost:6379'
        };
    }
    return config;
}
