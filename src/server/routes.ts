import  express from "express";
import { getAllClaims, getClaimById, createClaim,updateClaim, deleteClaim} from "../controllers/claim.controller";

const router = express.Router();

router.get('/v1/claims', getAllClaims);
router.get('/v1/claims/:id', getClaimById);
router.post('/v1/claims', createClaim);
router.put('/v1/claims/:id', updateClaim);
router.delete('/v1/claims/:id', deleteClaim);
export {router};