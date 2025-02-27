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
exports.sendMessage = sendMessage;
const amqplib_1 = __importDefault(require("amqplib"));
const environments_1 = require("../../config/environments");
const env = (0, environments_1.environmentsConfig)();
function sendMessage(message) {
    return __awaiter(this, void 0, void 0, function* () {
        let messageSent;
        try {
            const conn = yield amqplib_1.default.connect(env.rabbitUrl);
            const channel = yield conn.createChannel();
            const exchange = yield channel.assertExchange(message.exchange, 'direct', { durable: false });
            const queue = yield channel.assertQueue(message.queue, { durable: false });
            if (channel.publish(exchange.exchange, queue.queue, Buffer.from(JSON.stringify(message)))) {
                console.log(`Sent Message to ${exchange.exchange} server`);
                messageSent = message;
            }
        }
        catch (error) {
            console.log(`RabbitMQ ${message.exchange} connection failed: ${error}`);
            return Promise.reject(error);
        }
        return (messageSent) ? Promise.resolve(message) : Promise.reject(new Error("Not Sent Message"));
    });
}
