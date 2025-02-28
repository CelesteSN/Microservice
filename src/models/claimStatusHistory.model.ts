import { getModelForClass, modelOptions, prop } from "@typegoose/typegoose";

@modelOptions({ schemaOptions: { _id: false} })
 export class ClaimStatusHistory {

    // @prop({ required: true })
    // statusId: string;

    @prop({ required: true })
    statusName: string;

    @prop({ required: true })
    isActive: boolean;

    @prop({ required: true })
    created: Date;

  


}
 const ClaimStatusHistoryModel = getModelForClass(ClaimStatusHistory);
 export default ClaimStatusHistoryModel;