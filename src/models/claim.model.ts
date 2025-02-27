import { modelOptions, getModelForClass, prop, Ref } from "@typegoose/typegoose";
import  {ClaimStatusHistory}  from "./claimStatusHistory.model";


//@modelOptions({ schemaOptions: {timestamps: true }})
class Claim {
    @prop({ required: true })
    claim_id: string;

@prop({ required: true })
order_id: string;

    @prop({ required: true })
    user_id: string;

    @prop({ required: true })
    description: string;

    @prop({required: true})
    claim_type: string;

    @prop({required: false})
    resolution_date: Date;

    @prop({required: false})
    answer: string;

    @prop({required: false})
    admin: string;

    @prop({required: true})
    dateCreated: Date;

    @prop({required: false})
    dateUpdated: Date;

    // @prop({ref: () => ClaimStatusHistory})
    // status: Ref<ClaimStatusHistory> [];
    @prop({type: () => [ClaimStatusHistory], required: false})
    status:ClaimStatusHistory[];

   
}

const ClaimModel = getModelForClass(Claim);
export default  ClaimModel;


