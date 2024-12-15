"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = require("winston");
const config_1 = require("./config");
exports.logger = (0, winston_1.createLogger)();
if (config_1.appConfig.ENV === 'development') {
    exports.logger.add(new winston_1.transports.File({ filename: 'error.log', level: 'error' }));
    //logger.add(new transports.File({ filename: '/src/error.log', level: 'error' }));
    exports.logger.add(new winston_1.transports.File({ filename: 'server.log' }));
}
exports.logger.add(new winston_1.transports.Console({
    format: winston_1.format.combine(winston_1.format.colorize(), winston_1.format.timestamp(), winston_1.format.printf(info => `[${info.level}] ${info.timestamp} ${info.message}`)),
}));
