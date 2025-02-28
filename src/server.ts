
import {connectDB } from "./config/mongoDB";
import { environmentsConfig } from "./config/environments";
import { initExpress } from "./server/express";
import { redisInit } from './redis/userRedis';
import {consumerClaimServer} from './rabbit/receiver/receiver.rabbit';
import {logoutSession} from './rabbit/receiver/receiver.auth.rebbit';


const config = environmentsConfig();
const port = config.port;
connectDB(config);



// Conexión Redis
redisInit();
//RabbitMQ
consumerClaimServer();
logoutSession();

const app = initExpress(config);

//Levanto instancia de server
app.listen(port, () => {
    console.log("Listen on the port", port)
})



