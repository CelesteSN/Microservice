## Microservicio: Reclamos sobre órdenes

El usuario reclama algo de la orden, permitiendo cancelarla si no se resuelve el reclamo correctamente.

### Casos de Uso

#### CU1: Crear Reclamo
**Descripción:** Permite que el usuario que compró un producto pueda realizar un reclamo al fabricante/vendedor del mismo, solo dentro de los 30 días de generada la orden.

**Precondición:**
- Que el usuario esté registrado.
- Que se haya validado el token del usuario.
- Que haya realizado una compra (que exista la orden).
- Que se haya realizado petición de Reclamar.

**Camino Normal:**
- Me llega por el body: `_id_order`, `claim_type` y `claim_description`.
- Tomar de Redis el `_id_user` del usuario.
- Validar que el campo `claim_description` sea distinto de null.
- Validar que la cantidad de palabras sea menor a 400 y mayor de 5.
- Validar que el campo `claim_type` sea distinto de null.
- Enviar mensaje asíncrono al servicio de Order con la propiedad `_id_order` y el `state = PAYMENT_DEFINED`.
- Recibir mensaje asíncrono del servicio de order.
- Validar que el usuario que quiere crear el reclamo esté en la orden.
- Buscar el estado pendiente en `state`.
- Crear `claim` con el id del usuario, id de la orden, tipo de reclamo, descripción, fecha de creación de hoy.
- Crear un `claim_state` con el id del reclamo y el id del estado pendiente.
- Devolver un mensaje de retorno “Create Claim successfully”.

**Camino Alternativo:**

#### CU2: Modificar Reclamo
**Descripción:** Permite que el usuario pueda modificar el reclamo realizado, solo puede ser editado hasta una hora después de creado (`pending`), sino no se permite.

**Precondición:**
- Que el usuario tenga un token válido.
- Que exista un reclamo creado.
- Que se haya realizado petición de modificar Reclamo.

**Camino Normal:**

**Camino Alternativo:**

#### CU3: Eliminar Reclamo
**Descripción:** Permite que el usuario pueda eliminar el reclamo realizado, solo puede ser eliminado hasta una hora después de creado, sino no se permite.

**Precondición:**

**Camino Normal:**

**Camino Alternativo:**

#### CU4: Mostrar reclamos
**Descripción:** Permite al usuario vendedor/fabricante visualizar el listado de reclamos de sus productos, para poder gestionarlos.

**Precondición:**

**Camino Normal:**

**Camino Alternativo:**

#### CU5: Resolver Reclamo
**Descripción:** Permite al usuario vendedor/fabricante acceder al reclamo para poder analizarlo y resolverlo, para poder darle una respuesta al comprador.

**Precondición:**

**Camino Normal:**

**Camino Alternativo:**

#### CU: Calcular reputación del vendedor

### Diagrama de estados del reclamo

### Modelo de Datos

#### claim
| Column           | Type   | Description                                                                     |
|------------------|--------|---------------------------------------------------------------------------------|
| `claim_id`       | String | Identificador del evento                                                        |
| `orderId`        | String | Identificador de la orden                                                       |
| `claim_type_id`  | String | Parametriza al reclamo dentro de un listado de tipos de reclamo precargado       |
| `description`    | String | Campo para que el cliente agregue un texto explicando el motivo del reclamo      |
| `resolutionDate` | Date   | Campo que contiene la fecha de resolución del reclamo, inicialmente vacío       |
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
          { "Claim_number": "claim1", "Claim_type": "type1", "Description": "desc1", "Claim_state": "state1", "Claim_created_date": "date1" },
          { "Claim_number": "claim2", "Claim_type": "type2", "Description": "desc2", "Claim_state": "state2", "Claim_created_date": "date2" }
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
- `POST ('/v1/claims/resolve_claim/:id')`
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
