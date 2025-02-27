
import e from "cors";
import Claim from "../models/claim.model";
import { CustomError } from '../handlers/customError';
//import  ClaimStatusHistory  from "../models/claimStatusHistory.model";
import mongoose, { get, set } from "mongoose";
import { error } from "winston";
import { getUser } from "../redis/userRedis";
import { setUser } from "../redis/userRedis";
import { IUser } from "../interfaces/userReq.interface";
import { ClaimStateEnum } from "../enums/claimState.enum";
import errorClaim from "../errors/errorClaim";
import { ClaimTtpeEnum } from "../enums/claimType.enum";
import { randomUUID } from "node:crypto";
import axios from "axios";
import { enviarMensaje } from "../rabbit/emitter/emiter.rabbit";



export async function saveClaim(token: string, orderId: string, descr: string, claimType: string) {
    console.log("orderId", orderId);
    //valido que esten los campos obligatorios
    if (!orderId) {
        throw new CustomError("NULL_ORDER_ID");
    }
    //valido que se haya ingresado una descripción
    if (!descr) {
        throw new CustomError("NULL_DESCRIPTION");
    }
    //Valido que la descripción no supere los 400 caracteres
    if (descr.length > 400) {
        throw new CustomError("DESCRIPTION_LENGTH");
    }
    //valido que se haya ingresado un tipo de reclamo
    if (!claimType) {
        throw new CustomError("NULL_CLAIM_TYPE");
    }

    //valido que el tipo de reclamo sea un tipo valido
    // if (!(Object.values(ClaimTtpeEnum).includes(claimType as ClaimTtpeEnum))) {
    //     throw new CustomError('NOT_VALID_CLAIM_TYPE');
    // }


    //tomo el _id_user del token validado en el middleware
    const user: IUser = await getUser(token);
    let _id_user = user.id;

    console.log(user);

    //validaciones de la orden

    const orderResponse = await axios.get(`http://localhost:3004/v1/orders/${orderId}`, { headers: { "Authorization": `bearer ${token}` } });
    console.log(orderResponse.data);
    const order = orderResponse.data;
    //estado de la orden
    if (order.status !== "payment_defined") {
        throw new CustomError("NOT_VALID_ORDER_STATUS");
    }

    // if(user.name !== order.user_name){
    //     throw new CustomError("NOT_VALID_USER");
    // }

    //fecha valida
    const orderDate = new Date(order.created);
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate.getTime() - orderDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Diferencia en días

    if (diffDays > 30) {
        throw new CustomError("CLAIM_OUT_OF_TIME");
    }

    //creo el reclamo
    const claim1 = new Claim({
        claim_id: randomUUID(),
        dateCreated: new Date(),
        order_id: orderId,
        user_id: _id_user,
        description: descr,
        claim_type: claimType,
        status: [{
            //statusId: randomUUID(),
            statusName: ClaimStateEnum.CLAIM_STATE_PENDING,
            isActive: true
        }]
    });
    const mensage = {
        orderId: orderId,
        claimId: claim1.claim_id,
        action: 'Nuevo Reclamo'

    };
    await claim1.save();
    console.log(claim1);
    //envio mensaje a RabbitMQ para el microservicio de notificaciones
    await enviarMensaje(mensage, 'notification', 'send_notification', 'notificaciones.email');
    return claim1.claim_id;
}

//funcion para obtener todos los reclamos, si se ingresa un estado, solo trae los reclamos en ese estado
export async function getClaims(token: string, status?: string, nroOrden?: string) {

    //tomo el _id_user del token validado en el middleware
    const user: IUser = await getUser(token);
    console.log(user.permissions);
    console.log(nroOrden);
    let claims;


    // Construir la consulta base
    let query: any = {};

    // Agregar filtro por número de orden si está presente
    if (nroOrden) {
        query.order_id = nroOrden;
    }

    // Agregar filtro por estado si está presente
    if (status) {
        // Uso de la función para validar el estado de reclamo
        if (!isValidClaimState(status)) {
            throw new CustomError("NOT_VALID_STATUS");
        }
        console.log("status", status);
        console.log("nroOrden", nroOrden);

        query.status = {
            $elemMatch: {
                statusName: status,
                isActive: true
            }
        };
    }

    // Filtrar por permisos de usuario
    if (user.permissions.includes('admin')) {
        // Si el usuario es admin, traer todos los reclamos que coincidan con los filtros
        claims = await Claim.find(query).select('-__v');
    } else {
        // Si el usuario no es admin, traer solo los reclamos del usuario que coincidan con los filtros
        query.user_id = user.id;
        claims = await Claim.find(query).select('-__v');

    }
    if (claims.length === 0) {
        throw new CustomError("ERROR_LIST_CLAIMS");
    }
    return claims;
}


