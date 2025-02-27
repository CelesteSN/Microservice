import amqp from "amqplib";

    const RABBITMQ_URL = 'amqp://localhost'; 
    

export async function enviarMensaje(mensaje: any,exchange: string, queue: string, routingKey: string) {

try{
    const EXCHANGE_NAME = exchange;
    const QUEUE_NAME = queue;
    const ROUTING_KEY = routingKey;
    //conectar con RabbitMQ
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    //Asegurar que el exchange y la queue existen
    await channel.assertExchange(EXCHANGE_NAME, 'direct', { durable: true });
    await channel.assertQueue(QUEUE_NAME, { durable: true });
    await channel.bindQueue(QUEUE_NAME, EXCHANGE_NAME, ROUTING_KEY);

    //Convertir el mensaje a JSON y enviar a la cola
    const message = JSON.stringify(mensaje);
    channel.publish(EXCHANGE_NAME, ROUTING_KEY, Buffer.from(JSON.stringify(mensaje)), { persistent: true });
    //channel.sendToQueue(QUEUE_NAME, Buffer.from(mensaje), { persistent: true });

    console.log('Mensaje enviado a RabbitMQ:', mensaje);

    //Cerrar conexión
    await channel.close();
    await connection.close();

}catch (error){
    console.error('Error al enviar mensaje a RabbitMQ:', error);
}



}