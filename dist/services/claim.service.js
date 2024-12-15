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
const claim_model_1 = __importDefault(require("../models/claim.model"));
const claimHistory_model_1 = __importDefault(require("../models/claimHistory.model"));
const mongodb_1 = require("mongodb");
class ClaimService {
    constructor() {
        this.getAll = () => __awaiter(this, void 0, void 0, function* () {
            const claims = yield claim_model_1.default.find();
            console.log(claims);
            return claims;
        });
        this.getById = (id) => __awaiter(this, void 0, void 0, function* () {
            const query = { _id: new mongodb_1.ObjectId(id) };
            const claim = yield claim_model_1.default.findOne(query).exec();
            return claim;
        });
        this.create = (title, description, claimType, orderId, userId) => __awaiter(this, void 0, void 0, function* () {
            const claim = new claim_model_1.default({
                claimId: '123',
                orderId: orderId,
                userId: userId,
                title: title,
                description: description,
                createdAt: new Date(),
                updatedAt: new Date(),
                resolution_date: new Date(2022, 1, 1),
                answer: 'test',
                claimType: claimType,
                status: new claimHistory_model_1.default({
                    claimHistoryId: '123',
                    name: 'test',
                    description: 'test',
                    createdAt: new Date()
                })
            });
            yield claim.save();
        });
        this.update = (req, res) => __awaiter(this, void 0, void 0, function* () {
            res.send('Update claim');
        });
        this.delete = (req, res) => {
            res.send('Delete claim');
        };
    }
}
exports.default = ClaimService;
