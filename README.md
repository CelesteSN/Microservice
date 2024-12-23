## Microservicio: Reclamos sobre órdenes

El usuario reclama algo de la orden, permitiendo cancelarla si no se resuelve el reclamo correctamente. El administrador consulta y resuleve los reclamos


### Casos de Uso

#### CU-001: Crear Reclamo
**Descripción:** Permite que el usuario pueda realizar un reclamo sobre una orden.

**Precondición:**
- Que haya realizado una compra (que exista la orden y que este en estado "payment_defined").
- Que se haya realizado petición de Reclamar.

**Camino Normal:**
  - Me llega en el body: `id_order`, `claim_type` y `claim_description`.
  - Obtener el `id_user` del usuario usando el token del usuario.
  - Validar que el campo `claim_description` sea distinto de null.
  - Validar que la cantidad de palabras sea menor a 400 y mayor de 5.
  - Validar que el campo `claim_type` sea distinto de null.
  - Obtener la Orden mediante el envió del mensaje al servicio de Order con la propiedad `_id_order` y el `state = PAYMENT_DEFINED`.
  - Obtener el estado "Pending" desde la Enum  `claim_state_enum`.
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
- Obtener el `id_user` del usuario usando el token.
- Buscar el reclamo con claim_id ingresado y ultimo estado estado = "Pending"
- buscar el estado `Deleted` en claim_state_enum
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
- Obtener el `id_user` del usuario usando el token.
- se verifica si llego en el query params un estado, para realizar el filtrado
- Con el token recibido solicito a traves del envio de un mensaje al servicio de Auth el usuario logueado.
- verifico si en el atributo permissions(de tipo array de string) hay un string de tipo "admin"
- Si no existe (el usuario es cliente)
- Buscar todos los reclamos asociados al usuario (si se ingresó un estado en el filtro, se realiza la busqueda teniendo en cuenta el estado ingresado)
- mostrar: Nro de reclamo, nro de orden, tipo de reclamo,  descripción, answer y estado

**Camino Alternativo:**
Si existe ( el usuario es Administador)
- Buscar todos los reclamos (si se ingresó un estado filtro, se realiza la busqueda teniendo en cuenta el estado), por defecto solo busca los que tienen estado pendiente
- mostrar: Nro de reclamo, nro de orden, tipo de reclamo,  descripción, answer y estado


#### CU-004: Resolver reclamo
**Descripción:** Permite al Admin resolver el reclamo.

**Precondición:**
- Que el usuario tenga un token válido.
- Que exista un reclamo creado en estado "Pending".
- Que se haya realizado petición Resolver de reclamo.

**Camino Normal:**
- Obtener el `id_user` del usuario usando el token.
- Buscar buscar el reclamo para el claim_id recibido
- Si isAccepted = true
- Obtener el estado "Accepted" de la Enum claim_state_enum
- crear instancia de claim_state_history: con order_id, claim_state: Accepted, created_date: date Now,
- setear answer a Claim
- setear resolution_date = fecha de hoy
- Se envía un mensaje "send_notification", con tipo claim_accepted, para que el servicio de notification realice la notificación correspondiente.

**Camino Alternativo:**
- Si isAccepted = false
- Obtener el estado "Canceled" de la Enum claim_state_enum
- crear instancia de claim_state_history: con order_id, claim_state:Canceled, created_date: date Now,
- setear answer a Claim
- setear resolution_date = fecha de hoy
- Se envía un mensaje "send_notification", con tipo claim_canceled, para que el servicio de notification realice la notificación correspondiente.


#### CU-005: Solicitar cancelacion de compra- RabbitMq
**Descripción:** Permite al usuario cancelar la compra realizada

**Precondición:**
- Que el usuario tenga un token válido.
- Que exista un reclamo creado en estado "Accepted".
- Que se haya realizado petición "Solicitar cancelación de compra"


**Camino Normal:**
- Obtener el `id_user` del usuario usando el token.
- Buscar el reclamo para el claim_id recibido cuyo último estado "Accepted"
- Obtener el order_id asociado
- Enviar mensaje asincrono al servico de Order, para que procese la cancelación.
- Se envía un mensaje asincrono "send_notification", con tipo claim_pending_return, para que el servicio de notification realice la notificación correspondiente.
- Busco en claim_state_enum el estado "Discharged"
- creo una instancia de claim_state_history con: claim_id, stateName: "Discharged" , created_date: fecha de hoy 




  
  
