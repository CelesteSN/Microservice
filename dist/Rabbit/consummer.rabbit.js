"use strict";
// import { lowClaims } from "../claim/claim";
// import amqp, { Message } from 'amqplib';
// const RABBITMQ_URL = 'amqp://localhost';
// const EXCHANGE_NAME = 'ordenes_exchange';
// const QUEUE_NAME = 'ordenes_canceladas';
// export async function recibirOrdenes(): Promise<void> {
//     try {
//         const connection = await amqp.connect(RABBITMQ_URL);
//         const channel = await connection.createChannel();
//         // Asegurar que la cola existe
//         await channel.assertQueue(QUEUE_NAME, { durable: true });
//         console.log("[*] Esperando órdenes...");
//         channel.consume(QUEUE_NAME, (msg: Message | null) => {
//             if (msg !== null) {
//                 const orden = JSON.parse(msg.content.toString());
//                 console.log("[📩] Orden recibida:", orden);
//                 // ✅ Confirmar mensaje para que RabbitMQ lo elimine de la cola
//                 channel.ack(msg);
//                 // 🚀 Simular procesamiento (Ejemplo: Guardar en base de datos, enviar email, etc.)
//                // procesarOrden(orden);
//                lowClaims(orden);
//             }
//         }, { noAck: false }); // NoAck en false → RabbitMQ reentrega si el micro falla
//     } catch (error) {
//         console.error("[❌] Error recibiendo orden:", error);
//     }
// }
// // Simular procesamiento de la orden
// // function procesarOrden(orden) {
// //     console.log(`[🔧] Procesando orden #${orden.id} para ${orden.usuario}...`);
// //     setTimeout(() => {
// //         console.log(`[✅] Orden #${orden.id} procesada con éxito.`);
// //     }, 2000);
// // }
