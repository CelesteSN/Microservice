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
exports.saveClaim = saveClaim;
exports.getClaims = getClaims;
exports.claimById = claimById;
exports.editClaim = editClaim;
exports.lowClaim = lowClaim;
exports.dismissClaims = dismissClaims;
const claim_model_1 = __importDefault(require("../models/claim.model"));
const customError_1 = require("../handlers/customError");
const userRedis_1 = require("../redis/userRedis");
const claimState_enum_1 = require("../enums/claimState.enum");
const claimType_enum_1 = require("../enums/claimType.enum");
const node_crypto_1 = require("node:crypto");
const axios_1 = __importDefault(require("axios"));
const emiter_rabbit_1 = require("../rabbit/emitter/emiter.rabbit");
function saveClaim(token, orderId, descr, claimType) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("orderId", orderId);
        //valido que esten los campos obligatorios
        if (!orderId) {
            throw new customError_1.CustomError("NULL_ORDER_ID");
        }
        //valido que se haya ingresado una descripción
        if (!descr) {
            throw new customError_1.CustomError("NULL_DESCRIPTION");
        }
        //Valido que la descripción no supere los 400 caracteres
        if (descr.length > 400) {
            throw new customError_1.CustomError("DESCRIPTION_LENGTH");
        }
        //valido que se haya ingresado un tipo de reclamo
        if (!claimType) {
            throw new customError_1.CustomError("NULL_CLAIM_TYPE");
        }
        //valido que el tipo de reclamo sea un tipo valido
        if (!(isValidClaimType(claimType))) {
            throw new customError_1.CustomError('NOT_VALID_CLAIM_TYPE');
        }
        //tomo el userId del token validado en el middleware
        const user = yield (0, userRedis_1.getUser)(token);
        let _id_user = user.id;
        console.log(user);
        //validaciones de la orden
        const orderResponse = yield axios_1.default.get(`http://localhost:3004/v1/orders/${orderId}`, { headers: { "Authorization": `bearer ${token}` } });
        console.log(orderResponse.data);
        const order = orderResponse.data;
        //estado de la orden
        if (order.status !== "payment_defined") {
            throw new customError_1.CustomError("NOT_VALID_ORDER_STATUS");
        }
        if (user.id !== order.userId) {
            throw new customError_1.CustomError("NOT_VALID_USER");
        }
        //fecha valida
        const orderDate = new Date(order.created);
        const currentDate = new Date();
        const diffTime = Math.abs(currentDate.getTime() - orderDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Diferencia en días
        if (diffDays > 30) {
            throw new customError_1.CustomError("CLAIM_OUT_OF_TIME");
        }
        //creo el reclamo
        const claim1 = new claim_model_1.default({
            claim_id: (0, node_crypto_1.randomUUID)(),
            dateCreated: new Date(),
            order_id: orderId,
            user_id: _id_user,
            description: descr,
            claim_type: claimType,
            status: [{
                    statusName: claimState_enum_1.ClaimStateEnum.CLAIM_STATE_PENDING,
                    isActive: true,
                    created: new Date()
                }]
        });
        const mensage = {
            type: 'Nuevo Reclamo',
            orderId: orderId,
            claimId: claim1.claim_id,
        };
        yield claim1.save();
        console.log(claim1);
        //envio mensaje a RabbitMQ para el microservicio de notificaciones
        yield (0, emiter_rabbit_1.enviarMensaje)(mensage, 'notification', 'send_notification', 'notificaciones.email');
        return claim1.claim_id;
    });
}
//funcion para obtener todos los reclamos, si se ingresa un estado, solo trae los reclamos en ese estado
function getClaims(token, status, nroOrden) {
    return __awaiter(this, void 0, void 0, function* () {
        //tomo el _id_user del token validado en el middleware
        const user = yield (0, userRedis_1.getUser)(token);
        console.log(user.permissions);
        console.log(nroOrden);
        let claims;
        // Construir la consulta base
        let query = {};
        // Agregar filtro por número de orden si está presente
        if (nroOrden) {
            query.order_id = nroOrden;
        }
        // Agregar filtro por estado si está presente
        if (status) {
            // Uso de la función para validar el estado de reclamo
            if (!isValidClaimState(status)) {
                throw new customError_1.CustomError("NOT_VALID_STATUS");
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
            claims = yield claim_model_1.default.find(query).select('-__v');
        }
        else {
            // Si el usuario no es admin, traer solo los reclamos del usuario que coincidan con los filtros
            query.user_id = user.id;
            claims = yield claim_model_1.default.find(query).select('-__v');
        }
        if (claims.length === 0) {
            throw new customError_1.CustomError("ERROR_LIST_CLAIMS");
        }
        return claims;
    });
}
function claimById(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const claim = yield claim_model_1.default.findById(id);
        console.log(claim);
        return claim;
    });
}
//funcion para resolver un reclamo, solo el admin puede resolverlo
function editClaim(id, status, ans, token) {
    return __awaiter(this, void 0, void 0, function* () {
        //valido que el token sea de un admin
        const user = yield (0, userRedis_1.getUser)(token); //tomo el _id_user del token validado en el middleware
        if (!user.permissions.includes('admin')) {
            throw new customError_1.CustomError("NOT_VALID_USER");
        }
        //valido que el estado sea valido
        if (status !== claimState_enum_1.ClaimStateEnum.CLAIM_STATE_ACCEPTED && status !== claimState_enum_1.ClaimStateEnum.CLAIM_STATE_CANCELED && status !== claimState_enum_1.ClaimStateEnum.CLAIM_STATE_INPROGRESS) {
            throw new customError_1.CustomError("NOT_VALID_STATUS");
        }
        let claimEdited;
        let resolutionD;
        let answerAux;
        if (status === claimState_enum_1.ClaimStateEnum.CLAIM_STATE_INPROGRESS) {
            resolutionD = null;
            answerAux = "Su reclamo está siendo revisado por nuestro equipo";
            claimEdited = yield claim_model_1.default.findOne({
                "_id": id,
                status: {
                    $elemMatch: {
                        statusName: claimState_enum_1.ClaimStateEnum.CLAIM_STATE_PENDING,
                        isActive: true
                    }
                }
            });
        }
        else {
            if (ans === "") {
                throw new customError_1.CustomError("NOT_POSSIBLE_ANSWER_CLAIM");
            }
            resolutionD = new Date();
            answerAux = ans;
            claimEdited = yield claim_model_1.default.findOne({
                "_id": id,
                status: {
                    $elemMatch: {
                        statusName: claimState_enum_1.ClaimStateEnum.CLAIM_STATE_INPROGRESS,
                        isActive: true
                    }
                }
            });
        }
        if (!claimEdited) {
            throw new customError_1.CustomError("NOT_POSSIBLE_SOLVE_THE_CLAIM");
        }
        claimEdited.status.forEach((element) => __awaiter(this, void 0, void 0, function* () {
            if (element.isActive) {
                element.isActive = false;
                yield (claimEdited === null || claimEdited === void 0 ? void 0 : claimEdited.save());
            }
        }));
        claimEdited = yield claim_model_1.default.findByIdAndUpdate(id, {
            admin: user.name,
            answer: answerAux,
            resolution_date: resolutionD,
            status: [...claimEdited.status, {
                    statusName: status,
                    isActive: true,
                    created: new Date()
                }]
        }, { new: true });
        if (claimEdited) {
            yield claimEdited.save();
            console.log(claimEdited);
        }
        let action;
        if (status === claimState_enum_1.ClaimStateEnum.CLAIM_STATE_INPROGRESS) {
            action = 'Reclamo en Proceso';
        }
        else {
            action = 'Reclamo Resuelto';
        }
        const mensage = {
            type: action,
            orderId: claimEdited.order_id,
            claimId: claimEdited.claim_id,
        };
        //envío mensaje a traves de RabbitMQ para el microservicio de notificaciones
        yield (0, emiter_rabbit_1.enviarMensaje)(mensage, 'notification', 'send_notification', 'notificaciones.email');
        return;
    });
}
//funcion para eliminar un reclamo, solo el user puede eliminarlo
function lowClaim(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const claim = yield claim_model_1.default.findById(id);
        if (!claim) {
            throw new customError_1.CustomError("NOT_POSIBLE_DELETE");
        }
        let claimDate = claim.dateCreated;
        let currentDate = new Date();
        let diffTime = Math.abs(currentDate.getTime() - claimDate.getTime());
        let diffHours = diffTime / (1000 * 60 * 60); // Diferencia en horas
        if (diffHours > 24) {
            throw new customError_1.CustomError("CLAIM_OUT_OF_TIME");
        }
        const mensage = {
            type: 'Reclamo Eliminado',
            orderId: claim.order_id,
            claimId: claim.claim_id,
        };
        yield claim_model_1.default.findByIdAndDelete(id);
        //envio mensaje a RabbitMQ para el microservicio de notificaciones
        yield (0, emiter_rabbit_1.enviarMensaje)(mensage, 'notification', 'cancel_notification', 'notificaciones.email');
        return;
    });
}
//funcion para validar si un string ingesado es un estado de reclamo válido
function isValidClaimState(state) {
    return Object.values(claimState_enum_1.ClaimStateEnum).includes(state);
}
//función para validar si el tipo de reclamo es un tipo válido
function isValidClaimType(type) {
    return Object.values(claimType_enum_1.ClaimTtpeEnum).includes(type);
}
//Función para dar de baja reclamos asociados a un número de orden recibido del microservicio de ordenes a través de rabbit.
function dismissClaims(id) {
    return __awaiter(this, void 0, void 0, function* () {
        let claims = yield claim_model_1.default.find({
            order_id: id
        });
        if (!claims) {
            throw new customError_1.CustomError("NOT_EXIST_THE_CLAIM");
        }
        for (let i = 0; i < claims.length; i++) {
            const claim = claims[i];
            if (claim.status[claim.status.length - 1].statusName === claimState_enum_1.ClaimStateEnum.CLAIM_STATE_DISCHARGED) {
                console.log("Los reclamos asociados a la orden" + " " + id + " " + "ya fue dado de baja");
                return;
            }
        }
        //console.log(claims);
        //Por cada reclamo asociado a la orden
        for (let i = 0; i < claims.length; i++) {
            const claim = claims[i];
            //Colocar siActive en false en todos los estados activos
            claim.status.forEach((element) => {
                if (element.isActive) {
                    element.isActive = false;
                }
            });
            // Agregar el nuevo estado "Discharged"
            claim.status.push({
                statusName: claimState_enum_1.ClaimStateEnum.CLAIM_STATE_DISCHARGED,
                isActive: true,
                created: new Date(),
            });
            //Actualizar los cambios
            yield claim_model_1.default.findByIdAndUpdate(claim._id, {
                status: claim.status
            }, { new: true });
        }
        console.log("Se cancelaron" + " " + claims.length + " " + "reclamos asociados a la orden número:" + " " + id);
        return;
    });
}
