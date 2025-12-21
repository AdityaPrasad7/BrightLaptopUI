import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Linkedin, Twitter } from 'lucide-react';
import { getProductCategoriesList } from '../api/categoryApi';

const Footer = () => {
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Fetch categories from API
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
              name: name.charAt(0).toUpperCase() + name.slice(1), // Capitalize first letter
              slug: name.toLowerCase().replace(/\s+/g, '-'), // Convert to slug format
              id: name,
            }));
          
          setCategories(categoryObjects);
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

  return (
    <footer className="bg-white border-t border-gray-200 mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="font-bold text-lg mb-4">Bright Laptop</h3>
            <p className="text-sm text-gray-600 mb-4">
              2nd Floor, SRS Arcade, 15/2, Hosa Rd, Kasavanahalli,<br />
              Bengaluru, Karnataka - 560035, India
            </p>
            <p className="text-sm text-gray-600 mb-4">GSTIN: 29AAJCK8673K1ZN</p>
            <p className="text-sm text-gray-600">Bright Laptop Technologies Private Limited</p>
            <div className="flex space-x-4 mt-6">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-black transition">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-black transition">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-black transition">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-bold text-lg mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/contact" className="text-gray-600 hover:text-black transition">Contact us</Link></li>
              <li><a href="mailto:contact@brightlaptop" className="text-gray-600 hover:text-black transition">contact@brightlaptop</a></li>
              <li><a href="tel:+919964093100" className="text-gray-600 hover:text-black transition">For Sales - +919964093100</a></li>
              <li><a href="tel:+919513245671" className="text-gray-600 hover:text-black transition">For Service / Warranty - +919513245671</a></li>
            </ul>
          </div>

          {/* Products */}
          <div>
            <h3 className="font-bold text-lg mb-4">Products</h3>
            {categoriesLoading ? (
              <ul className="space-y-2 text-sm">
                <li className="text-gray-500">Loading categories...</li>
              </ul>
            ) : categories.length === 0 ? (
              <ul className="space-y-2 text-sm">
                <li className="text-gray-500">No categories available</li>
              </ul>
            ) : (
              <ul className="space-y-2 text-sm">
                {categories.map((category) => {
                  const categorySlug = category.slug || category.name?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                  return (
                    <li key={category.id || category.name}>
                      <Link 
                        to={`/all-products?category=${categorySlug}`} 
                        className="text-gray-600 hover:text-black transition"
                      >
                        {category.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Help */}
          <div>
            <h3 className="font-bold text-lg mb-4">Help</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/terms" className="text-gray-600 hover:text-black transition">Terms of service</Link></li>
              <li><Link to="/shipping" className="text-gray-600 hover:text-black transition">Shipping Policy</Link></li>
              <li><Link to="/return" className="text-gray-600 hover:text-black transition">Return Policy</Link></li>
              <li><Link to="/warranty" className="text-gray-600 hover:text-black transition">Warranty Policy</Link></li>
              <li><Link to="/privacy" className="text-gray-600 hover:text-black transition">Privacy Policy</Link></li>
              <li><Link to="/blogs" className="text-gray-600 hover:text-black transition">Blogs</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-600">Copyright © 2025 Bright Laptop</p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-black transition">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-black transition">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-black transition">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* WhatsApp Floating Button */}
      <a
        href="https://wa.me/919845044638?text=Hi!%20I'm%20interested%20in%20your%20products."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-green-500 text-white rounded-full p-4 shadow-lg hover:bg-green-600 transition z-50"
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
      </a>
    </footer>
  );
};

export default Footer;