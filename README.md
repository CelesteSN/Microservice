## Microservicio: Reclamos sobre órdenes

El usuario realiza reclamo/s sobre una orden, permitiendo cancelarla si no se resuelve el reclamo correctamente. El administrador consulta y resuleve los reclamos


### Casos de Uso

#### CU-001: Crear Reclamo
**Descripción:
** Permite que el usuario pueda realizar un reclamo sobre una orden.

**Precondición:**
- Que haya realizado una compra (que exista la orden y que este en estado "payment_defined").
- Que se haya realizado petición de Reclamar.

**Camino Normal:**
  - Me llega en el body: `id_order`, `claim_type` y `claim_description`.
  - Obtener el `id_user` del usuario usando el token del usuario.
  - Validar que el campo `claim_description` sea distinto de null.
  - Validar que la cantidad de palabras sea menor a 400.
  - Validar que el campo `claim_type` sea distinto de null y que sea un tipo válido.
  - Obtener la Orden a traves del endpoind  rest del servicio de Order por id.
  - Validar que la orden este en estado `PAYMENT_DEFINED`.
  - Crear claim con: user_id, order_id, claim_type, description, created_date: fecha de hoy.
  - Asignar al estado el nombre "Pending" y colocar isActive en true y fecha actual.
  - Guardar el reclamo
  - Se envía un mensaje al exchange notification a la queue "send_notification", con action: nuevo reclamo, para que el servicio de notification realice la notificación al administrador.
  - Enviar mensaje "Reclamo creado exitosamente, se notificado el administrador en 24 hs".
 
#### CU-002: Eliminar Reclamo
**Descripción:
** Permite que el usuario pueda eliminar el reclamo dentro de las 24 hs de realizado.

**Precondición:**
- Que exista un reclamo creado y en estado "Pending".
- Que se haya realizado petición de eliminar Reclamo.

**Camino Normal:**
- Me llega el claim_id como parametro de la ruta.
- Obtener el `id_user` del usuario usando el token.
- Buscar el reclamo con claim_id ingresado y
- Validar último estado estado = "Pending"
- Eliminar reclamo
- Enviar mensaje "El reclamo se eliminó exitosamente".
- Se envía un mensaje al exchange notification a la queue "delete_notification", con action: Reclamo eliminado, para que el servicio de notification deje sin efecto la notificación de nuevo reclamo.
  
#### CU-003: Visualizar reclamos
**Descripción:
** Permite al usuario o administrador visualizar el listado de  reclamos, pudiendo filtrarlos por estado y por número de orden.

**Precondición:**
- Que el usuario tenga un token válido.
- Que exista un reclamo creado.
- Que se haya realizado petición Ver listado de reclamos.

**Camino Normal:**
- Obtener el `id_user` del usuario usando el token.
- Verifica si llego en el query params un estado y/o numero de orden, para realizar el filtrado
- Con el token recibido solicito obtengo el usuario y verifico si en el atributo permissions(de tipo array de string) hay un string de tipo "admin"
- Si no existe (el usuario es cliente)
- Buscar todos los reclamos asociados al usuario (si se ingresó filtros, se realiza la busqueda teniendolos en cuenta)
- mostrar: Nro de reclamo, nro de orden, userId, tipo de reclamo,  descripción, answer y el historial de estado/s

**Camino Alternativo:**
Si existe ( el usuario es Administador)
- Buscar todos los reclamos existentes(si se ingresó filtros, se realiza la busqueda teniendolos en cuenta)
- mostrar: Nro de reclamo, nro de orden, tipo de reclamo,  descripción, answer y estado


#### CU-004: Resolver reclamo
**Descripción:**
Permite al Admin resolver el reclamo.

**Precondición:**
- Que el usuario tenga un token válido.
- Que exista un reclamo creado en estado "Pending" o "InProgress".
- Que se haya realizado petición Resolver de reclamo.

**Camino Normal:**
- Obtener el `id_user` del usuario usando el token.
- Buscar el reclamo para el claim_id recibido
- Verificar que el estado ingresado sea válido
- Si status = "InProgress"
- Por cada estado existente asociado al reclamo, colocar la variable isActive en false
- Agregar un nuevos estado con: nombre: InProgress, isActive: true, createddate: dateNow
- setear answer: "El reclamos esta siendo investigado por nuestro equipo"
- crear status con: nombre: Accepted, isActive: true created_date: date Now,
- Guardar el reclamo
- Se envía un mensaje "send_notification", con action "reclamo en proceso", para que el servicio de notification realice la notificación correspondiente.
- Enviar mensaje: Reclamo en proceso.
  
  **Camino Alternativo:**
