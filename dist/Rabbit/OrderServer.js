"use strict";
// import { createConsumer } from './receiver/receiver';
// import { lowClaims } from '../claim/claim';
// //Función que se inicializará y quedara escuchando en el canal para resultados que envie el servicio de order.
// export async function consumerReportServer(){
//     const propsConsumer = {
//       exchange: 'Ordenes_exchange',
//       queue: 'ordenes_canceladas',
//       routingKey: 'discharged_claims'
//     }
//     //Creo el consumidor y le paso la funcion que ejecutara cuando llega un mensaje.
//     await createConsumer(propsConsumer, lowClaims);
//   }
