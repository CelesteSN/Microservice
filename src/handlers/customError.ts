import errorClaim from '../errors/errorClaim';

type ErrorType = keyof typeof errorClaim.errorClaim;

export class CustomError extends Error {
    public statusCode: number;

    constructor(errorType: ErrorType) {
        const { errorCode, error_message } = errorClaim.errorClaim[errorType];
        super(error_message);
        this.statusCode = errorCode;
        Object.setPrototypeOf(this, CustomError.prototype);
    }
}