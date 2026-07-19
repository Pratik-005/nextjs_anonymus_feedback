import mongoose, { Schema } from "mongoose";

export interface Message extends Document {
    _id?: string;
    content: string;
    createdAt: Date;
}

export const MessageSchema: Schema<Message> = new Schema({
    content: {
        type: String,
        required: true,
        trim: true
    },
    createdAt: {
        default: Date.now(),
        required: true,
        type: Date
    }
});

const MessageModel = (mongoose.models.Message as mongoose.Model<Message>) || mongoose.model<Message>('Message', MessageSchema);

export default MessageModel;