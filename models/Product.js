import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a product name'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Please provide product price'],
      min: [0, 'Price cannot be negative'],
    },
    images: {
      type: [String],
      default: [],
    },
    stock: {
      type: Number,
      required: [true, 'Please provide product stock'],
      default: 0,
      min: [0, 'Stock cannot be negative'],
    },
    category: {
      type: String,
      required: [true, 'Please provide category'],
      trim: true,
      default: 'General',
    },
    isFeaturedInSlider: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
