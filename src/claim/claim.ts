
import e from "cors";
import Claim from "../models/claim.model";
//import  ClaimStatusHistory  from "../models/claimStatusHistory.model";
import mongoose from "mongoose";
import { error } from "winston";

export async function saveClaim(orderId: string, userId: string, descr: string, claimType: string) {

    const claim1 = new Claim({
        order_id: orderId,
        user_id: userId,
        description: descr,
        claim_type: claimType,
        status: [{
            statusName: "Pending",
            isActive: true
        }]
    });

    await claim1.save();
    console.log(claim1);
    return claim1;
}


export async function getClaims() {
    const claims = await Claim.find({
        status: {
            $elemMatch: {
                statusName: "Pending",
                isActive: true
            }
        }
    });
    return claims;
}


export async function claimById(id: string) {
    const claim = await Claim.findById(id);
    console.log(claim);
    return claim;
}



export async function editClaim(id: string, status: string, ans: string) {

if (status === "Accepted" || status === "Canceled") {


    let claimEdited = await Claim.findOne({
        '_id' : id,
        'status.isActive': true,
        'status.statusName': "Pending"

    });
    if (claimEdited) {
        claimEdited.status.forEach(async (element) => {
            if (element.isActive) {
                element.isActive = false;
                claimEdited?.save();
             

            }
        })
    }

    if (claimEdited) {
        claimEdited = await Claim.findByIdAndUpdate(id, {
            answer: ans,
            updated_at: new Date(),
            resolution_date: new Date(),
            status: [...claimEdited.status, {
                statusName: status,
                isActive: true
            }]
        }, { new: true });
    }

        if (claimEdited) {
            await claimEdited.save();
            console.log(claimEdited);
        }
    
    return claimEdited;
}
else {
    throw new Error("Status not valid");
}

}

export async function lowClaim(id: string) {
    const claim = await Claim.findOne({
        _id: id,
        status: {
            $elemMatch: {
                statusName: "Pending",
                isActive: true
            }
        }
    });

    if (!claim) {
        throw new Error("The claim does not exist");
    }

    await Claim.findByIdAndDelete(id);
    return "Reclamo eliminado";
}



