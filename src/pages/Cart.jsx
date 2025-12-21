import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { getCart, updateCartItem, removeFromCart } from '../api/cartApi';
import { toast } from '../hooks/use-toast';

const Cart = ({ onCartUpdate }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartTotal, setCartTotal] = useState(0);
  const navigate = useNavigate();

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await getCart();
      if (response.success && response.data.cart) {
        const cart = response.data.cart;
        setCartItems(cart.items || []);
        setCartTotal(cart.totalAmount || 0);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to load cart",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      const response = await updateCartItem(productId, newQuantity);
      if (response.success && response.data.cart) {
        const cart = response.data.cart;
        setCartItems(cart.items || []);
        setCartTotal(cart.totalAmount || 0);
        if (onCartUpdate) onCartUpdate();
      }
    } catch (error) {
      console.error('Error updating cart:', error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to update cart",
        variant: "destructive",
      });
    }
  };

  const handleRemove = async (productId, productName) => {
    try {
      const response = await removeFromCart(productId);
      if (response.success && response.data.cart) {
        const cart = response.data.cart;
        setCartItems(cart.items || []);
        setCartTotal(cart.totalAmount || 0);
        toast({
          title: "Removed from cart",
          description: `${productName} has been removed from your cart.`,
        });
        if (onCartUpdate) onCartUpdate();
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to remove item",
        variant: "destructive",
      });
    }
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  // Calculate savings (difference between MRP and actual price)
  const savings = cartItems.reduce((sum, item) => {
    const product = item.productId;
    const mrp = product?.mrp || product?.basePrice || 0;
    const unitPrice = item.unitPrice || 0;
    return sum + ((mrp - unitPrice) * item.quantity);
  }, 0);

  const subtotal = cartTotal + savings;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center py-20">
            <p className="text-gray-600">Loading cart...</p>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center py-20">
            <ShoppingBag className="w-24 h-24 mx-auto text-gray-300 mb-6" />
            <h2 className="text-3xl font-bold mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Looks like you haven't added any products yet</p>
            <Link to="/all-products">
              <Button className="bg-black hover:bg-gray-800 text-white">
                Start Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Continue Shopping
        </Button>

        <h1 className="text-4xl font-bold mb-8">Shopping Cart</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              {cartItems.map((item, index) => {
                const product = item.productId;
                const productId = product?._id || product?.id || item.productId;
                const productName = product?.name || 'Product';
                // Handle images array - check if it exists and has items
                let productImage = '/placeholder-image.jpg';
                if (product?.images && Array.isArray(product.images) && product.images.length > 0) {
                  productImage = product.images[0];
                } else if (product?.image) {
                  productImage = product.image;
                }
                const mrp = product?.mrp || product?.basePrice || 0;
                const unitPrice = item.unitPrice || 0;
                const totalPrice = item.totalPrice || 0;
                const isB2B = item.quantity >= (product?.moq || 10);
                
                return (
                  <div key={item._id || productId}>
                    <div className="p-6">
                      <div className="flex gap-4">
                        {/* Product Image */}
                        <Link to={`/product/${productId}`} className="flex-shrink-0">
                          <img
                            src={productImage}
                            alt={productName}
                            className="w-24 h-24 object-cover rounded-lg"
                            onError={(e) => {
                              // Prevent infinite loop by checking if already set to placeholder
                              if (e.target.src !== window.location.origin + '/placeholder-image.jpg') {
                                e.target.src = '/placeholder-image.jpg';
                              }
                            }}
                            loading="lazy"
                          />
                        </Link>

                        {/* Product Info */}
                        <div className="flex-1">
                          <Link to={`/product/${productId}`}>
                            <h3 className="font-semibold mb-2 hover:text-blue-600 transition">
                              {productName}
                            </h3>
                          </Link>
                          <p className="text-sm text-gray-600 mb-2">{product?.brand || ''}</p>
                          {isB2B ? (
                            <div>
                              <div className="flex items-center space-x-2 mb-1">
                                <Badge className="bg-orange-500 text-white text-xs">B2B Pricing</Badge>
                                {product?.moq && (
                                  <span className="text-xs text-gray-600">MOQ: {product.moq}</span>
                                )}
                              </div>
                              <div className="flex items-baseline space-x-2">
                                <span className="text-lg font-bold text-orange-600">₹{unitPrice.toLocaleString()}</span>
                                {mrp > unitPrice && (
                                  <span className="text-sm text-gray-500 line-through">₹{mrp.toLocaleString()}</span>
                                )}
                                <span className="text-sm text-orange-600 font-medium">per unit</span>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="flex items-center space-x-2 mb-1">
                                <Badge className="bg-blue-500 text-white text-xs">B2C Pricing</Badge>
                              </div>
                              <div className="flex items-baseline space-x-2">
                                <span className="text-lg font-bold">₹{unitPrice.toLocaleString()}</span>
                                {mrp > unitPrice && (
                                  <>
                                    <span className="text-sm text-gray-500 line-through">₹{mrp.toLocaleString()}</span>
                                    {product?.discountPercentage && (
                                      <span className="text-sm text-green-600 font-medium">{product.discountPercentage}% off</span>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          )}
                          <div className="mt-2 text-sm text-gray-600">
                            Total: <span className="font-semibold">₹{totalPrice.toLocaleString()}</span>
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex flex-col items-end justify-between">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemove(productId, productName)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          <div className="flex items-center space-x-2 border rounded-lg">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleQuantityChange(productId, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              -
                            </Button>
                            <span className="w-8 text-center font-semibold">{item.quantity}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleQuantityChange(productId, item.quantity + 1)}
                            >
                              +
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                    {index < cartItems.length - 1 && <Separator />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-20">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                  <span className="font-semibold">₹{subtotal.toLocaleString()}</span>
                </div>
                {savings > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">Discount</span>
                    <span className="font-semibold text-green-600">-₹{savings.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery Charges</span>
                  <span className="font-semibold text-green-600">FREE</span>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between text-lg font-bold mb-6">
                <span>Total Amount</span>
                <span>₹{cartTotal.toLocaleString()}</span>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
                <p className="text-sm text-green-700 font-medium">
                  You will save ₹{savings.toLocaleString()} on this order
                </p>
              </div>

              <Button
                onClick={handleCheckout}
                className="w-full bg-black hover:bg-gray-800 text-white py-6 text-lg"
              >
                Proceed to Checkout
              </Button>

              <div className="mt-6 space-y-2 text-xs text-gray-600">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>12 Months Warranty</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>14 Days Return Policy</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Free Delivery</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>COD Available</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;