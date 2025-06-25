import mongoose, {Schema} from "mongoose";

const commentSchema = new Schema({
    content:{
        type: String,
        required: true,
        trim: true
    },
    post:{
        type: Schema.Types.ObjectId,
        ref: 'Post',
    },
    owner:{
        type: Schema.Types.ObjectId,
        ref: 'User',
    }
}, {timestamps: true});

export const Comment = mongoose.model('Comment', commentSchema);

