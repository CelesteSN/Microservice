"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    errorClaim: {
        ERROR_LIST_CLAIMS: { errorCode: 404, error_message: "There are no claims" },
        NULL_USER_ID: { errorCode: 400, error_message: "Null user_id, it is required" },
        ERROR_SERVER: { errorCode: 500, error_message: "Error server" },
        NULL_ID_CLAIM: { errorCode: 400, error_message: "Null _id_claim, it is required" },
        NOT_VALID_STATUS: { errorCode: 400, error_message: "Status not valid" },
        NULL_ORDER_ID: { errorCode: 400, error_message: "Null order_id, it is required" },
        NULL_DESCRIPTION: { errorCode: 400, error_message: "Null description, it is required" },
        NULL_CLAIM_TYPE: { errorCode: 400, error_message: "Null claim_type, it is required" },
        NOT_EXIST_THE_CLAIM: { errorCode: 404, error_message: "The claim does not exist or it was resolved" },
        MISSING_DATA: { errorCode: 400, error_message: "Missing data" },
        NOT_VALID_ORDER_STATUS: { errorCode: 400, error_message: "Order status not valid" },
        CLAIM_OUT_OF_TIME: { errorCode: 400, error_message: "Claim out of time" },
        NOT_VALID_USER: { errorCode: 401, error_message: "User not valid for this operation" },
        DESCRIPTION_LENGTH: { errorCode: 400, error_message: "Description length not valid" },
        NOT_VALID_CLAIM_TYPE: { errorCode: 400, error_message: "Claim type not valid" },
        NOT_POSIBLE_DELETE: { errorCode: 400, error_message: "It is not possible to delete the claim" },
        NOT_POSSIBLE_SOLVE_THE_CLAIM: { errorCode: 400, error_message: "It is not possible to solve the claim" },
        NOT_POSSIBLE_LOW_CLAIM: { errorCode: 400, error_message: "The claims have already been dropped" },
        NOT_POSSIBLE_ANSWER_CLAIM: { errorCode: 400, error_message: "Answer it's necesary to resove the claim" },
    }
};
