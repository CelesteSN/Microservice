import { Request, Response } from 'express';
import { getClaims, claimById, editClaim, lowClaim, saveClaim, lowClaims} from '../claim/claim';
import errorClaim from '../errors/errorClaim';
import { CustomError } from '../handlers/customError';


export const getAllClaims = async (req: Request, res: Response): Promise<void> => {
    try {
        //obtengo el fitro por estado
        const status: string = (req.query.status as string) || '';
        //obtengo filtro por nro de orden
        const order_id: string = (req.query.oder_id as string) || '';
        //Tomo el token del header.
        let token: any = req.header("Authorization");
        token = token.split(" ")[1] //Separo el Bearer {token} para solo quedarme con el token.

        const claims: any = await getClaims(token, status, order_id);
        res.status(200).json({ claims });
    } catch (error) {
        if (error instanceof CustomError) {
            res.status(error.statusCode).json({ error: error.message });
        } else {
            res.status(500).json({ error: "Internal server error" });
        }
    }
}


export async function getClaimById(req: Request, res: Response) {
    try {
        const { id } = req.params;
        console.log(id);
        const claim = await claimById(id);
        res.status(200).json(claim);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
}


export async function createClaim(req: Request, res: Response) {
    try {
        //Tomo el token del header.
        let token: any = req.header("Authorization");
        token = token.split(" ")[1] //Separo el Bearer {token} para solo quedarme con el token.
        const { order_id, description, claim_type } = req.body;
        const claimId = await saveClaim(token, order_id, description, claim_type);
        //Valido si ocurrido algún error en el proceso de crear un reporte de una review.
        res.status(200).json({ message: "Reclamo" + " " + claimId + " " + "creado exitosamente, el administrador será notificado en 24 hs"});
    } catch (error) {
        if (error instanceof CustomError) {
            res.status(error.statusCode).json({ error: error.message });
        } else {
            res.status(500).json({ error: "Internal server error" });
        }
    }
}




export const updateClaim = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { status, answer } = req.body;
        console.log(id, status, answer);

        //Tomo el token del header.
        let token: any = req.header("Authorization");
        token = token.split(" ")[1] //Separo el Bearer {token} para solo quedarme con el token.


        const claimEdited = await editClaim(id, status, answer, token);
        if(status === "InProgress"){
            res.status(200).json({ message: "Reclamo en proceso, el usuario fue notificado"});

        }
        res.status(200).json({ message: "Reclamo resuelto exitosamente, el usuario fue notificado" });
    }  catch (error) {
        if (error instanceof CustomError) {
            res.status(error.statusCode).json({ error: error.message });
        } else {
            res.status(500).json({ error: "Internal server error" });
        }
    }
}

export async function deleteClaim(req: Request, res: Response) {
    try {
        const { id } = req.params;
        await lowClaim(id);
        res.status(200).json({ message: "Reclamo eliminado exitosamente" });
    } catch (error) {
        if (error instanceof CustomError) {
            res.status(error.statusCode).json({ error: error.message });
        } else {
            res.status(500).json({ error: "Internal server error" });
        }
    }
}

export async function cancelClaims(req: Request, res: Response) {
    try {
       // const { id } = req.params;
        const { order_id } = req.body;
        await lowClaims(order_id);
        res.status(200).json({ message: "Los reclamos asociados a la orden número:" + " "+ order_id + " " + "fuerom cancelados correctamente" });
    } catch (error) {
        if (error instanceof CustomError) {
            res.status(error.statusCode).json({ error: error.message });
        } else {
            res.status(500).json({ error: "Internal server error" });
        }
    }
}