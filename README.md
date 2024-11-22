## Microservicio: Reclamos sobre órdenes

El usuario reclama algo de la orden, permitiendo cancelarla si no se resuelve el reclamo correctamente.


### Casos de Uso

#### CU-001: Crear Reclamo
**Descripción:** Permite que el usuario pueda realizar un reclamo sobre una orden.

**Precondición:**
- Que haya realizado una compra (que exista la orden y que este en estado "payment_defined").
- Que se haya realizado petición de Reclamar.

**Camino Normal:**
  - Me llega en el body: `_id_order`, `claim_type` y `claim_description`.
  - Obtener el `_id_user` del usuario usando el token del usuario.
  - Validar que el campo `claim_description` sea distinto de null.
  - Validar que la cantidad de palabras sea menor a 400 y mayor de 5.
  - Validar que el campo `claim_type` sea distinto de null.
  - Obtener la Orden mediante el envió del mensaje al servicio de Order con la propiedad `_id_order` y el `state = PAYMENT_DEFINED`.
  - Obtener el estado "Pending" desde la Enum  `claim_state`.
  - Crear claim con: user_id, order_id, claim_type, description, created_date: fecha de hoy.
  - Crear `claim_state_history` con el id del nuevo reclamo y claim_state_pending: "Pending" y created_date: fecha de hoy.
  - Se envía un mensaje "send_notification", con tipo claim_created_sussesfuly, para que el servicio de notification realice la notificación correspondiente.

  
#### CU-002: Eliminar Reclamo
**Descripción:** Permite que el usuario pueda eliminar el reclamo realizado.

**Precondición:**
- Que exista un reclamo creado y en estado "Pending"
- Que se haya realizado petición de eliminar Reclamo.

**Camino Normal:**
- Me llega el claim_id como parametro de la ruta.
- Obtener el `_id_user` del usuario usando el token.
- Buscar el reclamo con claim_id ingresado y ultimo estado estado = "Pending"
- buscar el estado `Deleted` en la Enum claim_state
- crear una nueva instancia de state_claim_history con:
  - claim_state_history_claim_id: claim_id
  - claim_state_history_name : "Deleted"
  - created_date: fecha de hoy
- guardar la instancia
- Se envía un mensaje "send_notification", con tipo claim_deleted, para que el servicio de notification realice la notificación correspondiente.

  
#### CU-003: Visualizar reclamos
**Descripción:** Permite al usuario o administrador visualizar el listado de  reclamos, pudiendo filtrarlos por estado.

**Precondición:**
- Que el usuario tenga un token válido.
- Que exista un reclamo creado.
- Que se haya realizado petición Ver listado de reclamos.

**Camino Normal:**
- Obtener el `_id_user` del usuario usando el token.
- Si el usuario es cliente
- Buscar todos los reclamos asociados al usuario (si se ingresó un estado en el filtro, se realiza la busqueda teniendo en cuenta el estado ingresado)
- mostrar: Nro de reclamo, nro de orden, tipo de reclamo,  descripción, answer y estado

**Camino Alternativo:**
Si el usuario es Administador
- Buscar todos los reclamos (si se ingresó un estado filtro, se realiza la busqueda teniendo en cuenta el estado), por defecto solo busca los que tienen estado pendiente
- mostrar: Nro de reclamo, nro de orden, tipo de reclamo,  descripción, answer y estado


#### CU-003: Resolver reclamo
**Descripción:** Permite al Admin resolver el reclamo.

**Precondición:**
- Que el usuario tenga un token válido.
- Que exista un reclamo creado en estado "Pending".
- Que se haya realizado petición Resolver de reclamo.

**Camino Normal:**
- Obtener el `_id_user` del usuario usando el token.
- Buscar buscar el reclamo para el claim_id recibido
- Si isAccepted = true
- Obtener el estado "Accepted" de la Enum claim_state
- crear instancia de claim_state_history: con order_id, claim_state: Accepted, created_date: date Now,
- setear answer a Claim
- setear resolution_date = fecha de hoy
- Se envía un mensaje "send_notification", con tipo claim_accepted, para que el servicio de notification realice la notificación correspondiente.

