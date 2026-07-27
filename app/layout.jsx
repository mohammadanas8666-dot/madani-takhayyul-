import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';

export const metadata = {
  title: 'MADANI - Premium E-Commerce Store',
  description: 'Shop top quality products with fast shipping, secure Razorpay checkout, and live order tracking at MADANI.',
  keywords: 'ecommerce, shop, online store, madani, razorpay, products, shopping',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 antialiased min-h-screen flex flex-col">
        <AuthProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
