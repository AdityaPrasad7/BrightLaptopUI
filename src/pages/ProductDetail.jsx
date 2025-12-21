import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Star, Shield, Package, Truck, ChevronLeft, Eye, Share2, Plus, Minus } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import { products, addToCart } from '../mockData';
import { toast } from '../hooks/use-toast';
import ProductCard from '../components/ProductCard';

const ProductDetail = ({ onCartUpdate }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const foundProduct = products.find(p => p.id === parseInt(id));
    if (foundProduct) {
      setProduct(foundProduct);
      // Get related products from same category
      const related = products.filter(
        p => p.category === foundProduct.category && p.id !== foundProduct.id
      ).slice(0, 4);
      setRelatedProducts(related);
    }
  }, [id]);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    toast({
      title: "Added to cart",
      description: `${quantity} ${product.name} added to your cart.`,
    });
    onCartUpdate();
  };

  const handleRelatedProductAddToCart = (relatedProduct) => {
    addToCart(relatedProduct);
    toast({
      title: "Added to cart",
      description: `${relatedProduct.name} has been added to your cart.`,
    });
    onCartUpdate();
  };

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Product not found</p>
      </div>
    );
  }

  return (
    <div className="py-8 bg-white min-h-screen">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="grid md:grid-cols-2 gap-12 mb-16">
          {/* Product Image */}
          <div>
            {product.extraOff && (
              <Badge className="bg-green-500 hover:bg-green-600 mb-4">
                Extra ₹{product.extraOff} Off
              </Badge>
            )}
            <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 mb-4">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {product.verified && (
              <div className="flex items-center space-x-2 text-sm">
                <div className="bg-black text-white rounded-full p-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-600">Verified & Certified Product</span>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div className="mb-4">
              <Badge variant="outline" className="mb-2">{product.category}</Badge>
              <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
              
              {/* Rating */}
              <div className="flex items-center space-x-2 mb-6">
                <div className="flex items-center bg-yellow-400 text-white px-3 py-1 rounded">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-sm ml-1 font-semibold">{product.rating}</span>
                </div>
                <span className="text-sm text-gray-500">({product.reviews} reviews)</span>
              </div>
            </div>

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-baseline space-x-3 mb-2">
                <span className="text-4xl font-bold">₹{product.salePrice.toLocaleString()}</span>
                <span className="text-xl text-gray-500 line-through">₹{product.originalPrice.toLocaleString()}</span>
              </div>
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-base py-1">
                {product.discount}% OFF - You save ₹{(product.originalPrice - product.salePrice).toLocaleString()}
              </Badge>
            </div>

            <Separator className="my-6" />

            {/* Specifications */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Specifications:</h3>
              <div className="space-y-2 text-sm">
                {Object.entries(product.specs).map(([key, value]) => (
                  <div key={key} className="flex">
                    <span className="text-gray-600 w-32 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <Separator className="my-6" />

            {/* Quantity and Add to Cart */}
            <div className="mb-6">
              <div className="flex items-center space-x-4 mb-4">
                <span className="text-sm font-medium">Quantity:</span>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    -
                  </Button>
                  <span className="w-12 text-center font-semibold">{quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </Button>
                </div>
              </div>
              <Button
                onClick={handleAddToCart}
                className="w-full bg-black hover:bg-gray-800 text-white py-6 text-lg"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Shield className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                <p className="text-xs font-medium">12 Months Warranty</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Package className="w-6 h-6 mx-auto mb-2 text-green-600" />
                <p className="text-xs font-medium">14 Days Return</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Truck className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                <p className="text-xs font-medium">Free Delivery</p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info Tabs */}
        <Tabs defaultValue="description" className="mb-16">
          <TabsList>
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="warranty">Warranty</TabsTrigger>
            <TabsTrigger value="shipping">Shipping</TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="p-6 bg-gray-50 rounded-lg">
            <h3 className="font-bold text-lg mb-3">Product Description</h3>
            <p className="text-gray-700 leading-relaxed">
              This certified refurbished {product.brand} device has been professionally inspected, tested, and cleaned by our expert technicians. 
              Each product undergoes a rigorous 40-point quality check to ensure it meets our high standards. The device is in excellent working condition 
              and comes with a comprehensive warranty for your peace of mind.
            </p>
          </TabsContent>
          <TabsContent value="warranty" className="p-6 bg-gray-50 rounded-lg">
            <h3 className="font-bold text-lg mb-3">Warranty Information</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              This product comes with a 12-month comprehensive warranty covering all hardware defects and malfunctions. Our warranty ensures that 
              you're protected against any manufacturing defects or issues that may arise during normal use.
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>12-month hardware warranty</li>
              <li>Free repair or replacement</li>
              <li>Dedicated customer support</li>
              <li>Quick turnaround time</li>
            </ul>
          </TabsContent>
          <TabsContent value="shipping" className="p-6 bg-gray-50 rounded-lg">
            <h3 className="font-bold text-lg mb-3">Shipping Information</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              We offer free delivery across India. Your order will be carefully packaged and shipped within 1-2 business days. 
              Track your order in real-time and expect delivery within 3-7 business days depending on your location.
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Free PAN India delivery</li>
              <li>COD available</li>
              <li>Secure packaging</li>
              <li>Real-time tracking</li>
            </ul>
          </TabsContent>
        </Tabs>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-3xl font-bold mb-8">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard
                  key={relatedProduct.id}
                  product={relatedProduct}
                  onAddToCart={handleRelatedProductAddToCart}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;