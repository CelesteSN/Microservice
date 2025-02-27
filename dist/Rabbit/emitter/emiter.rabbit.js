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
exports.enviarMensaje = enviarMensaje;
const amqplib_1 = __importDefault(require("amqplib"));
const RABBITMQ_URL = 'amqp://localhost';
function enviarMensaje(mensaje, exchange, queue, routingKey) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const EXCHANGE_NAME = exchange;
            const QUEUE_NAME = queue;
            const ROUTING_KEY = routingKey;
            //conectar con RabbitMQ
            const connection = yield amqplib_1.default.connect(RABBITMQ_URL);
            const channel = yield connection.createChannel();
            //Asegurar que el exchange y la queue existen
            yield channel.assertExchange(EXCHANGE_NAME, 'direct', { durable: true });
            yield channel.assertQueue(QUEUE_NAME, { durable: true });
            yield channel.bindQueue(QUEUE_NAME, EXCHANGE_NAME, ROUTING_KEY);
            //Convertir el mensaje a JSON y enviar a la cola
            const message = JSON.stringify(mensaje);
            channel.publish(EXCHANGE_NAME, ROUTING_KEY, Buffer.from(JSON.stringify(mensaje)), { persistent: true });
            //channel.sendToQueue(QUEUE_NAME, Buffer.from(mensaje), { persistent: true });
            console.log('Mensaje enviado a RabbitMQ:', mensaje);
            //Cerrar conexión
            yield channel.close();
            yield connection.close();
        }
        catch (error) {
            console.error('Error al enviar mensaje a RabbitMQ:', error);
        }
    });
}
