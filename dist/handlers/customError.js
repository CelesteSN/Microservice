"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomError = void 0;
const errorClaim_1 = __importDefault(require("../errors/errorClaim"));
class CustomError extends Error {
    constructor(errorType) {
        const { errorCode, error_message } = errorClaim_1.default.errorClaim[errorType];
        super(error_message);
        this.statusCode = errorCode;
        Object.setPrototypeOf(this, CustomError.prototype);
    }
}
exports.CustomError = CustomError;
