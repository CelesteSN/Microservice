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
exports.connectDBMongo = connectDBMongo;
const mongoose_1 = require("mongoose");
function connectDBMongo(env) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log("Trying connect with MONGODB");
            let connectionMongoDB = yield (0, mongoose_1.connect)(env.mongoDb);
            if (connectionMongoDB) {
                console.log("Database connection created");
            }
            else {
                console.log("Failed connection with mongoDB, trying again in 5 seconds");
                setTimeout(() => connectDBMongo(env), 5000);
            }
        }
        catch (err) {
            console.log("Failed connection with mongoDB, trying again in 5 seconds");
            setTimeout(() => connectDBMongo(env), 5000);
        }
    });
}
