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
exports.validateToken = validateToken;
exports.invalidateToken = invalidateToken;
const environments_1 = require("../config/environments");
const axios_1 = __importDefault(require("axios"));
const userRedis_1 = require("../redis/userRedis");
const env = (0, environments_1.environmentsConfig)();
function validateToken(token) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            //Busco la sesión del usuario en la caché.
            let userCache = yield (0, userRedis_1.getUser)(token);
            if (userCache) {
                return true;
            }
            // Si el token no está en la caché, lo busco en el servicio de auth.
            let responseSaveCacheUser = yield axios_1.default.get(`${env.securityServer}/v1/users/current`, { headers: { "Authorization": `bearer ${token}` } })
                .then((response) => __awaiter(this, void 0, void 0, function* () {
                if (yield (0, userRedis_1.setUser)(token, response.data)) {
                    return true;
                }
                return false;
            }), (reject) => {
                console.log("No lo pudo obtener al user del servicio de AUTH");
                return false;
            });
            return responseSaveCacheUser;
        }
        catch (err) {
            console.log(err);
            return err;
        }
    });
}
// Función para eliminar una sesión
function invalidateToken(tokenLogout) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // let token = logout.message.split(" ")[1] //Separo el Bearer {token} para solo quedarme con el token.
            let existUser = yield (0, userRedis_1.getUser)(tokenLogout);
            if (existUser) {
                if (yield (0, userRedis_1.deleteSessionUser)(tokenLogout)) {
                    console.log("Invalidate session token:", tokenLogout);
                }
                // }else{
                //   console.log("User be not in cache")
            }
        }
        catch (err) {
            return new Error(err);
        }
    });
}
