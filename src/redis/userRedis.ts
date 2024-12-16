import error from '../errors/errorUser';
import { createClient } from 'redis';
import { environmentsConfig} from '../config/environments';
const redisEnv = environmentsConfig();

let clienteRedis: any;


export function redisInit(){
    try {
        //Creo la instancia de Redis.
        clienteRedis = createClient({
            url: redisEnv.redisUrl
        });
        
        //Connectamos a redis
        clienteRedis.connect()
        .then(
            () => console.log("Redis connection created"),
            () => {
                console.log("Failed connection Redis, try again in 5 seconds");
                setTimeout(() => redisInit(), 5000);
            }
        );
        
        //En el caso de que se caiga Redis, se ejecuta el siguiente procedimiento.
        clienteRedis.on("error", function () {
            console.error(`Se cerro la conexión con REDIS, intentado reconexión`);
            redisInit();
        });  

    } catch (err: any) {
        console.log("Failed connection Redis, try again in 5 seconds")
        setTimeout(() => redisInit(), 5000)
    }
}

export async function setUser(token: string, userData: any){
    return await clienteRedis.set(`${token}`, JSON.stringify(userData))
    .then(() => true, () => false)
}

export async function getUser(token: string){
    try {
        let responseRedis = await clienteRedis.get(`${token}`)
        if(responseRedis) return JSON.parse(responseRedis.toString());
        return null
    } catch (err: any) {
        console.log(err.message)
        throw error.USER_NOT_FOUND_REDIS
    }   
}

export function deleteSessionUser(token: string){
    try {
        return clienteRedis.del(token)
            .then(
                (res: number) => {return res},
                (rej: any) => {return rej}
            )
    } catch (err: any) {
        console.log(err.message)
    }
}     