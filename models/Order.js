import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: String,
  price: Number,
  quantity: Number,
  image: String,
});

const OrderSchema = new mongoose.Schema(
  {
    user: {
      type: String, // Firebase UID or User ObjectId
      required: true,
    },
    customerName: String,
    customerEmail: String,
    items: [OrderItemSchema],
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Shipped', 'Out for Delivery', 'Delivered'],
      default: 'Pending',
    },
    trackingId: {
      type: String,
      default: '',
    },
    paymentId: {
      type: String,
      default: '',
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed'],
      default: 'Paid',
    },
    shippingAddress: {
      fullName: String,
      address: String,
      city: String,
      state: String,
      postalCode: String,
      phone: String,
    },
  },
  { timestamps: true }
);

// Indexes for fast lookups at scale (admin filters, customer order history, tracking search)
OrderSchema.index({ user: 1, createdAt: -1 });
OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ customerEmail: 1 });

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);