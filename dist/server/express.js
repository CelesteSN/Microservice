"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initExpress = initExpress;
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const token_1 = require("../middlewares/token");
const routes_1 = require("./routes");
function initExpress(appConfig) {
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)({ origin: true, optionsSuccessStatus: 200, credentials: true })); //Habilitamos los cors.
    app.use(body_parser_1.default.urlencoded({ extended: true, limit: "20mb" }));
    app.use(body_parser_1.default.json({ limit: "5mb" }));
    app.use(token_1.validationToken);
    app.use(routes_1.router); //Llamamos a las rutas.
    return app;
}
