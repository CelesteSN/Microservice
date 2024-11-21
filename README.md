## Microservicio: Reclamos sobre órdenes

El usuario reclama algo de la orden, permitiendo aditarla o eliminarla en un periodo de tiempo determinado. Ademas, permite al usuario visualizar sus reclamos y cancelar la orden en caso de no estar satisfecho con el resultado del reclamo.

### Casos de Uso

#### CU-001: Crear Reclamo
**Descripción:** Permite que el usuario pueda realizar un reclamo, solo dentro de los 30 días de realizada la compra.

**Precondición:**
- Que haya realizado una compra (que exista la orden y que este en estado "payment_defined").
- Que se haya realizado petición de Reclamar.

**Camino Normal:**
  - Me llega en el body: `_id_order`, `claim_type` y `claim_description`.
  - Tomar de Redis el `_id_user` del usuario usando el token del usuario.
  - Validar que el campo `claim_description` sea distinto de null.
  - Validar que la cantidad de palabras sea menor a 400 y mayor de 5.
  - Validar que el campo `claim_type` sea distinto de null.
  - Obtener la Orden mediante el envió del mensaje asíncrono al servicio de Order con la propiedad `_id_order` y el `state = PAYMENT_DEFINED`.
  - Recibir mensaje asíncrono del servicio de order.
  - Validar que el usuario que quiere crear el reclamo esté en la orden.
  - Validar que la fecha de la orden este dentro del periodo permitido para realizar reclamos
  - Buscar el estado "Pending" en `claim_state`.
  - Crear reclamo con: id de la orden, tipo de reclamo, descripción,   fecha de creación de hoy.
  - Crear un `claim_state_history` con el id del nuevo reclamo y el id del estado "Pending".
  - Se envía un mensaje "send_notification", con tipo claim_created, para que el servicio de notification realice la notificación correspondiente.


**Camino Alternativo 1:**
- La fecha se excedio de los 30 dias
- Se envía un mensaje "send_notification", con tipo claim_rejected, para que el servicio de notification realice la notificación correspondiente.

**Camino Alternativo 2:**
- El usuario logueado no se encuentra en la orden a reclamar
- Se envía un mensaje "send_notification", con tipo claim_rejected, para que el servicio de notification realice la notificación correspondiente.

  
#### CU-002: Modificar Reclamo
**Descripción:** Permite que el usuario pueda modificar el reclamo realizado, solo puede ser editado hasta una hora después de creado (claim en estado `Pending`).

**Precondición:**
- Que exista un reclamo creado y en estado "Pending".
- Que se haya realizado petición de modificar Reclamo.

**Camino Normal:**
- Llega el claim_id como parametro de la ruta
- Llega por el body: `_id_order`, `claim_type` y `claim_description`.
- Tomar de Redis el `_id_user` del usuario usando el token del usuario.
- Buscar el reclamo con claim_id ingresado y el estado "Pending" (indica q esta dentro del tiempo para poder ser editado)
- Validar que el campo `claim_description` sea distinto de null.
- Validar que la cantidad de palabras sea menor a 400 y mayor de 5.
- Validar que el campo `claim_type` sea distinto de null.
- Setear al reclamo con claim_id los atributos ingresados por el body validados
- Guardar el reclamo modificado
- Se envía un mensaje "send_notification", con tipo claim_edited, para que el servicio de notification realice la notificación correspondiente.

**Camino Alternativo 1:**
 Me llega el claim_id como parametro de la ruta
- Me llega por el body: `_id_order`, `claim_type` y `claim_description`.
- Tomar de Redis el `_id_user` del usuario.
- Buscar el reclamo con claim_id ingresado y estado "Pending"
- Verificar la fechay hora, para saber si es posible modificar el reclamo.
- El tiempo de modificación se excedio,
- Se envía un mensaje "send_notification", con tipo claim_rejected, para que el servicio de notification realice la notificación correspondiente.


#### CU-003: Eliminar Reclamo
**Descripción:** Permite que el usuario pueda eliminar el reclamo realizado, solo puede ser eliminado hasta una hora después de creado, sino no se permite.

**Precondición:**
- Que exista un reclamo creado y en estado "Pending"
- Que se haya realizado petición de eliminar Reclamo.

**Camino Normal:**
- Me llega el claim_id como parametro de la ruta.
- Tomar de Redis el `_id_user` del usuario usando el token.
- Buscar el reclamo con claim_id ingresado y estado "Pending"
- Verificar la fecha y hora, para saber si es posible eliminar el reclamo. SI es posible:
- Validar que el usuario q quiere eliminar reclamo sea el que aparece en la orden??????
- buscar el estado `deleted` en claim_state
- crear una nueva instancia de state_claim_history con:
  - claim_id
  - claim_state_id
- guardar la instancia
- Se envía un mensaje "send_notification", con tipo claim_deleted, para que el servicio de notification realice la notificación correspondiente.

