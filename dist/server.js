"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoDB_1 = require("./config/mongoDB");
const environments_1 = require("./config/environments");
const express_1 = require("./server/express");
const userRedis_1 = require("./redis/userRedis");
const receiver_rabbit_1 = require("./rabbit/receiver/receiver.rabbit");
const receiver_auth_rebbit_1 = require("./rabbit/receiver/receiver.auth.rebbit");
const config = (0, environments_1.environmentsConfig)();
const port = config.port;
(0, mongoDB_1.connectDB)(config);
// Conexión Redis
(0, userRedis_1.redisInit)();
//RabbitMQ
(0, receiver_rabbit_1.consumerClaimServer)();
(0, receiver_auth_rebbit_1.logoutSession)();
const app = (0, express_1.initExpress)(config);
//Levanto instancia de server
app.listen(port, () => {
    console.log("Listen on the port", port);
});
