import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Star, Plus, Minus } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { addToCart } from '../api/cartApi';
import { toast } from '../hooks/use-toast';

const ProductCard = ({ product, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  // Handle both API and mock data formats - prioritize MongoDB _id
  const productId = product._id || product.id;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!productId) {
      toast({
        title: "Error",
        description: "Product ID is missing",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const response = await addToCart(productId, quantity);

      if (response.success) {
        toast({
          title: "Added to cart",
          description: `${quantity} ${product.name} added to your cart.`,
          variant: "default", // Success usually uses default or a specific success variant if available
        });

        // Notify parent component to update cart count in header if needed
        if (onAddToCart) {
          onAddToCart(product);
        }
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Failed to add to cart",
        description: error.response?.data?.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleIncrease = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setQuantity(prev => prev + 1);
  };

  const handleDecrease = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  // Ensure we have a valid ID
  if (!productId) {
    console.warn('ProductCard: Product missing ID', product);
  }
  const productImage = product.images && product.images.length > 0
    ? product.images[0]
    : product.image || '/placeholder-image.jpg';
  const salePrice = product.basePrice || product.salePrice || 0;
  const originalPrice = product.mrp || product.originalPrice || salePrice;
  const discount = product.discountPercentage || product.discount || 0;
  const rating = product.rating || 0;
  const reviewsCount = product.reviewsCount || product.reviews || 0;
  const condition = product.condition || 'new';

  return (
    <Link to={`/product/${productId}`}>
      <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden h-full flex flex-col">
        <CardContent className="p-4 flex-1 flex flex-col">
          {/* Condition Badge */}
          <Badge className={`mb-2 w-fit ${condition === 'new' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-orange-500 hover:bg-orange-600'} text-white`}>
            {condition === 'new' ? 'Brand New' : 'Refurbished'}
          </Badge>

          {/* Verified Badge */}
          {product.isActive !== false && (
            <div className="flex items-center space-x-1 mb-3">
              <div className="bg-black text-white rounded-full p-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-xs text-gray-600">verified</span>
            </div>
          )}

          {/* Product Image */}
          <div className="relative aspect-square mb-4 overflow-hidden rounded-lg bg-gray-100">
            <img
              src={productImage}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.target.src = '/placeholder-image.jpg';
              }}
            />
          </div>

          {/* Product Info */}
          <h3 className="font-semibold text-sm mb-2 line-clamp-2 min-h-[40px]">
            {product.name}
          </h3>

          {/* Rating */}
          {rating > 0 && (
            <div className="flex items-center space-x-1 mb-3">
              <div className="flex items-center bg-yellow-400 text-white px-2 py-0.5 rounded">
                <Star className="w-3 h-3 fill-current" />
                <span className="text-xs ml-1 font-semibold">{rating.toFixed(1)}</span>
              </div>
              {reviewsCount > 0 && (
                <span className="text-xs text-gray-500">({reviewsCount})</span>
              )}
            </div>
          )}

          <div className="mt-auto">
            {/* Price */}
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-lg font-bold">₹{salePrice.toLocaleString()}</span>
              {originalPrice > salePrice && (
                <span className="text-sm text-gray-500 line-through">₹{originalPrice.toLocaleString()}</span>
              )}
            </div>

            {/* Discount Badge */}
            {discount > 0 && (
              <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 mb-4 w-fit">
                {discount}% OFF
              </Badge>
            )}

            <div className="flex items-center gap-3">
              {/* Quantity Selector */}
              <div className="flex items-center border rounded-md">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 p-0 hover:bg-gray-100"
                  onClick={handleDecrease}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <div className="w-8 text-center text-sm font-medium">
                  {quantity}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 p-0 hover:bg-gray-100"
                  onClick={handleIncrease}
                >
                  <plus className="h-3 w-3" /> {/* Fixed typpo in prev content if any */}
                  <Plus className="h-3 w-3" />
                </Button>
              </div>

              {/* Add to Cart Button */}
              <Button
                onClick={handleAddToCart}
                disabled={loading}
                className="flex-1 bg-black hover:bg-gray-800 text-white"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                {loading ? 'Adding...' : 'Add to cart'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default ProductCard;