-  Si status = "Accepted" o "Canceled"
- Por cada estado existente asociado al reclamo, colocar la variable isActive en false
- Agregar un nuevos estado con: nombre: "Accepted" o "Canceled", isActive: true, createddate: dateNow
- setear answer a Claim
- setear resolution_date = fecha de hoy
- Guardar el reclamo
- Se envía un mensaje "send_notification", con tipo reclamo resuelto, para que el servicio de notification realice la notificación correspondiente.
- Enviar mensaje: Reclamo resuelto exitosamente.

#### CU-005: Solicitar cancelacion de compra- 
**Descripción:** Permite al usuario cancelar la orden

**Precondición:**
- Que el usuario tenga un token válido.
- Que exista al menos un reclamo creado en estado "Accepted".
- Que se haya realizado petición "Solicitar cancelación de compra"


**Camino Normal:**

- Se recibe un mensaje asincrono a traves de la queue "order_canceled", para que el microservicio de reclamos de de baja todos los reclamos asociados al número de orden recibido.
- Se buscan todos los reclamos asciados al número de orden recibido
- Por cada reclamo:
  	- Se le asigna a cada estado isActive: false
  	- Se le asigna un nuevo estado "Discharged", isActive: true, created: DateNow
  	- Se guardan los cambios realizados
- Se muestra el mensaje "Se cancelaron x reclamos asociados a la orden número: xxxx);
 
  
### Diagrama de estados del reclamo

![image](https://github.com/user-attachments/assets/051c09bb-9833-4020-b895-e076fe7fda04)




### Modelo de Datos

#### claim
| Column           | Type   | Description                                                                     |
|------------------|--------|---------------------------------------------------------------------------------|
| `claim_id`       | String | Identificador del reclamo                                                       |
| `orderId`        | String | Identificador de la orden                                                       |
| `userId`         | String | Identificador del usuario                                                       |
| `claim_number`   | String | Para el negocio                                                                 |
| `claim_type`     | String | tipo de reclamo                                                                 |
| `status `        | ClaimStatusHistory[] | Lista de estados por los que ha pasado un reclamo                 |
| `claim_description`| String | Campo para que el cliente agregue un texto explicando el motivo del reclamo   |
| `resolution_date` | Date   | Campo que contiene la fecha de resolución del reclamo, inicialmente vacío      |
| `answer`          | string | Campo que contiene un link a un archivo que continene doumentación adjunta para fundamentar la decisión, inicialmente vacio|
| `createdDate`    | Date   | Contiene la fecha de creación del reclamo                                       |
| `editedDate`     | Date   | Contiene la fecha de modificación del reclamo                                   |
| `deletedDate`    | Date   | Contiene la fecha de eliminación del reclamo                                    |


#### claimStatusistory
| Column                   | Type   | Description                                        |
|--------------------------|--------|----------------------------------------------------|
| `claimStatusHistory_id`  | String | Identificador del estado por el que ha pasado el reclamo |
| `claim_state_name`       | String | Estado                                             |
| `isActive`               | String | Identificador del reclamo                          |
| `created_date`           | Date   | Fecha en que se porduce el cambio de estado        |


#### claim_state_enum
{
"claim_state_Pending": "Pending",
"claim_state_Deleted": "Deleted",
"claim_state_InProgress": "InProgress",
"claim_state_Accepted": "Accepted",
"claim_state_Canceled": "Canceled",
"claim_state_Canceled": "Discharged",

}

#### claim_type_enum
{
"claim_type_delay": "Delay",
"claim_type_product_breakage": "Damage",
"claim_type_insatisfaction": "Insatisfaction",
"claim_type_warranty: "Warranty",
"claim_type_warranty: "Other",

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


**Pedido de notificación:**
Envía por medio del exchange direct notification  a través de la queue send_notification 
  ```json

{
	"orderId": "12341324",
	"claimId": "12341324",
	"action": "Nuevo reclamo"
}
  ```
 ```json
{
	"orderId": "12341324",
	"claimId": "12341324",
	"action": "En proceso"
}
  ```
 ```json
{
	"orderId": "12341324",
	"claimId": "12341324",
	"action": "Reclamo resuelto"
}
  ```

Envía por medio del exchange direct notification a través de la queue delete_notification 
 ```json

{
	"orderId": "12341324",
	"claimId": "12341324",
	"action": "Reclamo eliminado"
}
  ```
**Cancelación de la orden:**
Recibe por medio del exchange direct claim_exxhange a través de la queue ordenes_canceladas body
  ```json
{
	"orderId": "23423"
}
  ```

