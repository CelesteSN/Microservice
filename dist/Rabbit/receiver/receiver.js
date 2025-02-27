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
exports.consumerReportServer = consumerReportServer;
exports.createConsumer = createConsumer;
const callback_api_1 = __importDefault(require("amqplib/callback_api"));
const environments_1 = require("../../config/environments");
const claim_1 = require("../../claim/claim");
//const emitterResponseArticleBought = new EventEmitter();
const env = (0, environments_1.environmentsConfig)();
//Función que se inicializará y quedara escuchando en el canal para resultados que envie el servicio de order.
function consumerReportServer() {
    return __awaiter(this, void 0, void 0, function* () {
        const propsConsumer = {
            exchange: 'Ordenes_exchange',
            queue: 'ordenes_canceladas',
            routingKey: 'discharged_claims'
        };
        //Creo el consumidor y le paso la funcion que ejecutara cuando llega un mensaje.
        yield createConsumer(propsConsumer, claim_1.lowClaims);
    });
}
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
                        channel.assertExchange(propsConsumer.exchange, 'direct', { durable: true });
                        channel.assertQueue(propsConsumer.queue, { durable: true }, (errorAssertQueue, queue) => {
                            if (errorAssertQueue)
                                throw errorAssertQueue;
                            channel.bindQueue(queue.queue, propsConsumer.exchange, propsConsumer.routingKey);
                            console.log(`Queue ${propsConsumer.queue} active and listening`);
                            channel.consume(queue.queue, (msg) => {
                                if (msg) {
                                    const messageContent = msg.content.toString();
                                    // const content = JSON.parse(messageContent);
                                    console.log(messageContent);
                                    return functionType(messageContent);
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
