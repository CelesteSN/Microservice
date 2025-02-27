import { getModelForClass, modelOptions, prop } from "@typegoose/typegoose";

@modelOptions({ schemaOptions: {timestamps: true, _id: false} })
 export class ClaimStatusHistory {

    // @prop({ required: true })
    // statusId: string;

    @prop({ required: true })
    statusName: string;

    @prop({ required: true })
    isActive: boolean;


}
 const ClaimStatusHistoryModel = getModelForClass(ClaimStatusHistory);
 export default ClaimStatusHistoryModel;