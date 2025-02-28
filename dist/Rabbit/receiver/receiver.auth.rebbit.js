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
exports.logoutSession = logoutSession;
exports.logoutSessionRabbit = logoutSessionRabbit;
const token_1 = require("../../token/token");
const callback_api_1 = __importDefault(require("amqplib/callback_api"));
const environments_1 = require("../../config/environments");
const env = (0, environments_1.environmentsConfig)();
function logoutSession() {
    return __awaiter(this, void 0, void 0, function* () {
        const logout = {
            exchange: "auth"
        };
        yield logoutSessionRabbit(logout, token_1.invalidateToken);
    });
}
function logoutSessionRabbit(propsConsumer, functionType) {
    return __awaiter(this, void 0, void 0, function* () {
        let queueCreated;
        try {
            callback_api_1.default.connect(env.rabbitUrl, (errorConnection, connection) => {
                if (errorConnection) {
                    console.error(`No se pudo conectar a RABBITMQ el exchange ${propsConsumer.exchange}, intentado reconexión en 5 segundos`);
                    setTimeout(() => logoutSessionRabbit(propsConsumer, functionType), 5000);
                    return;
                }
                else
                    connection.createChannel((errorCreateChannel, channel) => {
                        if (errorCreateChannel)
                            return new Error(errorCreateChannel);
                        channel.on("close", function () {
                            console.error(`Se cerro la sesión de rabbit en el exchange ${propsConsumer.exchange}, intentado reconexión en 5 segundos`);
                            setTimeout(() => logoutSessionRabbit(propsConsumer, functionType), 5000);
                        });
                        channel.assertExchange(propsConsumer.exchange, 'fanout', { durable: false });
                        channel.assertQueue("", { exclusive: true }, (errorAssertQueue, queue) => {
                            if (errorAssertQueue)
                                throw errorAssertQueue;
                            queueCreated = queue.queue;
                            channel.bindQueue(queue.queue, propsConsumer.exchange, "");
                            console.log(`Queue ${queue.queue} active and listening`);
                            channel.consume(queue.queue, (msg) => {
                                if (msg) {
                                    let rabbitMessage = JSON.parse(msg.content.toString());
                                    if (rabbitMessage.type !== "logout")
                                        return;
                                    const token = rabbitMessage.message;
                                    console.log("Logout user with token: ", token);
                                    return functionType(token);
                                }
                            }, {
                                noAck: true
                            });
                        });
                    });
            });
        }
        catch (err) {
            console.error(`Se cerro la sesión de rabbit en el exchange ${propsConsumer.exchange} por causa de ${err.message}, intentado reconexión en 5 segundos`);
            setTimeout(() => logoutSessionRabbit(propsConsumer, functionType), 5000);
        }
    });
}
