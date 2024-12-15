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
exports.getAllClaims = getAllClaims;
exports.getClaimById = getClaimById;
exports.createClaim = createClaim;
exports.updateClaim = updateClaim;
exports.deleteClaim = deleteClaim;
const claim_1 = require("../claim/claim");
function getAllClaims(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const claims = yield (0, claim_1.getClaims)();
            res.status(200).json(claims);
        }
        catch (error) {
            res.status(500).json({ error: "Internal server error" });
        }
    });
}
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
            const { order_id, user_id, description, claim_type } = req.body;
            yield (0, claim_1.saveClaim)(order_id, user_id, description, claim_type);
            res.status(200).json({ message: "Reclamo creado exitosamente" });
        }
        catch (error) {
            res.status(500).json({ error: "Internal server error" });
        }
    });
}
function updateClaim(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            const { status, answer } = req.body;
            yield (0, claim_1.editClaim)(id, status, answer);
            res.status(200).json({ message: "Reclamo resuelto exitosamente" });
        }
        catch (error) {
            res.status(500).json({ error: "Internal server error" });
        }
    });
}
function deleteClaim(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            yield (0, claim_1.lowClaim)(id);
            res.status(200).json({ message: "Reclamo eliminado exitosamente" });
        }
        catch (error) {
            res.status(500).json({ error: "Internal server error" });
        }
    });
}
