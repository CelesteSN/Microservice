// import { connect }  from "mongoose";



//  export async function connectDB() {
// const db = await connect("mongodb://localhost:27017/reclamoDB", {
// });
// console.log("Database connected", db.connection.name);

// }


'use strict';

import {connect} from 'mongoose';
import { Config } from './environments';

export async function connectDB(env: Config): Promise<void>{ //Realizo la conexión a mongo.
    try {
        console.log("Trying connect with MONGODB")
        let connectionMongoDB = await connect(env.mongoDb);
        if(connectionMongoDB){
            console.log("Database connection created", connectionMongoDB.connection.name);
        }else{
            console.log("Failed connection with mongoDB, trying again in 5 seconds");
            setTimeout(() => connectDB(env), 5000);
        }
    
    } catch (err: any) {
        console.log("Failed connection with mongoDB, trying again in 5 seconds");
        setTimeout(() => connectDB(env), 5000);
    }
}
