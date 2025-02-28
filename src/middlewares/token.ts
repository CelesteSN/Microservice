import { Request, Response, NextFunction } from "express";
import error from "../errors/errorToken";
import { environmentsConfig } from "../config/environments";
import { validateToken } from "../token/token";
const env = environmentsConfig();


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

export async function validationToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        let token = req.header("Authorization"); // Extraer el Bearer token.

        if (!token) {
            res.status(error.INVALID_TOKEN.errorCode).json(error.NULL_TOKEN.error_message);
            return;
        }

        token = token.split(" ")[1]; // Separar "Bearer {token}" para obtener solo el token.

        const userToken = await validateToken(token); // Esperar validación de token.

        if (userToken) {
            next(); // Pasar al siguiente middleware.
        } else {
            res.status(error.INVALID_TOKEN.errorCode).json(error.INVALID_TOKEN.error_message);
        }
    } catch (errorCatch) {
        res.status(error.ERROR_SERVER.errorCode).json({ message: "Error en la validación del token", error: errorCatch });
    }
}