**Camino Alternativo:**
- LLega el claim_id por el parametro de la ruta
- Tomar de Redis el `_id_user` del usuario usando el token.
- Buscar el reclamo con claim_id ingresado
- Verificar la fechay hora, para saber si es posible eliminar el reclamo.
- El tiempo de eliminacón se excedió
- Se envía un mensaje "send_notification", con tipo claim_rejected, para que el servicio de notification realice la notificación correspondiente.

  
#### CU-004: Mostrar reclamos
**Descripción:** Permite al usuario visualizar el listado de sus  reclamos, pudiendo filtrarlos por estado.

**Precondición:**
- Que el usuario tenga un token válido.
- Que exista un reclamo creado.
- Que se haya realizado petición Ver listado de reclamos.

**Camino Normal:**
- Tomar de Redis el `_id_user` del usuario usando el token.
- Obtener la Orden mediante el envió del mensaje asíncrono al servicio de Order con la propiedad `_id_user` y el `state = PAYMENT_DEFINED`.
- Por cada orden buscar todos los reclamos asociados
- Por cada uno buscar su estado
- mostrar: Nro de reclamo, nro de orde, tipo de reclamo,  descripción y estado

**Camino Alternativo:**
- Tomar de Redis el `_id_user` del usuario usando el token.
- buscar todos 
- Buscar todas las ordenes que contengan ese `_id_user` mediante una petición asincrona en el servicio de orden
- Por cada orden buscar todas los reclamos asociados y que esten en estado "Under Review"
- Se envía un mensaje "send_notification", con tipo claim_not_found, para que el servicio de notification realice la notificación correspondiente.

#### CU-005: Ver detalle del reclamo
**Descripción:** Permite al usuario acceder a un reclamos especifico para consultar su estado. (Puede haber llegado desde una notificación o puede ser accedido desde el listado)

**Precondición:**
- Que el usuario tenga un token válido.
- Que exista un reclamo creado.
- Que se haya realizado petición Ver detalle del reclamo

**Camino Normal:**
- Llega claim_id por el parametro de la ruta
- Busco el reclamo
- Busco el ultmo estado estado asociado
- Muestro el nro de reclamo, tipo de reclamo, descripcion, respuesta, fecha de resolución , estado
- Si el estado en Canceled, no puedo cancelar la Order


**Camino Alternativo:**
- Llega claim_id por el parametro de la ruta
- Busco el reclamo
- Busco su estado asociado
- Muestro el nro de reclamo, tipo de reclamo, descripcion, respuesta, fecha de resolución , estado
- Si el estado es "Accepted"
- muestro la opción de solicitar devolucion/cancelación
  
### Diagrama de estados del reclamo
![image](https://github.com/user-attachments/assets/518d05c7-8f8f-4e66-bdfa-f7616f6db48fzz


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

#### claim_state
| Column              | Type   | Description                                             |
|---------------------|--------|---------------------------------------------------------|
| `claim_state_id`    | String | Identificador del estado                                |
| `claim_state_name`  | String | Nombre del estado                                       |
| `claim_state_description` | String | Explica a qué se refiere el estado                |
| `created_date`      | Date   | Fecha de creación                                       |
| `edited_date`       | Date   | Fecha de modificación                                   |
| `deleted_date`      | Date   | Fecha de eliminación                                    |

#### claim_state_history
| Column                   | Type   | Description                                        |
|--------------------------|--------|----------------------------------------------------|
| `claim_state_history_id` | String | Identificador del estado por el que ha pasado el reclamo |
| `claim_state_id`         | String | Identificador del estado                           |
| `claim_id`               | String | Identificador del reclamo                          |
| `created_date`           | Date   | Fecha en que se porduce el cambio de estado        |


### Interfaz Rest

**Crear Reclamo**
- `POST ('/v1/claim/createClaim')`
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
      { "message": "Create claim successful" }
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

**Modificar Reclamo**
- `PUT ('/v1/claims/modifyClaim/:id')`
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
      { "message": "Modified claim successful" }
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

**Eliminar Reclamo**
- `DELETE ('/v1/claims/deleteClaim/:id')`
  - **Header**
    ``` 
    Authorization: Bearer {token}
    ```
  - **Response**
    - `200 OK`
      ```json
      { "message": "Claim deleted successfully" }
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

**Mostrar listado de reclamos**
- `GET ('/v1/claims/')`
  - **Header**
    ``` 
    Authorization: Bearer {token}
    ```
  - **Response**
    - `200 OK`
      ```json
      {
        "Listado de reclamos": [
          { "Claim_number": "claim1",  "order_number":"Oder1", "type1""Claim_type": "type1", "Description": "desc1", "Claim_created_date": "date1" },
          { "Claim_number": "claim2",  "order_number": "Order2" "Claim_type": "type2", "Description": "desc2", "Claim_created_date": "date2" }
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

**Ver detalle del reclamo**
- `GET ('/v1/claims/resolve_claim/:id')`
  - **Header**
    ``` 
    Authorization: Bearer {token}
    ```
  - **Response**
    - `200 OK`
      ```json
      { "message": "Claim resolved successfully" }
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

