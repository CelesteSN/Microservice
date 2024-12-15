"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const typegoose_1 = require("@typegoose/typegoose");
const claimStatusHistory_model_1 = require("./claimStatusHistory.model");
let Claim = class Claim {
};
__decorate([
    (0, typegoose_1.prop)({ required: true }),
    __metadata("design:type", String)
], Claim.prototype, "order_id", void 0);
__decorate([
    (0, typegoose_1.prop)({ required: true }),
    __metadata("design:type", String)
], Claim.prototype, "user_id", void 0);
__decorate([
    (0, typegoose_1.prop)({ required: true }),
    __metadata("design:type", String)
], Claim.prototype, "description", void 0);
__decorate([
    (0, typegoose_1.prop)({ required: true }),
    __metadata("design:type", String)
], Claim.prototype, "claim_type", void 0);
__decorate([
    (0, typegoose_1.prop)({ required: false }),
    __metadata("design:type", Date)
], Claim.prototype, "resolution_date", void 0);
__decorate([
    (0, typegoose_1.prop)({ required: false }),
    __metadata("design:type", String)
], Claim.prototype, "answer", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => [claimStatusHistory_model_1.ClaimStatusHistory], required: false }),
    __metadata("design:type", Array)
], Claim.prototype, "status", void 0);
Claim = __decorate([
    (0, typegoose_1.modelOptions)({ schemaOptions: { timestamps: true } })
], Claim);
const ClaimModel = (0, typegoose_1.getModelForClass)(Claim);
exports.default = ClaimModel;
