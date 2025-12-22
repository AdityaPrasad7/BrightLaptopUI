import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Slider } from '../components/ui/slider';
import { Checkbox } from '../components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../components/ui/sheet';
import { Badge } from '../components/ui/badge';
import { toast } from '../hooks/use-toast';
import { getProducts, getProductsByCategory, searchProducts } from '../api/productApi';

const NewLaptops = ({ onCartUpdate }) => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('relevance');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter states
  const [priceRange, setPriceRange] = useState([0, 200000]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedRAM, setSelectedRAM] = useState([]);
  const [selectedStorage, setSelectedStorage] = useState([]);
  const [selectedProcessor, setSelectedProcessor] = useState([]);
  const [selectedScreen, setSelectedScreen] = useState([]);

  const brands = ['Dell', 'HP', 'Lenovo', 'Apple', 'Asus', 'Acer'];
  const ramOptions = ['4GB', '8GB', '16GB', '32GB'];
  const storageOptions = ['128GB', '256GB', '512GB', '1TB'];
  const processorOptions = ['Intel i3', 'Intel i5', 'Intel i7', 'AMD Ryzen'];
  const screenOptions = ['13"', '14"', '15.6"', '17"'];

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const categoryParam = searchParams.get('category');
        const searchParam = searchParams.get('search');
        let response;

        if (searchParam && searchParam.trim().length > 0) {
          // Use search API when search query is present
          response = await searchProducts({ q: searchParam.trim(), limit: 100 });
        } else if (categoryParam && categoryParam !== 'all') {
          // getProductsByCategory will handle normalization (hyphens to spaces)
          response = await getProductsByCategory(categoryParam, { isActive: true });
        } else {
          response = await getProducts({ isActive: true });
        }

        if (response.success && response.data.products) {
          // Filter only new products (always filter by condition)
          const newProducts = response.data.products.filter(p => p.condition === 'new');
          setProducts(newProducts);

          // Set search query from URL if present
          if (searchParam) {
            setSearchQuery(searchParam);
          }

          // Extract unique brands, RAM, storage, processors, and screen sizes from products
          const uniqueBrands = [...new Set(newProducts.map(p => p.brand).filter(Boolean))];
          const uniqueRAM = [...new Set(newProducts.map(p => p.specifications?.ram).filter(Boolean))];
          const uniqueStorage = [...new Set(newProducts.map(p => p.specifications?.storage).filter(Boolean))];
          const uniqueProcessors = [...new Set(newProducts.map(p => p.specifications?.processor).filter(Boolean))];
          const uniqueScreens = [...new Set(newProducts.map(p => p.specifications?.screenSize || p.specifications?.screen).filter(Boolean))];

          // Update filter options dynamically if needed
          // (Keeping static options for now, but could use dynamic ones)
        } else {
          setError('Failed to load products');
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err.response?.data?.error || err.message || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchParams]);

  useEffect(() => {
    const searchParam = searchParams.get('search');
    let filtered = [...products];

    // Filter by search query (prioritize state, fall back to URL)
    // We filter strictly on name, brand, or category to avoid irrelevant results (e.g. description matches)
    const activeQuery = (searchQuery || searchParam || '').trim().toLowerCase();

    if (activeQuery) {
      // Create a clean query for numeric checks (remove % and commas)
      const numericQuery = activeQuery.replace(/[%,]/g, '');

      filtered = filtered.filter(p =>
        (p.name || '').toLowerCase().includes(activeQuery) ||
        (p.brand || '').toLowerCase().includes(activeQuery) ||
        (p.category || '').toLowerCase().includes(activeQuery) ||
        (p.basePrice || 0).toString().includes(numericQuery) ||
        (p.discountPercentage || 0).toString().includes(numericQuery) ||
        (p.specifications && Object.values(p.specifications).some(val =>
          (val || '').toString().toLowerCase().includes(activeQuery)
        ))
      );
    }

    // Price range filter
    filtered = filtered.filter(p => {
      const price = p.basePrice || 0;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Brand filter
    if (selectedBrands.length > 0) {
      filtered = filtered.filter(p => p.brand && selectedBrands.includes(p.brand));
    }

    // RAM filter
    if (selectedRAM.length > 0) {
      filtered = filtered.filter(p => {
        const ram = p.specifications?.ram;
        return ram && selectedRAM.some(selectedRam => ram.includes(selectedRam));
      });
    }

    // Storage filter
    if (selectedStorage.length > 0) {
      filtered = filtered.filter(p => {
        const storage = p.specifications?.storage;
        return storage && selectedStorage.some(selectedStorage => storage.includes(selectedStorage));
      });
    }

    // Processor filter
    if (selectedProcessor.length > 0) {
      filtered = filtered.filter(p => {
        const processor = p.specifications?.processor;
        return processor && selectedProcessor.some(proc => processor.toLowerCase().includes(proc.toLowerCase()));
      });
    }

    // Screen filter
    if (selectedScreen.length > 0) {
      filtered = filtered.filter(p => {
        const screen = p.specifications?.screenSize || p.specifications?.screen;
        return screen && selectedScreen.some(selectedScreen => screen.includes(selectedScreen));
      });
    }

    // Sorting
    if (sortBy === 'price-low') {
      filtered.sort((a, b) => (a.basePrice || 0) - (b.basePrice || 0));
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => (b.basePrice || 0) - (a.basePrice || 0));
    } else if (sortBy === 'rating') {
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'discount') {
      filtered.sort((a, b) => (b.discountPercentage || 0) - (a.discountPercentage || 0));
    } else if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    setFilteredProducts(filtered);
  }, [products, searchParams, sortBy, searchQuery, priceRange, selectedBrands, selectedRAM, selectedStorage, selectedProcessor, selectedScreen]);

  const handleAddToCart = (product) => {
    // TODO: Implement add to cart API call
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
    if (onCartUpdate) {
      onCartUpdate();
    }
  };

  const clearAllFilters = () => {
    setPriceRange([0, 200000]);
    setSelectedBrands([]);
    setSelectedRAM([]);
    setSelectedStorage([]);
    setSelectedProcessor([]);
    setSelectedScreen([]);
    setSearchQuery('');
  };

  const FilterSection = ({ title, options, selected, setSelected }) => (
    <div className="mb-6">
      <h3 className="font-semibold mb-3">{title}</h3>
      <div className="space-y-2">
        {options.map((option) => (
          <div key={option} className="flex items-center space-x-2">
            <Checkbox
              id={option}
              checked={selected.includes(option)}
              onCheckedChange={(checked) => {
                if (checked) {
                  setSelected([...selected, option]);
                } else {
                  setSelected(selected.filter(item => item !== option));
                }
              }}
            />
            <label htmlFor={option} className="text-sm cursor-pointer">
              {option}
            </label>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="py-12 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <h1 className="text-4xl font-bold">New Laptops</h1>
            <Badge className="bg-blue-600 text-white">Brand New</Badge>
          </div>
          <p className="text-gray-600">Save up to 70% on certified new laptops with 12-month warranty</p>
        </div>

        <div className="flex gap-6">
          {/* Desktop Filters Sidebar */}
          <div className="hidden lg:block w-64 shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-lg">Filters</h2>
                <Button variant="ghost" size="sm" onClick={clearAllFilters}>Clear All</Button>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Price Range</h3>
                <Slider
                  min={0}
                  max={200000}
                  step={1000}
                  value={priceRange}
                  onValueChange={setPriceRange}
                  className="mb-2"
                />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>₹{priceRange[0].toLocaleString()}</span>
                  <span>₹{priceRange[1].toLocaleString()}</span>
                </div>
              </div>

              <FilterSection title="Brand" options={brands} selected={selectedBrands} setSelected={setSelectedBrands} />
              <FilterSection title="RAM" options={ramOptions} selected={selectedRAM} setSelected={setSelectedRAM} />
              <FilterSection title="Storage" options={storageOptions} selected={selectedStorage} setSelected={setSelectedStorage} />
              <FilterSection title="Processor" options={processorOptions} selected={selectedProcessor} setSelected={setSelectedProcessor} />
              <FilterSection title="Screen Size" options={screenOptions} selected={selectedScreen} setSelected={setSelectedScreen} />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Mobile Filter Button & Search */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Mobile Filters */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="lg:hidden">
                      <SlidersHorizontal className="w-4 h-4 mr-2" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 overflow-y-auto">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <div className="mb-6">
                        <h3 className="font-semibold mb-3">Price Range</h3>
                        <Slider
                          min={0}
                          max={200000}
                          step={1000}
                          value={priceRange}
                          onValueChange={setPriceRange}
                          className="mb-2"
                        />
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>₹{priceRange[0].toLocaleString()}</span>
                          <span>₹{priceRange[1].toLocaleString()}</span>
                        </div>
                      </div>
                      <FilterSection title="Brand" options={brands} selected={selectedBrands} setSelected={setSelectedBrands} />
                      <FilterSection title="RAM" options={ramOptions} selected={selectedRAM} setSelected={setSelectedRAM} />
                      <FilterSection title="Storage" options={storageOptions} selected={selectedStorage} setSelected={setSelectedStorage} />
                      <FilterSection title="Processor" options={processorOptions} selected={selectedProcessor} setSelected={setSelectedProcessor} />
                      <FilterSection title="Screen Size" options={screenOptions} selected={selectedScreen} setSelected={setSelectedScreen} />
                      <Button onClick={clearAllFilters} variant="outline" className="w-full">
                        Clear All Filters
                      </Button>
                    </div>
                  </SheetContent>
                </Sheet>

                {/* Search */}
                <Input
                  type="text"
                  placeholder="Search laptops..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />

                {/* Sort */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="discount">Best Discount</SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-gray-600">
                  Showing {filteredProducts.length} new laptop{filteredProducts.length !== 1 ? 's' : ''}
                </p>
                {(selectedBrands.length > 0 || selectedRAM.length > 0 || selectedStorage.length > 0 || selectedProcessor.length > 0 || selectedScreen.length > 0) && (
                  <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                    Clear all filters
                  </Button>
                )}
              </div>
            </div>

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product._id || product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-lg">
                <p className="text-gray-500 text-lg mb-4">No products found matching your criteria</p>
                <Button onClick={clearAllFilters}>
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewLaptops;
