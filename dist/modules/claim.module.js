"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const claim_router_1 = __importDefault(require("../routers/claim.router"));
const claim_controller_1 = __importDefault(require("../controllers/claim.controller"));
const claim_service_1 = __importDefault(require("../services/claim.service"));
const claimService = new claim_service_1.default();
const claimController = new claim_controller_1.default(claimService);
const claimRouter = new claim_router_1.default(claimController);
exports.default = {
    router: claimRouter.getRouter(),
    controller: claimController,
    service: claimService,
    path: claimRouter.getPath()
};
