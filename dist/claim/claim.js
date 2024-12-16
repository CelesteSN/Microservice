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
exports.saveClaim = saveClaim;
exports.getClaims = getClaims;
exports.claimById = claimById;
exports.editClaim = editClaim;
exports.lowClaim = lowClaim;
const claim_model_1 = __importDefault(require("../models/claim.model"));
const userRedis_1 = require("../redis/userRedis");
function saveClaim(token, orderId, descr, claimType) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield (0, userRedis_1.getUser)(token); //tomo el _id_user del token validado en el middleware
        let _id_user = user.id;
        const claim1 = new claim_model_1.default({
            order_id: orderId,
            user_id: _id_user,
            description: descr,
            claim_type: claimType,
            status: [{
                    statusName: "Pending",
                    isActive: true
                }]
        });
        yield claim1.save();
        console.log(claim1);
        return claim1;
    });
}
function getClaims() {
    return __awaiter(this, void 0, void 0, function* () {
        const claims = yield claim_model_1.default.find({
            status: {
                $elemMatch: {
                    statusName: "Pending",
                    isActive: true
                }
            }
        });
        return claims;
    });
}
function claimById(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const claim = yield claim_model_1.default.findById(id);
        console.log(claim);
        return claim;
    });
}
function editClaim(id, status, ans) {
    return __awaiter(this, void 0, void 0, function* () {
        if (status === "Accepted" || status === "Canceled") {
            let claimEdited = yield claim_model_1.default.findOne({
                '_id': id,
                'status.isActive': true,
                'status.statusName': "Pending"
            });
            if (claimEdited) {
                claimEdited.status.forEach((element) => __awaiter(this, void 0, void 0, function* () {
                    if (element.isActive) {
                        element.isActive = false;
                        claimEdited === null || claimEdited === void 0 ? void 0 : claimEdited.save();
                    }
                }));
            }
            if (claimEdited) {
                claimEdited = yield claim_model_1.default.findByIdAndUpdate(id, {
                    answer: ans,
                    updated_at: new Date(),
                    resolution_date: new Date(),
                    status: [...claimEdited.status, {
                            statusName: status,
                            isActive: true
                        }]
                }, { new: true });
            }
            if (claimEdited) {
                yield claimEdited.save();
                console.log(claimEdited);
            }
            return claimEdited;
        }
        else {
            throw new Error("Status not valid");
        }
    });
}
function lowClaim(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const claim = yield claim_model_1.default.findOne({
            _id: id,
            status: {
                $elemMatch: {
                    statusName: "Pending",
                    isActive: true
                }
            }
        });
        if (!claim) {
            throw new Error("The claim does not exist");
        }
        yield claim_model_1.default.findByIdAndDelete(id);
        return "Reclamo eliminado";
    });
}
