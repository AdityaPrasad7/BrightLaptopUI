import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, Star, Shield, Rocket } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import ProductCard from '../components/ProductCard';
import { blogs, testimonials } from '../mockData';
import { toast } from '../hooks/use-toast';
import { getProductCategoriesList } from '../api/categoryApi';
import { getProductsByCategory, getBestSellers, getBestDeals, getTopPicks, getBrands } from '../api/productApi';
import { addToCart } from '../api/cartApi';

const Home = ({ onCartUpdate }) => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [bestSellers, setBestSellers] = useState([]);
  const [bestSellersLoading, setBestSellersLoading] = useState(true);
  const [bestDeals, setBestDeals] = useState([]);
  const [bestDealsLoading, setBestDealsLoading] = useState(true);
  const [topPicks, setTopPicks] = useState([]);
  const [topPicksLoading, setTopPicksLoading] = useState(true);
  const [brands, setBrands] = useState([]);
  const [brandsLoading, setBrandsLoading] = useState(true);
  
  // Filter products based on search query
  const filterProducts = (products) => {
    if (!searchQuery || searchQuery.trim().length === 0) {
      return products;
    }
    const query = searchQuery.toLowerCase().trim();
    return products.filter(product => 
      product.name?.toLowerCase().includes(query) ||
      product.brand?.toLowerCase().includes(query) ||
      product.category?.toLowerCase().includes(query) ||
      product.description?.toLowerCase().includes(query)
    );
  };
  
  // Memoized filtered products
  const filteredBestSellers = useMemo(() => filterProducts(bestSellers), [bestSellers, searchQuery]);
  const filteredBestDeals = useMemo(() => filterProducts(bestDeals), [bestDeals, searchQuery]);
  const filteredTopPicks = useMemo(() => filterProducts(topPicks), [topPicks, searchQuery]);

  // Fetch categories from API and get cover images from products
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const response = await getProductCategoriesList();
        
        if (response.success && response.data?.categories) {
          // Filter out 'all' category and transform to display format
          const categoryObjects = response.data.categories
            .filter(name => name && name.toLowerCase() !== 'all')
            .map((name) => ({
              id: name, // Use name as id
              name: name.charAt(0).toUpperCase() + name.slice(1), // Capitalize first letter
              slug: name.toLowerCase().replace(/\s+/g, '-'), // Convert to slug format
              image: null, // Will be set from products
            }));
          
          // Fetch products for each category to get cover images
          const categoriesWithImages = await Promise.all(
            categoryObjects.map(async (category) => {
              try {
                const productsResponse = await getProductsByCategory(category.slug, { isActive: true });
                if (productsResponse.success && productsResponse.data?.products && productsResponse.data.products.length > 0) {
                  // Use the first product's first image as category cover
                  const firstProduct = productsResponse.data.products[0];
                  if (firstProduct.images && firstProduct.images.length > 0) {
                    category.image = firstProduct.images[0];
                  }
                }
              } catch (error) {
                console.error(`Error fetching products for category ${category.name}:`, error);
                // Keep image as null, will use fallback
              }
              return category;
            })
          );
          
          setCategories(categoriesWithImages);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Fetch best sellers from API
  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        setBestSellersLoading(true);
        const response = await getBestSellers({ limit: 5 });
        
        if (response.success && response.data?.products) {
          setBestSellers(response.data.products);
        }
      } catch (error) {
        console.error('Error fetching best sellers:', error);
        setBestSellers([]);
      } finally {
        setBestSellersLoading(false);
      }
    };

    fetchBestSellers();
  }, []);

  // Fetch best deals from API
  useEffect(() => {
    const fetchBestDeals = async () => {
      try {
        setBestDealsLoading(true);
        const response = await getBestDeals({ limit: 3 });
        
        if (response.success && response.data?.products) {
          setBestDeals(response.data.products);
        }
      } catch (error) {
        console.error('Error fetching best deals:', error);
        setBestDeals([]);
      } finally {
        setBestDealsLoading(false);
      }
    };

    fetchBestDeals();
  }, []);

  // Fetch top picks from API
  useEffect(() => {
    const fetchTopPicks = async () => {
      try {
        setTopPicksLoading(true);
        const response = await getTopPicks({ limit: 3 });
        
        if (response.success && response.data?.products) {
          setTopPicks(response.data.products);
        }
      } catch (error) {
        console.error('Error fetching top picks:', error);
        setTopPicks([]);
      } finally {
        setTopPicksLoading(false);
      }
    };

    fetchTopPicks();
  }, []);

  // Fetch brands from API
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setBrandsLoading(true);
        console.log('Fetching brands...');
        const response = await getBrands();
        console.log('Brands API Response:', response);
        
        if (response.success && response.data?.brands) {
          // Transform API response to match component structure
          const brandsData = response.data.brands.map((brand, index) => ({
            id: index + 1,
            name: brand.name,
            logo: brand.image || null, // Use brandImage from API, fallback to null
          }));
          console.log('Processed brands:', brandsData);
          setBrands(brandsData);
        } else {
          console.warn('No brands in response:', response);
          setBrands([]);
        }
      } catch (error) {
        console.error('Error fetching brands:', error);
        console.error('Error details:', error.response?.data || error.message);
        // Set empty array on error
        setBrands([]);
      } finally {
        setBrandsLoading(false);
      }
    };

    fetchBrands();
  }, []);

  const handleAddToCart = async (product) => {
    const productId = product._id || product.id;
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
          description: `${product.name} has been added to your cart.`,
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

  return (
    <div className="overflow-x-hidden">
      {/* Hero Banner */}
      <section className="py-12 bg-gradient-to-br from-blue-50 via-white to-orange-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-5xl font-bold mb-4">Find Your Perfect Laptop</h2>
            <p className="text-xl text-gray-600 mb-8">Choose between brand new or certified refurbished laptops</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/refurbished-laptops">
                <Button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-6 text-lg">
                  <span className="mr-2">🔄</span> Refurbished Laptops - Save up to 70%
                </Button>
              </Link>
              {/* <Link to="/new-laptops">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg">
                  <span className="mr-2">✨</span> New Laptops - Latest Models
                </Button>
              </Link> */}
            </div>
          </div>
        </div>
      </section>

      {/* Hero Categories Section */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl font-bold mb-6">Shop by Category</h3>
          {categoriesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="h-64 bg-gray-200 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : categories.length === 0 ? (
            <p className="text-gray-500">No categories available</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.slice(0, 6).map((category, index) => {
                const categorySlug = category.slug || category.name?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                // Fallback placeholder images based on category name if no product image
                const getCategoryImage = (categoryName, productImage) => {
                  if (productImage) {
                    return productImage;
                  }
                  // Fallback to placeholder based on category name
                  const name = categoryName.toLowerCase();
                  if (name.includes('macbook') || name.includes('apple')) {
                    return 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800';
                  } else if (name.includes('windows')) {
                    return 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800';
                  } else if (name.includes('mini') || name.includes('pc')) {
                    return 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800';
                  } else if (name.includes('desktop')) {
                    return 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800';
                  } else if (name.includes('gaming')) {
                    return 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800';
                  } else if (name.includes('business')) {
                    return 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800';
                  } else if (name.includes('coding')) {
                    return 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800';
                  } else {
                    return 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800';
                  }
                };
                
                return (
                  <Link
                    key={category.id || category.name}
                    to={`/all-products?category=${categorySlug}`}
                    className={`group relative overflow-hidden rounded-2xl ${index === 4 ? 'sm:col-span-2 lg:col-span-1' : ''}`}
                  >
                    <div className="relative h-64 bg-gray-900">
                      <img
                        src={getCategoryImage(category.name, category.image)}
                        alt={category.name}
                        className="w-full h-full object-cover opacity-60 group-hover:opacity-50 group-hover:scale-105 transition-all duration-500"
                        onError={(e) => {
                          // Fallback to a default image if the URL fails
                          e.target.src = 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-6 left-6 text-white">
                        <h3 className="text-2xl font-bold mb-1">{category.name}</h3>
                        <p className="text-sm opacity-90">Shop {category.name} laptops</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Scrolling Banner */}
      <div className="bg-black text-white py-3 overflow-hidden">
        <div className="animate-scroll-left flex space-x-12 whitespace-nowrap">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex items-center space-x-12">
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-sm font-medium">14 DAYS RETURN</span>
              </div>
              <span className="text-sm font-medium">COD AVAILABLE ON ALL PRODUCTS</span>
              <span className="text-sm font-medium">NO COST EMI AVAILABLE</span>
            </div>
          ))}
        </div>
      </div>

      {/* Trust Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-5xl font-bold mb-4">
                20000+ Happy<br />Customers
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Trusted by top startups &<br />working professionals
              </p>
              <div className="flex flex-wrap gap-4">
                <Badge className="bg-black text-white hover:bg-gray-800 py-3 px-6 text-sm">
                  <Shield className="w-4 h-4 mr-2" />
                  12 Months Warranty
                </Badge>
                <Badge className="bg-black text-white hover:bg-gray-800 py-3 px-6 text-sm">
                  <span className="mr-2">14</span>
                  14 Days Free Return
                </Badge>
                <Badge className="bg-black text-white hover:bg-gray-800 py-3 px-6 text-sm">
                  <span className="mr-2">%</span>
                  COD & EMI Available
                </Badge>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8"
                alt="Laptop"
                className="w-full rounded-2xl shadow-2xl"
              />
              <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-2xl font-bold text-blue-600">G</span>
                  <div>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-xs text-gray-600">4.9 Average Rating</p>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold text-orange-500">a</span>
                  <div>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-xs text-gray-600">4.7 Average Rating</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Categories</h2>
          {categoriesLoading ? (
            <div className="flex flex-wrap gap-4">
              <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ) : categories.length === 0 ? (
            <p className="text-gray-500">No categories available</p>
          ) : (
            <div className="flex flex-wrap gap-4">
              {categories.map((category) => {
                const categorySlug = category.slug || category.name?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                return (
                  <Link
                    key={category.id || category.name}
                    to={`/all-products?category=${categorySlug}`}
                  >
                    <Button variant="outline" className="hover:bg-black hover:text-white transition">
                      {category.name}
                    </Button>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Best Sellers */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Best Sellers</h2>
            <Link to="/all-products?sort=best-sellers">
              <Button variant="ghost">View More <ArrowRight className="ml-2 w-4 h-4" /></Button>
            </Link>
          </div>
          {bestSellersLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="h-96 bg-gray-200 rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : filteredBestSellers.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              {searchQuery ? `No best sellers found for "${searchQuery}"` : 'No best sellers available'}
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {filteredBestSellers.map((product) => (
                <ProductCard
                  key={product._id || product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Best Deals */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">
              Best <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Deals</span>
            </h2>
            <Link to="/all-products?sort=discount">
              <Button variant="ghost">View More <ArrowRight className="ml-2 w-4 h-4" /></Button>
            </Link>
          </div>
          {bestDealsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="h-96 bg-gray-200 rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : filteredBestDeals.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              {searchQuery ? `No deals found for "${searchQuery}"` : 'No deals available'}
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredBestDeals.map((product) => (
                <ProductCard
                  key={product._id || product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Trusted By Startups */}
      {/* <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-gray-600 mb-2">Trusted by</p>
            <h2 className="text-4xl font-bold mb-2">50+</h2>
            <p className="text-xl text-gray-600">Startup Founders</p>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-8">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="grayscale hover:grayscale-0 transition">
                <img src={testimonial.logo} alt={testimonial.company} className="h-16 w-16 object-contain" />
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* Why Choose Us */}
      <section className="py-20 bg-gradient-to-br from-green-50 via-white to-blue-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">Why Us?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition text-center">
              <div className="text-6xl font-bold text-green-600 mb-2">75%</div>
              <p className="text-xl font-semibold mb-2">Less Carbon Emission</p>
              <p className="text-gray-600 text-sm">Eco-friendly choice</p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition text-center">
              <div className="text-4xl font-bold mb-4">₹₹₹</div>
              <p className="text-xl font-semibold mb-2">Pocket Friendly</p>
              <p className="text-gray-600 text-sm">Much cheaper than new ones</p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition text-center">
              <Shield className="w-16 h-16 mx-auto mb-4 text-blue-600" />
              <p className="text-xl font-semibold mb-2">Free Extended Warranty</p>
              <p className="text-gray-600 text-sm">Ensuring protection</p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition text-center">
              <div className="text-4xl font-bold mb-4">100+</div>
              <p className="text-xl font-semibold mb-2">Options to choose from</p>
              <p className="text-gray-600 text-sm">Wide variety available</p>
            </div>
          </div>
        </div>
      </section>

      {/* Top Picks */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Top Picks</h2>
          {topPicksLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="h-96 bg-gray-200 rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : filteredTopPicks.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              {searchQuery ? `No top picks found for "${searchQuery}"` : 'No top picks available'}
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredTopPicks.map((product) => (
                <ProductCard
                  key={product._id || product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Brand Logos */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Shop your <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Favourite Brands</span> Laptops
          </h2>
          {brandsLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading brands...</p>
            </div>
          ) : brands.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No brands available</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6">
              {brands.map((brand) => (
                <div
                  key={brand.id}
                  className="bg-white rounded-xl p-6 flex items-center justify-center hover:shadow-lg transition group cursor-pointer"
                >
                  {brand.logo ? (
                    <img
                      src={brand.logo}
                      alt={brand.name}
                      className="h-12 w-12 object-contain grayscale group-hover:grayscale-0 transition"
                      onError={(e) => {
                        // Fallback to brand name if image fails to load
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                  ) : null}
                  <span
                    className="text-gray-600 font-semibold text-sm"
                    style={{ display: brand.logo ? 'none' : 'block' }}
                  >
                    {brand.name}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Blogs */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Blogs</h2>
            <Link to="/blogs">
              <Button variant="ghost">View All <ArrowRight className="ml-2 w-4 h-4" /></Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {blogs.map((blog) => (
              <Link key={blog.id} to={`/blog/${blog.slug}`} className="group">
                <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition">
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={blog.image}
                      alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-lg mb-2 line-clamp-2">{blog.title}</h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{blog.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{blog.date}</span>
                      <Button variant="ghost" size="sm" className="group-hover:text-blue-600">
                        Read more <ArrowRight className="ml-1 w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes scroll-left {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll-left {
          animation: scroll-left 20s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Home;