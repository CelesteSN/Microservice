import { invalidateToken } from "../../token/token";
import { IPropsLogoutConsumer, IRabbitMessage } from "../../interfaces/rabbit.interface";
import amqp from "amqplib/callback_api";
import { environmentsConfig } from "../../config/environments";
const env = environmentsConfig(); 

export async function logoutSession(){
    const logout = {
        exchange: "auth"
    }
    await logoutSessionRabbit(logout, invalidateToken)
}


export async function logoutSessionRabbit(propsConsumer: IPropsLogoutConsumer, functionType: any) {
    let queueCreated;
    try {
        amqp.connect(env.rabbitUrl, (errorConnection: any, connection: amqp.Connection) => {
            if (errorConnection) {
                console.error(`No se pudo conectar a RABBITMQ el exchange ${propsConsumer.exchange}, intentado reconexión en 5 segundos`);
                setTimeout(() => logoutSessionRabbit(propsConsumer, functionType), 5000);
                return
            }else
            connection.createChannel((errorCreateChannel: any, channel: amqp.Channel) => {
                if (errorCreateChannel) return new Error(errorCreateChannel);
                channel.on("close", function () {
                    console.error(`Se cerro la sesión de rabbit en el exchange ${propsConsumer.exchange}, intentado reconexión en 5 segundos`);
                    setTimeout(() => logoutSessionRabbit(propsConsumer, functionType), 5000);
                });
                channel.assertExchange(propsConsumer.exchange, 'fanout', {durable: false});
                channel.assertQueue("", { exclusive: true }, (errorAssertQueue, queue) => {
                    if(errorAssertQueue) throw errorAssertQueue;
                    queueCreated = queue.queue;
                    channel.bindQueue(queue.queue, propsConsumer.exchange, "")
                    console.log(`Queue ${queue.queue} active and listening`);
                    channel.consume(queue.queue, (msg) => {
                        if(msg){
                            let rabbitMessage = JSON.parse(msg.content.toString());
                            if(rabbitMessage.type !== "logout") return;
                            const token = rabbitMessage.message;
                            console.log("Logout user with token: ", token);
                            return functionType(token);
                                                  
                        }
                    },{
                        noAck: true
                    });
                }); 
            });
        });
    } catch (err: any) {
        console.error(`Se cerro la sesión de rabbit en el exchange ${propsConsumer.exchange} por causa de ${err.message}, intentado reconexión en 5 segundos`);
        setTimeout(() => logoutSessionRabbit(propsConsumer, functionType), 5000);
    }
}