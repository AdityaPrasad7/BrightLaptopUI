import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Search, ShoppingCart, User, ChevronDown, Menu, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { getProductCategoriesList } from '../api/categoryApi';
import { searchProducts } from '../api/productApi';

const Header = ({ cartCount = 0 }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        // Fetch categories from products endpoint - returns array of category name strings
        const response = await getProductCategoriesList();
        console.log('Categories API Response:', response);
        
        // The endpoint returns: { success: true, count: 5, data: { categories: ["all", "business", ...] } }
        let categoryNames = [];
        if (response.success && response.data?.categories) {
          categoryNames = response.data.categories;
        }
        
        console.log('Category names extracted:', categoryNames);
        
        // Transform array of strings into objects with name and slug
        const categoriesWithSlug = categoryNames
          .filter(name => name && typeof name === 'string') // Filter out invalid entries
          .map((name) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1), // Capitalize first letter
            slug: name.toLowerCase().replace(/\s+/g, '-'), // Convert to slug format
            id: name, // Use name as id for key
          }));
        
        console.log('Categories transformed:', categoriesWithSlug);
        
        setCategories(categoriesWithSlug);
      } catch (error) {
        console.error('Error fetching categories:', error);
        console.error('Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
        // Keep empty array on error, dropdown will just be empty
        setCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Sync search query with URL params
  useEffect(() => {
    const urlSearchParam = searchParams.get('search');
    if (urlSearchParam !== searchQuery) {
      setSearchQuery(urlSearchParam || '');
    }
  }, [searchParams]);

  // Debounced search effect - updates URL and performs search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const trimmedQuery = searchQuery.trim();
      
      // Update URL search param
      const newSearchParams = new URLSearchParams(searchParams);
      if (trimmedQuery.length > 0) {
        newSearchParams.set('search', trimmedQuery);
        performSearch(trimmedQuery);
      } else {
        newSearchParams.delete('search');
        setSearchResults([]);
        setShowSearchResults(false);
      }
      
      // Update URL without navigation (replace to avoid history spam)
      setSearchParams(newSearchParams, { replace: true });
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const performSearch = async (query) => {
    if (query.length < 1) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    try {
      setSearchLoading(true);
      const response = await searchProducts({ q: query, limit: 5 });
      
      if (response.success && response.data?.products) {
        setSearchResults(response.data.products);
        setShowSearchResults(true);
      } else {
        setSearchResults([]);
        setShowSearchResults(true);
      }
    } catch (error) {
      console.error('Error searching products:', error);
      setSearchResults([]);
      setShowSearchResults(false);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSearchResults(false);
      navigate(`/all-products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSearchResultClick = (product) => {
    setSearchQuery('');
    setShowSearchResults(false);
    navigate(`/product/${product._id || product.id}`);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    // Clear search results immediately when clearing input
    if (value.trim().length === 0) {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  const handleInputFocus = () => {
    if (searchResults.length > 0) {
      setShowSearchResults(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding to allow click on results
    setTimeout(() => {
      setShowSearchResults(false);
    }, 200);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img src="/bright-logo.webp" alt="Bright Laptop" className="h-8 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            <Link to="/" className="text-sm hover:text-gray-600 transition font-medium">
              Home
            </Link>
            <Link to="/refurbished-laptops" className="text-sm hover:text-gray-600 transition font-medium">
              Refurbished
            </Link>
            <Link to="/new-laptops" className="text-sm hover:text-gray-600 transition font-medium">
              New
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center space-x-1 text-sm hover:text-gray-600 transition">
                <span>Category</span>
                <ChevronDown className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {categoriesLoading ? (
                  <DropdownMenuItem disabled>Loading...</DropdownMenuItem>
                ) : categories.length === 0 ? (
                  <DropdownMenuItem disabled>No categories available</DropdownMenuItem>
                ) : (
                  categories.map((category) => {
                    // Use slug if available, otherwise use name converted to slug format
                    const categorySlug = category.slug || category.name?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                    return (
                      <DropdownMenuItem key={category._id || category.id} asChild>
                        <Link to={`/all-products?category=${categorySlug}`}>
                      {category.name}
                    </Link>
                  </DropdownMenuItem>
                    );
                  })
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <Link to="/business" className="text-sm hover:text-gray-600 transition">
              Business
            </Link>
            <Link to="/about" className="text-sm hover:text-gray-600 transition">
              About Us
            </Link>
            <Link to="/startups" className="text-sm hover:text-gray-600 transition">
              Startups
            </Link>
            <Link to="/blogs" className="text-sm hover:text-gray-600 transition">
              Blogs
            </Link>
          </nav>

          {/* Search, Cart, User */}
          <div className="flex items-center space-x-4">
            <form onSubmit={handleSearch} className="hidden md:flex items-center">
              <div className="relative w-48 lg:w-64">
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={handleInputChange}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  className="pr-10 w-full"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black text-white rounded-full p-1.5 hover:bg-gray-800 transition"
                >
                  <Search className="w-4 h-4" />
                </button>
                
                {/* Search Results Dropdown */}
                {showSearchResults && searchQuery.trim().length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                    {searchLoading ? (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        Searching...
                      </div>
                    ) : searchResults.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        No products found
                      </div>
                    ) : (
                      <>
                        {searchResults.map((product) => {
                          const productId = product._id || product.id;
                          const productImage = product.images && product.images.length > 0 
                            ? product.images[0] 
                            : '/placeholder-image.jpg';
                          const productName = product.name || 'Product';
                          const productPrice = product.basePrice || product.mrp || 0;
                          
                          return (
                            <div
                              key={productId}
                              onClick={() => handleSearchResultClick(product)}
                              className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                            >
                              <img
                                src={productImage}
                                alt={productName}
                                className="w-12 h-12 object-cover rounded"
                                onError={(e) => {
                                  e.target.src = '/placeholder-image.jpg';
                                }}
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {productName}
                                </p>
                                {product.brand && (
                                  <p className="text-xs text-gray-500">{product.brand}</p>
                                )}
                                <p className="text-sm font-semibold text-black mt-1">
                                  ₹{productPrice.toLocaleString()}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                        {searchResults.length > 0 && (
                          <div
                            onClick={handleSearch}
                            className="p-3 text-center text-sm font-medium text-black hover:bg-gray-50 cursor-pointer border-t border-gray-200"
                          >
                            View all results for "{searchQuery}"
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </form>

            <Link to="/cart" className="relative">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>

            <Link to="/profile">
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="w-5 h-5" />
              </Button>
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="lg:hidden py-4 border-t">
            <div className="flex flex-col space-y-3">
              <form onSubmit={handleSearch} className="md:hidden mb-3">
                <div className="relative w-full">
                  <Input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    className="pr-10 w-full"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black text-white rounded-full p-1.5"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                  
                  {/* Mobile Search Results Dropdown */}
                  {showSearchResults && searchQuery.trim().length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                      {searchLoading ? (
                        <div className="p-4 text-center text-gray-500 text-sm">
                          Searching...
                        </div>
                      ) : searchResults.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 text-sm">
                          No products found
                        </div>
                      ) : (
                        <>
                          {searchResults.map((product) => {
                            const productId = product._id || product.id;
                            const productImage = product.images && product.images.length > 0 
                              ? product.images[0] 
                              : '/placeholder-image.jpg';
                            const productName = product.name || 'Product';
                            const productPrice = product.basePrice || product.mrp || 0;
                            
                            return (
                              <div
                                key={productId}
                                onClick={() => handleSearchResultClick(product)}
                                className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                              >
                                <img
                                  src={productImage}
                                  alt={productName}
                                  className="w-12 h-12 object-cover rounded"
                                  onError={(e) => {
                                    e.target.src = '/placeholder-image.jpg';
                                  }}
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {productName}
                                  </p>
                                  {product.brand && (
                                    <p className="text-xs text-gray-500">{product.brand}</p>
                                  )}
                                  <p className="text-sm font-semibold text-black mt-1">
                                    ₹{productPrice.toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                          {searchResults.length > 0 && (
                            <div
                              onClick={handleSearch}
                              className="p-3 text-center text-sm font-medium text-black hover:bg-gray-50 cursor-pointer border-t border-gray-200"
                            >
                              View all results for "{searchQuery}"
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </form>
              <Link to="/" className="text-sm py-2 font-medium" onClick={() => setIsMenuOpen(false)}>
                Home
              </Link>
              <Link to="/refurbished-laptops" className="text-sm py-2 font-medium" onClick={() => setIsMenuOpen(false)}>
                Refurbished Laptops
              </Link>
              <Link to="/new-laptops" className="text-sm py-2 font-medium" onClick={() => setIsMenuOpen(false)}>
                New Laptops
              </Link>
              {categoriesLoading ? (
                <div className="text-sm py-2 pl-4 text-gray-500">Loading...</div>
              ) : categories.length === 0 ? (
                <div className="text-sm py-2 pl-4 text-gray-500">No categories available</div>
              ) : (
                categories.map((category) => {
                  // Use slug if available, otherwise use name converted to slug format
                  const categorySlug = category.slug || category.name?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                  return (
                <Link
                      key={category._id || category.id}
                      to={`/all-products?category=${categorySlug}`}
                  className="text-sm py-2 pl-4"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {category.name}
                </Link>
                  );
                })
              )}
              <Link to="/business" className="text-sm py-2" onClick={() => setIsMenuOpen(false)}>
                Business
              </Link>
              <Link to="/about" className="text-sm py-2" onClick={() => setIsMenuOpen(false)}>
                About Us
              </Link>
              <Link to="/startups" className="text-sm py-2" onClick={() => setIsMenuOpen(false)}>
                Startups
              </Link>
              <Link to="/blogs" className="text-sm py-2" onClick={() => setIsMenuOpen(false)}>
                Blogs
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;