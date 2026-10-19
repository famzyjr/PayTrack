
import mongoose, { Schema, type Document } from "mongoose";

export type TransactionStatus =
  | "Confirmed"
  | "Pending"
  | "Needs review";

export interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId;
  sender: string;
  reference: string;
  amount: number;
  date: Date;
  status: TransactionStatus;
  remarks: string;
   isReconciled: Boolean
}

const transactionSchema = new Schema<ITransaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sender: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    reference: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["Confirmed", "Pending", "Needs review"],
      default: "Pending",
    },
    remarks: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },
    isReconciled:{
    type:Boolean,
    default:false,
    }
  },
  {
    timestamps: true,
  }
);

transactionSchema.index(
  { userId: 1, reference: 1 },
  { unique: true }
);

const Transaction = mongoose.model<ITransaction>(
  "Transaction",
  transactionSchema
);

export default Transaction;