export async function claimById(id: string) {
    const claim = await Claim.findById(id);
    console.log(claim);
    return claim;
}




//funcion para resolver un reclamo, solo el admin puede resolverlo
export async function editClaim(id: string, status: string, ans: string, token: string) {

    //valido que el token sea de un admin
    const user: IUser = await getUser(token);//tomo el _id_user del token validado en el middleware
    if (!user.permissions.includes('admin')) {
        throw new CustomError("NOT_VALID_USER");
    }

    //valido que el estado sea un estado valido
    if (status !== ClaimStateEnum.CLAIM_STATE_ACCEPTED && status !== ClaimStateEnum.CLAIM_STATE_CANCELED && status !== ClaimStateEnum.CLAIM_STATE_INPROGRESS) {
        throw new CustomError("NOT_VALID_STATUS");
    }
let claimEdited: any;
    if(status === ClaimStateEnum.CLAIM_STATE_INPROGRESS){ 
    claimEdited = await Claim.findOne({
        "_id": id,
        status: {
            $elemMatch: {
                statusName: ClaimStateEnum.CLAIM_STATE_PENDING,
                isActive: true
            }
        }
    });
    }else{
        claimEdited = await Claim.findOne({
            "_id": id,
            status: {
                $elemMatch: {
                    statusName: ClaimStateEnum.CLAIM_STATE_INPROGRESS,
                    isActive: true
                }
            }
        });
    }
    if (!claimEdited) {
        throw new CustomError("NOT_EXIST_THE_CLAIM");
    }

    claimEdited.status.forEach(async (element: { isActive: boolean }) => {
        if (element.isActive) {
            element.isActive = false;
            await claimEdited?.save();
        }
    });

    claimEdited = await Claim.findByIdAndUpdate(id, {
        admin: user.name,
        answer: ans,
        resolution_date: new Date(),
        status: [...claimEdited.status, {
            statusName: status,
            isActive: true
        }]
    }, { new: true });

    if (claimEdited) {
        await claimEdited.save();
        console.log(claimEdited);
    }

    let action;
    if (status === ClaimStateEnum.CLAIM_STATE_INPROGRESS) {
        action = 'Reclamo en Proceso';
    } else {
        action = 'Reclamo Resuelto';
    }
const mensage = {
    orderId: claimEdited.order_id,
    claimId: claimEdited.claim_id,
    action: action

};
    //envío mensaje a traves de RabbitMQ para el microservicio de notificaciones
    await enviarMensaje(mensage, 'notification', 'send_notification', 'notificaciones.email');
    return claimEdited;
}

//funcion para eliminar un reclamo, solo el user puede eliminarlo
export async function lowClaim(id: string) {

    const claim = await Claim.findById(id);
      
    if (!claim) {
        throw new CustomError("NOT_POSIBLE_DELETE");
    }

    let claimDate = claim.dateCreated;
    let currentDate = new Date();
    let diffTime = Math.abs(currentDate.getTime() - claimDate.getTime());
    let diffHours = diffTime / (1000 * 60 * 60); // Diferencia en horas
    if (diffHours > 24) {
        throw new CustomError("CLAIM_OUT_OF_TIME");
    }
    const mensage = {
        orderId: claim.order_id,
        claimId: claim.claim_id,
        action: 'Reclamo Eliminado'

    };
    await Claim.findByIdAndDelete(id);
   
    //envio mensaje a RabbitMQ para el microservicio de notificaciones
   // await enviarMensaje(mensage, 'notification', 'send_notification', 'notificaciones.email');


    return;
}


//funcion para validar si un string ingesado es un estado de reclamo válido
function isValidClaimState(state: string): boolean {
    return Object.values(ClaimStateEnum).includes(state as ClaimStateEnum);
}

//Función para dar de baja reclamos asociados a un número de orden recibido del microservicio de ordenes a través de rabbit.
export async function lowClaims(id: string) {

    let claims = await Claim.find({
        order_id: id
    });

    if (!claims) {
        throw new CustomError("NOT_EXIST_THE_CLAIM");
    }
    //console.log(claims);
    //Por cada reclamo asociado a la orden
    for (let i = 0; i < claims.length; i++) {
        const claim = claims[i];

        //Colocar siActive en false en todos los estados activos
        claim.status.forEach((element: { isActive: boolean }) => {
            if (element.isActive) {
                element.isActive = false;
            }
        });

        // Agregar el nuevo estado "Discharged"
        claim.status.push({
            statusName: ClaimStateEnum.CLAIM_STATE_DISCHARGED,
            isActive: true
        });


        //Actualizar los cambios
        await Claim.findByIdAndUpdate(claim._id, {
            status: claim.status
        }, { new: true });

    }
    console.log("Se cancelaron" + " " + claims.length + " " + "reclamos asociados a la orden número:" + " " + id);
    return

}



