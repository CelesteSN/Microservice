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
exports.validationToken = validationToken;
const errorToken_1 = __importDefault(require("../errors/errorToken"));
const environments_1 = require("../config/environments");
const token_1 = require("../token/token");
const env = (0, environments_1.environmentsConfig)();
// export async function validationToken( req: Request, res: Response, next: NextFunction ) {
//     let token = req.header("Authorization"); //Extraigo el Bearer token.
//     if (!token) {return res.status(error.INVALID_TOKEN.errorCode).json(error.NULL_TOKEN.error_message)} //Token NULL
//     token = token.split(" ")[1] //Separo el Bearer {token} para solo quedarme con el token.
//     validateToken(token) //Realizo la validación de token por caché.
//     .then(userToken  => {
//         if(userToken){
//             next();
//         }else{
//             return res.status(error.INVALID_TOKEN.errorCode).json(error.INVALID_TOKEN.error_message);
//         }     
//     })
//     .catch(errorCatch => {
//         return res.status(error.ERROR_SERVER.errorCode).json(errorCatch);
//     })    
// }
//import { Request, Response, NextFunction } from "express";
function validationToken(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let token = req.header("Authorization"); // Extraer el Bearer token.
            if (!token) {
                res.status(errorToken_1.default.INVALID_TOKEN.errorCode).json(errorToken_1.default.NULL_TOKEN.error_message);
                return;
            }
            token = token.split(" ")[1]; // Separar "Bearer {token}" para obtener solo el token.
            const userToken = yield (0, token_1.validateToken)(token); // Esperar validación de token.
            if (userToken) {
                next(); // Pasar al siguiente middleware.
            }
            else {
                res.status(errorToken_1.default.INVALID_TOKEN.errorCode).json(errorToken_1.default.INVALID_TOKEN.error_message);
            }
        }
        catch (errorCatch) {
            res.status(errorToken_1.default.ERROR_SERVER.errorCode).json({ message: "Error en la validación del token", error: errorCatch });
        }
    });
}
