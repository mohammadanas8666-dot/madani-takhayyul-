import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';

export const metadata = {
  title: 'ROQAYYA — Premium Islamic Wear',
  description: 'A Madni Takhayyul product. Shop premium Pagdi/Amama, Jubba, Kurta/Thobe, Rumal and more with fast shipping, secure Razorpay checkout, and live order tracking.',
  keywords: 'roqayya, madni takhayyul, islamic wear, pagdi, amama, jubba, kurta, thobe, rumal, topi, islamic clothing',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-dark-950 text-slate-100 antialiased min-h-screen flex flex-col">
        <AuthProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}