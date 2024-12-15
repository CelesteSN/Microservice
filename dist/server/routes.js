"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = __importDefault(require("express"));
const claim_controller_1 = require("../controllers/claim.controller");
const router = express_1.default.Router();
exports.router = router;
router.get('/v1/claims', claim_controller_1.getAllClaims);
router.get('/v1/claims/:id', claim_controller_1.getClaimById);
router.post('/v1/claims', claim_controller_1.createClaim);
router.put('/v1/claims/:id', claim_controller_1.updateClaim);
router.delete('/v1/claims/:id', claim_controller_1.deleteClaim);
