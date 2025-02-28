import amqp from "amqplib/callback_api";
import { environmentsConfig } from "../../config/environments";
import { IPropsConsumer } from "../../interfaces/rabbit.interface";
import { dismissClaims } from "../../claim/claim";



const env = environmentsConfig();


//Función que se inicializará y quedara escuchando en el canal para resultados que envie el servicio de order.
export async function consumerClaimServer(){
    const propsConsumer = {
      exchange: 'claims_exchange',
      queue: 'ordenes_canceladas',
      routingKey: 'discharged_claims'
    }
    //Creo el consumidor y le paso la funcion que ejecutara cuando llega un mensaje.
    await createConsumer(propsConsumer, dismissClaims);
  }



export async function createConsumer(propsConsumer: IPropsConsumer, functionType: any) {
    try {
        amqp.connect(env.rabbitUrl, (errorConnection: any, connection: amqp.Connection) => {
            if (errorConnection) {
                console.error(`No se pudo conectar a RABBITMQ la cola con routingKey ${propsConsumer.routingKey}, intentado reconexión en 5 segundos`);
                setTimeout(() => createConsumer(propsConsumer, functionType), 5000);
                return
            }else
            connection.createChannel((errorCreateChannel: any, channel: amqp.Channel) => {
                if (errorCreateChannel) return new Error(errorCreateChannel);
                channel.on("close", function () {
                    console.error(`Se cerro la sesión de rabbit en el exchange ${propsConsumer.routingKey}, intentado reconexión en 5 segundos`);
                    setTimeout(() => createConsumer(propsConsumer, functionType), 5000);
                });
                channel.assertExchange(propsConsumer.exchange, 'direct', {durable: true});
                channel.assertQueue(propsConsumer.queue, { durable: true }, (errorAssertQueue, queue) => {
                    if(errorAssertQueue) throw errorAssertQueue;
                    channel.bindQueue(queue.queue, propsConsumer.exchange, propsConsumer.routingKey)
                    console.log(`Queue ${propsConsumer.queue} active and listening`);
                    channel.consume(queue.queue, (msg) => {
                        if(msg){
                            const messageContent = msg.content.toString();
                             const content = JSON.parse(messageContent);
                             const ordenId = content.ordenId;
                                console.log(ordenId);
                            return functionType(ordenId);
                        }
                    },{
                        noAck: true
                    });
                }); 
            });
        });
    } catch (err: any) {
        console.error(`Se cerro la sesión de rabbit en el exchange ${propsConsumer.routingKey} por causa de ${err.message}, intentado reconexión en 5 segundos`);
        setTimeout(() => createConsumer(propsConsumer, functionType), 5000);
    }
}

