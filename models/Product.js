import mongoose from 'mongoose';

const CATEGORIES = ['Pagdi/Amama', 'Jubba/Aba', 'Kurta/Thobe', 'Rumal', 'Topi', 'Others'];

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
      enum: {
        values: CATEGORIES,
        message: '{VALUE} is not a valid category',
      },
    },
    color: {
      type: String,
      trim: true,
      default: '',
    },
    size: {
      type: String,
      trim: true,
      default: '',
    },
    fabric: {
      type: String,
      trim: true,
      default: '',
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

export const PRODUCT_CATEGORIES = CATEGORIES;

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
