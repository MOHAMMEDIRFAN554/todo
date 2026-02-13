import mongoose, { Schema, model, models } from "mongoose";

export interface ITodo {
    text: string;
    completed: boolean;
    dueDate?: string;
    dueTime?: string;
    notified?: boolean;
}

const TodoSchema = new Schema<ITodo>(
    {
        text: { type: String, required: true },
        completed: { type: Boolean, default: false },
        dueDate: { type: String },
        dueTime: { type: String },
        notified: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export default models.Todo || model<ITodo>("Todo", TodoSchema);
