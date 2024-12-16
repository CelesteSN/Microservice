"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoDB_1 = require("./config/mongoDB");
//import {  saveClaim, getClaims , getClaimById, updateClaim, deleteClaim} from "./claim/claim";
//import Claim from "./models/claim.model";
const environments_1 = require("./config/environments");
const express_1 = require("./server/express");
const userRedis_1 = require("./redis/userRedis");
const config = (0, environments_1.environmentsConfig)();
const port = config.port;
(0, mongoDB_1.connectDB)();
// Conexión Redis
(0, userRedis_1.redisInit)();
//saveClaim();
//getClaims();
//getClaimById("675a3e96a97acb1b7636809a");
//updateClaim("675a3e96a97acb1b7636809a", );
//deleteClaim("675a3e96a97acb1b7636809a");
const app = (0, express_1.initExpress)(config);
//Levanto instancia de server
app.listen(port, () => {
    console.log("Listen on the port", port);
});
