import { Request, Response } from 'express';
import { getClaims, claimById, editClaim, lowClaim, saveClaim} from '../claim/claim';



export async function getAllClaims(req: Request, res: Response) {
   try {
    const claims = await getClaims();
    res.status(200).json(claims);
   }catch (error) {
       res.status(500).json({error: "Internal server error"});
   }


}

export async function getClaimById(req: Request, res: Response) {
    try {
        const {id} = req.params;
        console.log(id);
        const claim = await claimById(id);
        res.status(200).json(claim);
    }catch (error) {
        res.status(500).json({error: "Internal server error"});
    }
}


export async function createClaim(req: Request, res: Response) {
    try {
        const {order_id, user_id, description, claim_type} = req.body;
       await saveClaim(order_id, user_id, description, claim_type); 
        res.status(200).json({message: "Reclamo creado exitosamente"});
    }catch (error) {
        res.status(500).json({error: "Internal server error"});
    }
}


export async function updateClaim(req: Request, res: Response) {
    try {
        const {id} = req.params;
        const {status, answer} = req.body;
        await editClaim(id, status, answer);
        res.status(200).json({message: "Reclamo resuelto exitosamente"});
    }catch (error) {
        res.status(500).json({error: "Internal server error"});
    }
}

export async function deleteClaim(req: Request, res: Response) {
    try {
        const {id} = req.params;
        await lowClaim(id);
        res.status(200).json({message: "Reclamo eliminado exitosamente"});
    }catch (error) {
        res.status(500).json({error: "Internal server error"});
    }
}