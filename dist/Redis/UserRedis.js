"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisInit = redisInit;
exports.setUser = setUser;
exports.getUser = getUser;
exports.deleteSessionUser = deleteSessionUser;
const error_user_1 = __importDefault(require("../Error/error_user"));
const redis_1 = require("redis");
const Environments_1 = require("../Config/Environments");
const redisEnv = (0, Environments_1.environmentsConfig)();
let clienteRedis;
function redisInit() {
    try {
        //Creo la instancia de Redis.
        clienteRedis = (0, redis_1.createClient)({
            url: redisEnv.redisUrl
        });
        //Connectamos a redis
        clienteRedis.connect()
            .then(() => console.log("Redis connection created"), () => {
            console.log("Failed connection Redis, try again in 5 seconds");
            setTimeout(() => redisInit(), 5000);
        });
        //En el caso de que se caiga Redis, se ejecuta el siguiente procedimiento.
        clienteRedis.on("error", function () {
            console.error(`Se cerro la conexión con REDIS, intentado reconexión`);
            redisInit();
        });
    }
    catch (err) {
        console.log("Failed connection Redis, try again in 5 seconds");
        setTimeout(() => redisInit(), 5000);
    }
}
function setUser(token, userData) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield clienteRedis.set(`${token}`, JSON.stringify(userData))
            .then(() => true, () => false);
    });
}
function getUser(token) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let responseRedis = yield clienteRedis.get(`${token}`);
            if (responseRedis)
                return JSON.parse(responseRedis.toString());
            return null;
        }
        catch (err) {
            console.log(err.message);
            throw error_user_1.default.USER_NOT_FOUND_REDIS;
        }
    });
}
function deleteSessionUser(token) {
    try {
        return clienteRedis.del(token)
            .then((res) => { return res; }, (rej) => { return rej; });
    }
    catch (err) {
        console.log(err.message);
    }
}
