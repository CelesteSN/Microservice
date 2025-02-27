
import {connectDB } from "./config/mongoDB";
import { environmentsConfig } from "./config/environments";
import { initExpress } from "./server/express";
import { redisInit } from './redis/userRedis';
import {consumerReportServer} from './rabbit/receiver.rabbit/receiver';


const config = environmentsConfig();
const port = config.port;
connectDB(config);



// Conexión Redis
redisInit();
//RabbitMQ
consumerReportServer();

const app = initExpress(config);

//Levanto instancia de server
app.listen(port, () => {
    console.log("Listen on the port", port)
})



