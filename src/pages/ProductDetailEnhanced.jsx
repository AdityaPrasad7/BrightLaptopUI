import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Star, Shield, Package, Truck, ChevronLeft, Eye, Share2, Plus, Minus, Check } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import { toast } from '../hooks/use-toast';
import ProductCard from '../components/ProductCard';
import { getProductById, getProductsByCategory } from '../api/productApi';
import { addToCart } from '../api/cartApi';
import { createOrder } from '../api/cartApi';

const ProductDetailEnhanced = ({ onCartUpdate }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedRam, setSelectedRam] = useState(null);
  const [selectedStorage, setSelectedStorage] = useState(null);
  const [selectedWarranty, setSelectedWarranty] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [viewingUsers] = useState(Math.floor(Math.random() * 10) + 3);

  // Fetch product details from API
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await getProductById(id);
        
        if (response.success && response.data.product) {
          const productData = response.data.product;
          setProduct(productData);
          
          // Set default RAM and Storage from configuration variants if available
          if (productData.configurationVariants && productData.configurationVariants.length > 0) {
            const ramVariants = productData.configurationVariants.filter(v => v.type === 'RAM');
            const storageVariants = productData.configurationVariants.filter(v => v.type === 'STORAGE');
            
            if (ramVariants.length > 0) {
              // Find the variant with priceAdjustment 0 (base) or first one
              const baseRam = ramVariants.find(v => v.priceAdjustment === 0) || ramVariants[0];
              setSelectedRam(baseRam.value);
            }
            
            if (storageVariants.length > 0) {
              const baseStorage = storageVariants.find(v => v.priceAdjustment === 0) || storageVariants[0];
              setSelectedStorage(baseStorage.value);
            }
          }
          
          // Set default warranty
          if (productData.defaultWarranty) {
            setSelectedWarranty('default');
          }
          
          // Fetch related products from same category
          if (productData.category) {
            try {
              const relatedResponse = await getProductsByCategory(productData.category, { isActive: true });
              if (relatedResponse.success && relatedResponse.data.products) {
                const related = relatedResponse.data.products
                  .filter(p => (p._id || p.id) !== id)
                  .slice(0, 4);
                setRelatedProducts(related);
              }
            } catch (err) {
              console.error('Error fetching related products:', err);
              // Don't set error, just leave related products empty
            }
          }
        } else {
          setError('Product not found');
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err.response?.data?.error || err.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleAddToCart = async () => {
    if (!product || !product._id) {
      toast({
        title: "Error",
        description: "Product information is missing.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await addToCart(product._id, quantity);
      if (response.success) {
        toast({
          title: "Added to cart",
          description: `${quantity} ${product.name} added to your cart.`,
        });
        if (onCartUpdate) {
          onCartUpdate();
        }
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to add product to cart",
        variant: "destructive",
      });
    }
  };

  const handleBuyNow = async () => {
    if (!product || !product._id) {
      toast({
        title: "Error",
        description: "Product information is missing.",
        variant: "destructive",
      });
      return;
    }

    try {
      // First add to cart, then navigate to checkout
      const response = await addToCart(product._id, quantity);
      if (response.success) {
        navigate('/checkout');
        if (onCartUpdate) {
          onCartUpdate();
        }
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to add product to cart",
        variant: "destructive",
      });
    }
  };

  const handleRelatedProductAddToCart = async (relatedProduct) => {
    const productId = relatedProduct._id || relatedProduct.id;
    if (!productId) {
      toast({
        title: "Error",
        description: "Product information is missing.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await addToCart(productId, 1);
      if (response.success) {
        toast({
          title: "Added to cart",
          description: `${relatedProduct.name} has been added to your cart.`,
        });
        if (onCartUpdate) {
          onCartUpdate();
        }
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to add product to cart",
        variant: "destructive",
      });
    }
  };

  // Get product images from API data
  const productImages = product?.images && product.images.length > 0 
    ? product.images 
    : product?.image 
      ? [product.image] 
      : [];

  const faqs = [
    {
      question: "What are refurbished laptops?",
      answer: "Refurbished laptops are pre-owned devices that have been professionally restored to like-new condition. At Bright Laptop, each laptop undergoes rigorous testing, certified repairs, and deep cleaning to meet high-quality standards."
    },
    {
      question: "Are refurbished laptops reliable?",
      answer: "Yes. Every Bright Laptop laptop goes through strict quality checks, hardware diagnostics, and functionality tests before being approved for sale."
    },
    {
      question: "What is included with a refurbished laptop purchase?",
      answer: "Each Bright Laptop laptop includes a charger, detailed condition report, and a minimum 12-months warranty. Some models may also come with a free carry case."
    }
  ];

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg mb-4">Loading product details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-4">{error || 'Product not found'}</p>
          <Button onClick={() => navigate(-1)} variant="outline" className="mr-2">
            Go Back
          </Button>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 bg-white min-h-screen">
      <div className="container mx-auto px-4">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="grid md:grid-cols-2 gap-12 mb-16">
          {/* Product Images */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Badge className={`${product.condition === 'new' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-orange-500 hover:bg-orange-600'} text-white text-base py-1.5 px-4`}>
                {product.condition === 'new' ? 'Brand New' : 'Certified Refurbished'}
              </Badge>
              {product.verified && (
                <Badge className="bg-green-500 hover:bg-green-600">
                  In Stock
                </Badge>
              )}
            </div>
            
            {/* Main Image */}
            <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 mb-4">
              <img
                src={productImages[currentImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnail Images */}
            <div className="grid grid-cols-4 gap-4">
              {productImages.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`aspect-square rounded-lg overflow-hidden cursor-pointer border-2 ${
                    currentImageIndex === idx ? 'border-black' : 'border-gray-200'
                  }`}
                >
                  <img src={img} alt={`Product ${idx + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <div className="mb-4">
              <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
              
              {/* Rating & Views */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex items-center bg-yellow-400 text-white px-3 py-1 rounded">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-sm ml-1 font-semibold">{product.rating} / 5.0</span>
                </div>
                <span className="text-sm text-gray-500">({product.reviews} Reviews)</span>
                <Button variant="ghost" size="sm">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>

              {/* Viewing Users */}
              <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
                <Eye className="w-4 h-4" />
                <span>{viewingUsers} people are viewing this right now</span>
              </div>
            </div>

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-baseline space-x-3 mb-2">
                <span className="text-4xl font-bold">₹{(product.basePrice || 0).toLocaleString()}</span>
                {product.discountPercentage > 0 && (
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-base py-1">
                    {product.discountPercentage}% off
                  </Badge>
                )}
              </div>
              {product.gstIncluded && (
                <p className="text-sm text-gray-600 mb-1">
                  Inclusive of {product.gstPercentage || 18}% GST
                </p>
              )}
              {product.mrp && product.mrp > product.basePrice && (
                <p className="text-sm">
                  <span className="text-gray-600">MRP: </span>
                  <span className="line-through text-gray-500">₹{product.mrp.toLocaleString()}</span>
                </p>
              )}
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <Shield className="w-6 h-6 mx-auto mb-1 text-blue-600" />
                <p className="text-xs font-medium">12 months warranty</p>
              </div>
              <div className="text-center">
                <Package className="w-6 h-6 mx-auto mb-1 text-green-600" />
                <p className="text-xs font-medium">Free 14-days returns</p>
              </div>
              <div className="text-center">
                <Truck className="w-6 h-6 mx-auto mb-1 text-purple-600" />
                <p className="text-xs font-medium">24/7 Service</p>
              </div>
            </div>

            {/* Offers */}
            <div className="mb-6 space-y-3">
              <div className="p-4 border rounded-lg">
                <h3 className="font-bold mb-2">No Cost EMI options available</h3>
                <p className="text-sm text-gray-600">Online approval in 2 minutes</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-bold mb-2">Multiple bank offers available</h3>
                <p className="text-sm text-gray-600">Choose from a range of Bank Offers!</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-bold mb-2">Exchange Offers on Old Laptops</h3>
                <p className="text-sm text-gray-600">Get up to 50% discount with an exchange!</p>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Configuration Options */}
            <div className="space-y-6 mb-6">
              {/* RAM */}
              <div>
                <h3 className="font-semibold mb-3">RAM</h3>
                <div className="flex gap-3">
                  {['8GB', '16GB', '32GB'].map((ram) => (
                    <Button
                      key={ram}
                      variant={selectedRam === ram ? 'default' : 'outline'}
                      onClick={() => setSelectedRam(ram)}
                      className={selectedRam === ram ? 'bg-black hover:bg-gray-800 text-white' : ''}
                    >
                      {ram}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Storage */}
              <div>
                <h3 className="font-semibold mb-3">Storage</h3>
                <div className="flex gap-3">
                  {['256GB', '512GB', '1TB'].map((storage) => (
                    <Button
                      key={storage}
                      variant={selectedStorage === storage ? 'default' : 'outline'}
                      onClick={() => setSelectedStorage(storage)}
                      className={selectedStorage === storage ? 'bg-black hover:bg-gray-800 text-white' : ''}
                    >
                      {storage}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Warranty */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Warranty</h3>
                  <span className="text-sm text-blue-600 cursor-pointer">T&C</span>
                </div>
                <div className="space-y-2">
                  {[
                    { id: 'free-1-year', label: 'Free 1 year', price: 0 },
                    { id: 'extra-1-year', label: 'Extra 1 Year', price: 1499 },
                    { id: 'extra-2-years', label: 'Extra 2 Years', price: 2499 }
                  ].map((warranty) => (
                    <div
                      key={warranty.id}
                      onClick={() => setSelectedWarranty(warranty.id)}
                      className={`p-3 border rounded-lg cursor-pointer transition ${
                        selectedWarranty === warranty.id ? 'border-black bg-gray-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <input
                            type="radio"
                            checked={selectedWarranty === warranty.id}
                            onChange={() => setSelectedWarranty(warranty.id)}
                          />
                          <span className="font-medium">{warranty.label}</span>
                        </div>
                        {warranty.price > 0 && (
                          <span className="font-medium">₹{warranty.price}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="font-medium text-green-700">
                <Truck className="w-4 h-4 inline mr-2" />
                FREE Shipping by 18 December
              </p>
            </div>

            {/* Pricing Information - B2C & B2B */}
            <div className="mb-6 space-y-4">
              {/* B2C Pricing */}
              <div className={`p-4 border-2 rounded-lg ${quantity < 10 ? 'bg-blue-50 border-blue-500' : 'bg-gray-50 border-gray-300'}`}>
                <div className="flex items-center space-x-2 mb-2">
                  <Badge className={quantity < 10 ? 'bg-blue-500 text-white' : 'bg-gray-500 text-white'}>B2C Pricing</Badge>
                  <span className="text-sm font-medium text-gray-700">Individual Purchase</span>
                </div>
                <div className="flex items-baseline space-x-3">
                  <span className={`text-2xl font-bold ${quantity < 10 ? 'text-blue-600' : 'text-gray-500'}`}>₹{(product.basePrice || 0).toLocaleString()}</span>
                  <span className="text-sm text-gray-600">per unit</span>
                </div>
                {quantity < 10 && (
                  <p className="text-sm text-gray-600 mt-2">
                    Total: ₹{((product.basePrice || 0) * quantity).toLocaleString()} for {quantity} unit{quantity > 1 ? 's' : ''}
                  </p>
                )}
              </div>

              {/* B2B Pricing */}
              <div className={`p-4 border-2 rounded-lg ${quantity >= 10 ? 'bg-orange-50 border-orange-500' : 'bg-gray-50 border-gray-300'}`}>
                <div className="flex items-center space-x-2 mb-2">
                  <Badge className={quantity >= 10 ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'bg-gray-500 text-white'}>B2B Pricing</Badge>
                  <span className="text-sm font-medium text-orange-700">MOQ: 10 units</span>
                </div>
                <div className="flex items-baseline space-x-3">
                  <span className={`text-2xl font-bold ${quantity >= 10 ? 'text-orange-600' : 'text-gray-500'}`}>
                    ₹{product.b2bPrice ? product.b2bPrice.toLocaleString() : ((product.basePrice || 0) * 0.85).toLocaleString()}
                  </span>
                  <span className="text-sm text-gray-600">per unit</span>
                  <Badge variant="secondary" className={quantity >= 10 ? 'bg-orange-100 text-orange-700' : 'bg-gray-200 text-gray-500'}>
                    {product.b2bPrice ? 'B2B Price' : '15% additional off'}
                  </Badge>
                </div>
                {quantity >= 10 && (
                  <p className="text-sm text-gray-600 mt-2">
                    Total: ₹{((product.b2bPrice || (product.basePrice || 0) * 0.85) * quantity).toLocaleString()} for {quantity} units
                  </p>
                )}
              </div>
            </div>

            {/* Quantity and Actions */}
            <div className="mb-6">
              <div className="flex items-center space-x-4 mb-4">
                <span className="text-sm font-medium">Quantity:</span>
                <div className="flex items-center border rounded">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-12 text-center font-semibold">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {quantity < 10 && (
                  <span className="text-sm text-gray-600">
                    Order 10+ for B2B pricing
                  </span>
                )}
              </div>
              <div className="flex gap-4">
                <Button
                  onClick={handleAddToCart}
                  variant="outline"
                  className="flex-1 py-6 text-lg border-black text-black hover:bg-bright-50"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart
                </Button>
                <Button
                  onClick={handleBuyNow}
                  className="flex-1 bg-black hover:bg-gray-800 text-white py-6 text-lg"
                >
                  BUY NOW
                </Button>
              </div>
            </div>

            {/* Key Specs */}
            <div className="grid grid-cols-2 gap-4">
              {Object.entries({
                'Screen size': product.specifications?.screenSize || product.specifications?.screen || '14"',
                'Processor': product.specifications?.processor || 'Not specified',
                'Generation': product.specifications?.generation || 'Not specified',
                'RAM': product.specifications?.ram || 'Not specified',
                'Touch': product.specifications?.touch ? 'Yes' : 'No',
                'Storage': product.specifications?.storage || 'Not specified'
              }).filter(([key, value]) => value !== 'Not specified').map(([key, value]) => (
                <div key={key} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                    <Check className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">{key}</p>
                    <p className="font-medium">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Additional Info Tabs */}
        <Tabs defaultValue="specification" className="mb-16">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="specification">Specification</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>
          <TabsContent value="specification" className="mt-6">
            <div className="grid md:grid-cols-2 gap-8 p-6 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-bold text-lg mb-4">Display</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Screen diagonal</span>
                    <span className="font-medium">14"</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Resolution</span>
                    <span className="font-medium">1280x720</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Screen type</span>
                    <span className="font-medium">HD</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-4">Processor</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">CPU</span>
                    <span className="font-medium">{product.specifications?.processor || 'Not specified'}</span>
                  </div>
                  {product.specifications?.generation && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Generation</span>
                      <span className="font-medium">{product.specifications.generation}</span>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-4">Battery</h3>
                <div className="space-y-3">
                  {product.specifications?.battery && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Power Backup</span>
                      <span className="font-medium">{product.specifications.battery}</span>
                    </div>
                  )}
                  {product.specifications?.adapter && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Adapter</span>
                      <span className="font-medium">{product.specifications.adapter}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="details" className="mt-6 p-6 bg-gray-50 rounded-lg">
            <p className="text-gray-700 leading-relaxed">
              {product.name} features an {product.specifications?.processor || 'powerful'} processor. {product.condition === 'refurbished' ? 'Refurbished to perfection and' : ''} ideal for professionals and students. 
              Comes with {product.defaultWarranty || '12-months'} warranty. {product.shipping?.freeShipping ? 'Lightweight, durable, and shipped free across India.' : 'Lightweight and durable.'}
            </p>
          </TabsContent>
        </Tabs>

        {/* Testimonials */}
        <div className="mb-16 p-8 bg-gray-50 rounded-2xl">
          <h2 className="text-3xl font-bold mb-8 text-center">Testimonials</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">Our Website</h3>
              <div className="text-5xl font-bold mb-2">{product.rating}</div>
              <div className="flex justify-center space-x-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-600">({product.reviews} Reviews)</p>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">Google Reviews</h3>
              <div className="text-5xl font-bold mb-2">4.7</div>
              <div className="flex justify-center space-x-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-600">(593 Reviews)</p>
            </div>
          </div>
          <div className="text-center mt-8">
            <Button variant="outline">Write a Review</Button>
          </div>
        </div>

        {/* FAQs */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Got Questions? We Have Answers</h2>
          <Accordion type="single" collapsible className="max-w-3xl mx-auto">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-gray-700">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <div className="text-center mt-6">
            <Button variant="outline">View More</Button>
          </div>
        </div>

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

export default ProductDetailEnhanced;
