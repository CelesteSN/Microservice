// import { connect }  from "mongoose";
//  export async function connectDB() {
// const db = await connect("mongodb://localhost:27017/reclamoDB", {
// });
// console.log("Database connected", db.connection.name);
// }
'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = connectDB;
const mongoose_1 = require("mongoose");
function connectDB(env) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log("Trying connect with MONGODB");
            let connectionMongoDB = yield (0, mongoose_1.connect)(env.mongoDb);
            if (connectionMongoDB) {
                console.log("Database connection created", connectionMongoDB.connection.name);
            }
            else {
                console.log("Failed connection with mongoDB, trying again in 5 seconds");
                setTimeout(() => connectDB(env), 5000);
            }
        }
        catch (err) {
            console.log("Failed connection with mongoDB, trying again in 5 seconds");
            setTimeout(() => connectDB(env), 5000);
        }
    });
}
