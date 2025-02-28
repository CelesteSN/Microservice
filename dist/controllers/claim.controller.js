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
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateClaim = exports.getAllClaims = void 0;
exports.getClaimById = getClaimById;
exports.createClaim = createClaim;
exports.deleteClaim = deleteClaim;
exports.cancelClaims = cancelClaims;
const claim_1 = require("../claim/claim");
const customError_1 = require("../handlers/customError");
const getAllClaims = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //obtengo el fitro por estado
        const status = req.query.status || '';
        //obtengo filtro por nro de orden
        const order_id = req.query.oder_id || '';
        //Tomo el token del header.
        let token = req.header("Authorization");
        token = token.split(" ")[1]; //Separo el Bearer {token} para solo quedarme con el token.
        const claims = yield (0, claim_1.getClaims)(token, status, order_id);
        res.status(200).json({ claims });
    }
    catch (error) {
        if (error instanceof customError_1.CustomError) {
            res.status(error.statusCode).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: "Internal server error" });
        }
    }
});
exports.getAllClaims = getAllClaims;
function getClaimById(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            console.log(id);
            const claim = yield (0, claim_1.claimById)(id);
            res.status(200).json(claim);
        }
        catch (error) {
            res.status(500).json({ error: "Internal server error" });
        }
    });
}
function createClaim(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            //Tomo el bearer token del header.
            let token = req.header("Authorization");
            token = token.split(" ")[1]; //Separo el Bearer {token} para solo quedarme con el token.
            const { order_id, description, claim_type } = req.body;
            const claimId = yield (0, claim_1.saveClaim)(token, order_id, description, claim_type);
            //Valido si ocurrido algún error en el proceso de crear un reporte de una review.
            res.status(200).json({ message: "Reclamo" + " " + claimId + " " + "creado exitosamente, el administrador será notificado en 24 hs" });
        }
        catch (error) {
            if (error instanceof customError_1.CustomError) {
                res.status(error.statusCode).json({ error: error.message });
            }
            else {
                res.status(500).json({ error: "Internal server error" });
            }
        }
    });
}
const updateClaim = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { status, answer } = req.body;
        console.log(id, status, answer);
        //Tomo el token del header.
        let token = req.header("Authorization");
        token = token.split(" ")[1]; //Separo el Bearer {token} para solo quedarme con el token.
        const claimEdited = yield (0, claim_1.editClaim)(id, status, answer, token);
        if (status === "InProgress") {
            res.status(200).json({ message: "Claim in proces, the user was notified" });
        }
        else {
            res.status(200).json({ message: "Claim resolved succesfuly, the user was notified" });
        }
    }
    catch (error) {
        if (error instanceof customError_1.CustomError) {
            res.status(error.statusCode).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: "Internal server error" });
        }
    }
});
exports.updateClaim = updateClaim;
function deleteClaim(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            yield (0, claim_1.lowClaim)(id);
            res.status(200).json({ message: "Clain deleted succesfuly" });
        }
        catch (error) {
            if (error instanceof customError_1.CustomError) {
                res.status(error.statusCode).json({ error: error.message });
            }
            else {
                res.status(500).json({ error: "Internal server error" });
            }
        }
    });
}
function cancelClaims(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // const { id } = req.params;
            const { order_id } = req.body;
            yield (0, claim_1.dismissClaims)(order_id);
            res.status(200).json({ message: "Claims associated with order number:" + " " + order_id + " " + "was canceled succesfuly" });
        }
        catch (error) {
            if (error instanceof customError_1.CustomError) {
                res.status(error.statusCode).json({ error: error.message });
            }
            else {
                res.status(500).json({ error: "Internal server error" });
            }
        }
    });
}
