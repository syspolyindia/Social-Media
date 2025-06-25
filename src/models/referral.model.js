import mongoose, {Schema} from "mongoose";


const referralSchema = new Schema({
    referredBy:{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    referredUser:{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    referredTo:{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status:{
        type: Boolean,
        required:true,
        default: false
    }
}, {timestamps: true});

export const Referral = mongoose.model('Referral', referralSchema);