import { environmentsConfig } from "../config/environments";
import axios from "axios";
import { deleteSessionUser, getUser, setUser } from "../redis/userRedis";
import { ITokenLogout } from "../interfaces/userReq.interface";

const env = environmentsConfig();

export async function validateToken(token: string) {
  try {
    //Busco la sesión del usuario en la caché.
    let userCache = await getUser(token);
    if (userCache) {
      return true;
    }
  
    // Si el token no está en la caché, lo busco en el servicio de auth.
    let responseSaveCacheUser = await axios.get(
      `${env.securityServer}/v1/users/current`, { headers: { "Authorization": `bearer ${token}`}})
      .then(  async (response) => {
                  if (await setUser(token, response.data)) {
                    return true;
                  }
                  return false;
                },
              (reject) => {
                  console.log("No lo pudo obtener al user del servicio de AUTH")
                  return false;
              });
    return responseSaveCacheUser;

  } catch (err) {
    console.log(err);
    return err;
  }
}

// Función para eliminar una sesión
export async function invalidateToken(logout: ITokenLogout) {
  try{
    let token = logout.message.split(" ")[1] //Separo el Bearer {token} para solo quedarme con el token.
    let existUser = await getUser(token);
    if (existUser) {
      if(await deleteSessionUser(token)){
        console.log("Invalidate session token:", token);
      }
    // }else{
    //   console.log("User be not in cache")
     }
  }catch(err: any){
    return new Error(err)
  }
}