### Diagrama de estados del reclamo

![image](https://github.com/user-attachments/assets/eaf42ed0-3781-4f40-bb6b-b8f7b92d157c)



### Modelo de Datos

#### claim
| Column           | Type   | Description                                                                     |
|------------------|--------|---------------------------------------------------------------------------------|
| `claim_id`       | String | Identificador del reclamo                                                       |
| `orderId`        | String | Identificador de la orden                                                       |
| `userId`         | String | Identificador del usuario                                                       |
| `claim_number`   | String | Para el negocio                                                                 |
| `claim_type`     | String | tipo de reclamo                                                                 |

| `claim_description`    | String | Campo para que el cliente agregue un texto explicando el motivo del reclamo     |
| `resolution_date` | Date   | Campo que contiene la fecha de resolución del reclamo, inicialmente vacío       |
| `answer`          | string | Campo que contiene un link a un archivo que continene doumentación adjunta para fundamentar la decisión, inicialmente vacio|
| `createdDate`    | Date   | Contiene la fecha de creación del reclamo                                       |
| `editedDate`     | Date   | Contiene la fecha de modificación del reclamo                                   |
| `deletedDate`    | Date   | Contiene la fecha de eliminación del reclamo                                    |


#### claim_state_history
| Column                   | Type   | Description                                        |
|--------------------------|--------|----------------------------------------------------|
| `claim_state_history_id` | String | Identificador del estado por el que ha pasado el reclamo |
| `claim_state_name`       | String | Estado                                             |
| `claim_id`               | String | Identificador del reclamo                          |
| `created_date`           | Date   | Fecha en que se porduce el cambio de estado        |


#### claim_state_enum
{
"claim_state_Pending": "Pending",
"claim_state_Deleted": "Deleted",
"claim_state_Accepted": "Accepted",
"claim_state_Canceled": "Canceled",
"claim_state_Canceled": "Discharged",

}

#### claim_type_enum
{
"claim_type_delay": "Delay",
"claim_type_product_breakage": "Product breakage",
"claim_type_insatisfaction": "insatisfaction",
"claim_type_warranty: "Warranty",
}


### Interfaz REST

**Crear Reclamo** (Usuario)
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

**Eliminar Reclamo** (Usuario)
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

**Mostrar listado de reclamos** (Usuario y Administrador)
- `GET ('/v1/claims/')`
  - **Header**
    ``` 
    Authorization: Bearer {token}
    ```
  - **Query Params**
    ``` 
    state: string
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
          "created_date": "date1",
          "state": "state1" },
         { "claim_id": "claim2",
         "order_id":"Oder2",
          "claim_type": "type2",
          "description": "desc2",
          "created_date": "date2",
          "state": "state2" }
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

**Resolver reclamo** (Administrador)
- `PUT ('/v1/claims/{claim_id})`
 - **Header**
    ``` 
    Authorization: Bearer {token}
    ```
  - **Uri Params**
    ``` 
    claim_id: string (required)
    ```
    - **Body**
    ``` 
    isAccept: boolean
    answer: string
    ```
- **Response**
    - `200 OK`
      ```json
      { "message": "Reclamo aceptado/rechazado exitosamente" }
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





**Solicitar cancelacion de compra** (Usuario)
- `POST ('/v1/claims/{claim_id}/return)`
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
      { "message": "La devolucion esta siendo procesada, revise su email en 24 hs" }
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
### Interfaz asincronica (rabbit)
**Cancelación de la orden:**
Envia por medio del exchange direct claim_accepted a través de la queue claim_order_canceled body
  ```json
{
	"orderId": "23423",
	"userId": "23423",
	"status": "Canceled"
}
  ```
**Pedido de notificación:**
Envía por medio del exchange direct send_notification a través de la queue claim_pending_return body
  ```json

{
	"notificationType": "claim_pending_return",
   	 "userId": "234123",
	"orderId": "12341324"
}
  ```
