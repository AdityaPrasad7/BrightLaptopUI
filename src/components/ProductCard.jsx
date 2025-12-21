import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Star } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';

const ProductCard = ({ product, onAddToCart }) => {
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart(product);
  };

  // Handle both API and mock data formats - prioritize MongoDB _id
  const productId = product._id || product.id;
  
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
      <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden h-full">
        <CardContent className="p-4">
          {/* Condition Badge */}
          <Badge className={`mb-2 ${condition === 'new' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-orange-500 hover:bg-orange-600'} text-white`}>
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

          {/* Price */}
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-lg font-bold">₹{salePrice.toLocaleString()}</span>
            {originalPrice > salePrice && (
              <span className="text-sm text-gray-500 line-through">₹{originalPrice.toLocaleString()}</span>
            )}
          </div>

          {/* Discount Badge */}
          {discount > 0 && (
            <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 mb-4">
              {discount}% OFF
            </Badge>
          )}

          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            className="w-full bg-black hover:bg-gray-800 text-white"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Add to cart
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
};

export default ProductCard;