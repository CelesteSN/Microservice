'use strict';
//import 'dotenv/config';

let env = process.env;
let config: Config

export function environmentsConfig(): Config {
    if(!config){
        config = {
            port: env.SERVER_PORT || "3150",            
            mongoDb: env.MONGO_URL || "mongodb://localhost:27017/reclamoDB",
            securityServer: env.AUTH_SERVICE_URL || "http://localhost:3000",
            rabbitUrl: env.RABBIT_URL || "amqp://localhost",
            redisUrl: env.REDIS_URL || 'redis://localhost:6379'
        }
    }
    return config;
}


export interface Config {
    port: string;
    mongoDb: string;
    securityServer: string;
    rabbitUrl: string;
    redisUrl: string
}