**Camino Alternativo:**
- Si isAccepted = false
- Obtener el estado "Canceled" de la Enum claim_state
- crear instancia de claim_state_history: con order_id, claim_state:Canceled, created_date: date Now,
- setear answer a Claim
- setear resolution_date = fecha de hoy
- Se envía un mensaje "send_notification", con tipo claim_canceled, para que el servicio de notification realice la notificación correspondiente.


#### CU-004: Solicitar cancelacion de compra- RabbitMq
**Descripción:** Permite al usuario cancelar la compra realizada

**Precondición:**
- Que el usuario tenga un token válido.
- Que exista un reclamo creado en estado "Accepted".
- Que se haya realizado petición "Solicitar cancelación de compra"


**Camino Normal:**
- Obtener el `_id_user` del usuario usando el token.
- Buscar buscar el reclamo para el claim_id recibido cuyo último estado "Accepted"
- Obtener el order_id
- Enviar mensaje asincrono al servico de Order, para que porcece la cancelacion.
- Se envía un mensaje asincrono "send_notification", con tipo order_canceled_pending, para que el servicio de notification realice la notificación correspondiente.
- Busco en claim_state_enum el estado "Deleted"
- creo una instancia de claim_state_history con: claim_id, stateName: "Deteted" , created_date: fecha de hoy 




  
  
### Diagrama de estados del reclamo

