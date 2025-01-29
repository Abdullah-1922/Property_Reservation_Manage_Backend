import  { Schema, model, Types } from 'mongoose';
import { TProperty } from './property.interface';


const propertySchema = new Schema<TProperty>({

    owner: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    zakRoomId: { type: String, required: true },
    roomName: { type: String, required: true },
});

const Property = model<TProperty>('Property', propertySchema);

export default Property;