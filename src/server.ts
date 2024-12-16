
import {connectDB } from "./config/mongoDB";
//import {  saveClaim, getClaims , getClaimById, updateClaim, deleteClaim} from "./claim/claim";
//import Claim from "./models/claim.model";
import { environmentsConfig } from "./config/environments";
import { initExpress } from "./server/express";
import { redisInit } from './redis/userRedis';



const config = environmentsConfig();
const port = config.port;
connectDB();



// Conexión Redis
redisInit();

//saveClaim();
//getClaims();
//getClaimById("675a3e96a97acb1b7636809a");
//updateClaim("675a3e96a97acb1b7636809a", );
//deleteClaim("675a3e96a97acb1b7636809a");
const app = initExpress(config);

//Levanto instancia de server
app.listen(port, () => {
    console.log("Listen on the port", port)
})