![image](https://github.com/user-attachments/assets/cc7376b6-2c97-47dc-80e7-b4cb35a3e362)


### Modelo de Datos

#### claim
| Column           | Type   | Description                                                                     |
|------------------|--------|---------------------------------------------------------------------------------|
| `claim_id`       | String | Identificador del evento                                                        |
| `orderId`        | String | Identificador de la orden                                                       |
| `claim_type_id`  | String | Parametriza al reclamo dentro de un listado de tipos de reclamo precargado       |
| `description`    | String | Campo para que el cliente agregue un texto explicando el motivo del reclamo      |
| `resolutionDate` | Date   | Campo que contiene la fecha de resolución del reclamo, inicialmente vacío       |
| `anwer`          | string | Campo que contiene un link a un archivo que continene doumentación adjunta para fundamentar la decisión|
| `createdDate`    | Date   | Contiene la fecha de creación del reclamo                                        |
| `editedDate`     | Date   | Contiene la fecha de modificación del reclamo                                    |
| `deletedDate`    | Date   | Contiene la fecha de eliminación del reclamo                                     |


#### claim_state_history
| Column                   | Type   | Description                                        |
|--------------------------|--------|----------------------------------------------------|
| `claim_state_history_id` | String | Identificador del estado por el que ha pasado el reclamo |
| `claim_state`            | String | Estado                                             |
| `claim_id`               | String | Identificador del reclamo                          |
| `created_date`           | Date   | Fecha en que se porduce el cambio de estado        |


#### claim_state_enum
{
"claim_state_Pending": "Pending",
"claim_state_Deleted": "Deleted",
"claim_state_Accepted": "Accepted",
"claim_state_Canceled": "Canceled",
}

#### claim_type_enum
{
"claim_type_delay": "Delay",
"claim_type_product_breakage": "Product breakage",
"claim_type_insatisfaction": "insatisfaction",
"claim_type_warranty: "Warranty",
}

#### claim_message_enum
{
"claim_type_delay": "Delay",
"claim_type_product_breakage": "Product breakage",
"claim_type_insatisfaction": "insatisfaction",
"claim_type_warranty: "Warranty",
}


### Interfaz REST

**Crear Reclamo**
- `POST ('/v1/claims')`
  - **Header**
    ``` 
    Authorization: Bearer {token}
    ```
  - **Body**
    ```json
    {
      "_id_order": "id",
      "claim_type": "id",
      "claim_description": "string"
    }
    ```
  - **Response**
    - `200 OK`
      ```json
      { "message": "Reclamo creado exitosamente" }
      ```
    - `400 BAD REQUEST`
      ```json
      { "error_message": "{error_message" }
      ```
    - `401 Unauthorized`
      ```json
      { "error_message": "{error_message}" }
      ```
    - `404 NOT FOUND`
      ```json
      { "error_message": "{error_message}" }
      ```
    - `500 Server Error`
      ```json
      { "error_message": "{error_message}" }
      ```

**Eliminar Reclamo**
- `DELETE ('/v1/claims/{claim_id}')`
  - **Header**
    ``` 
    Authorization: Bearer {token}
    ```
  - **Uri Params**
    ``` 
    claim_id: string (required)
    ```
  - **Response**
    - `200 OK`
      ```json
      { "message": "Reclamo eliminado exitosamente" }
      ```
    - `400 BAD REQUEST`
      ```json
      { "error_message": "{error_message}" }
      ```
    - `401 Unauthorized`
      ```json
      { "error_message": "{error_message}" }
      ```
    - `404 NOT FOUND`
      ```json
      { "error_message": "El reclado solicitado no existe" }
      ```
    - `500 Server Error`
      ```json
      { "error_message": "{error_message}" }
      ```

**Mostrar listado de reclamos**
- `GET ('/v1/claims/')`
  - **Header**
    ``` 
    Authorization: Bearer {token}
    ```
  - **Query Params**
    ``` 
    claim_state: string
    ```
  - **Response**
    - `200 OK`
      ```json
      {
        "Listado de reclamos": [
          { "claim_id": "claim1",
         "order_id":"Oder1",
          "claim_type": "type1",
          "description": "desc1",
          "created_date": "date1" },
          "state": "state1" },
         { "claim_id": "claim2",
         "order_id":"Oder2",
          "claim_type": "type2",
          "description": "desc2",
          "created_date": "date2" },
          "state": "state2", }
        ]
      }
      ```
    - `400 BAD REQUEST`
      ```json
      { "error_message": "{error_message}" }
      ```
    - `401 Unauthorized`
      ```json
      { "error_message": "{error_message}" }
      ```
    - `404 NOT FOUND`
      ```json
      { "error_message": "{error_message}" }
      ```
    - `500 Server Error`
      ```json
      { "error_message": "{error_message}" }
      ```

**Resolver reclamo**
- `PUT ('/v1/claims/{claim_id})`
 - **Header**
    ``` 
    Authorization: Bearer {token}
    ```
  - **Uri Params**
    ``` 
    claim_id: string (required)
    ```
- **Response**
    - `200 OK`
      ```json
      { "message": "Reclamo aceptado exitosamente" }/{ "message": "Reclamo rechazado exitosamente" }
      ```
    - `400 BAD REQUEST`
      ```json
      { "error_message": "{error_message}" }
      ```
    - `401 Unauthorized`
      ```json
      { "error_message": "{error_message}" }
      ```
    - `404 NOT FOUND`
      ```json
      { "error_message": "El reclado solicitado no existe" }
      ```
    - `500 Server Error`
      ```json
      { "error_message": "{error_message}" }
      ```





**Ver detalle del reclamo**
- `GET ('/v1/claims/{claim_id})`
  - **Header**
    ``` 
    Authorization: Bearer {token}
    ```
  - **Response**
    - `200 OK`
      ```json
      { "message": "Claim r" }
      ```
    - `400 BAD REQUEST`
      ```json
      { "error_message": "{error_message}" }
      ```
    - `401 Unauthorized`
      ```json
      { "error_message": "{error_message}" }
      ```
    - `404 NOT FOUND`
      ```json
      { "error_message": "{error_message}" }
      ```
    - `500 Server Error`
      ```json
      { "error_message": "{error_message}" }
      ```

