import mongoose from 'mongoose';

const BalanceSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    payoutStatus: {
      type: String,
      enum: ['Pending', 'Paid'],
      default: 'Pending',
    },
  },
  { timestamps: true }
);

export default mongoose.models.Balance || mongoose.model('Balance', BalanceSchema);
