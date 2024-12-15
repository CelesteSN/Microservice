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
exports.createConsumer = createConsumer;
exports.logoutSessionRabbit = logoutSessionRabbit;
const callback_api_1 = __importDefault(require("amqplib/callback_api"));
const node_events_1 = require("node:events");
const Environments_1 = require("../../Config/Environments");
const emitterResponseArticleBought = new node_events_1.EventEmitter();
const env = (0, Environments_1.environmentsConfig)();
function createConsumer(propsConsumer, functionType) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            callback_api_1.default.connect(env.rabbitUrl, (errorConnection, connection) => {
                if (errorConnection) {
                    console.error(`No se pudo conectar a RABBITMQ la cola con routingKey ${propsConsumer.routingKey}, intentado reconexión en 5 segundos`);
                    setTimeout(() => createConsumer(propsConsumer, functionType), 5000);
                    return;
                }
                else
                    connection.createChannel((errorCreateChannel, channel) => {
                        if (errorCreateChannel)
                            return new Error(errorCreateChannel);
                        channel.on("close", function () {
                            console.error(`Se cerro la sesión de rabbit en el exchange ${propsConsumer.routingKey}, intentado reconexión en 5 segundos`);
                            setTimeout(() => createConsumer(propsConsumer, functionType), 5000);
                        });
                        channel.assertExchange(propsConsumer.exchange, 'direct', { durable: false });
                        channel.assertQueue(propsConsumer.queue, { exclusive: true }, (errorAssertQueue, queue) => {
                            if (errorAssertQueue)
                                throw errorAssertQueue;
                            channel.bindQueue(queue.queue, propsConsumer.exchange, propsConsumer.routingKey);
                            console.log(`Queue ${propsConsumer.queue} active and listening`);
                            channel.consume(queue.queue, (msg) => {
                                if (msg) {
                                    let content = JSON.parse(msg.content.toString());
                                    if (msg)
                                        console.log(content);
                                    return functionType(content);
                                }
                            }, {
                                noAck: true
                            });
                        });
                    });
            });
        }
        catch (err) {
            console.error(`Se cerro la sesión de rabbit en el exchange ${propsConsumer.routingKey} por causa de ${err.message}, intentado reconexión en 5 segundos`);
            setTimeout(() => createConsumer(propsConsumer, functionType), 5000);
        }
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
                        channel.assertQueue("logout", { exclusive: true }, (errorAssertQueue, queue) => {
                            if (errorAssertQueue)
                                throw errorAssertQueue;
                            queueCreated = queue.queue;
                            channel.bindQueue(queue.queue, propsConsumer.exchange, "");
                            console.log(`Queue ${queue.queue} active and listening`);
                            channel.consume(queue.queue, (msg) => {
                                if (msg) {
                                    let content = JSON.parse(msg.content.toString());
                                    console.log("Logout user with token: ", JSON.parse(msg.content.toString()));
                                    return functionType(content);
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
