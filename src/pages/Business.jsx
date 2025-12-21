import React from 'react';
import { Link } from 'react-router-dom';
import { Building, Users, TrendingUp, Shield, DollarSign, Headphones } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';

const Business = () => {
  return (
    <div className="py-12 bg-white min-h-screen">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-5xl font-bold mb-6">Business Solutions</h1>
          <p className="text-xl text-gray-600 leading-relaxed mb-8">
            Empower your team with quality refurbished laptops at unbeatable prices. 
            Perfect for startups, SMEs, and enterprises looking to scale efficiently.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact">
              <Button className="bg-black hover:bg-gray-800 text-white px-8 py-6 text-lg">
                Request Bulk Quote
              </Button>
            </Link>
            <Link to="/all-products">
              <Button variant="outline" className="px-8 py-6 text-lg">
                View Products
              </Button>
            </Link>
          </div>
        </div>

        {/* Why Choose Us for Business */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold mb-12 text-center">Why Businesses Choose Us</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition">
              <CardContent className="p-8 text-center">
                <DollarSign className="w-16 h-16 mx-auto mb-4 text-green-600" />
                <h3 className="text-xl font-bold mb-3">Cost Savings</h3>
                <p className="text-gray-600">
                  Save up to 70% compared to new devices without compromising on quality or performance.
                </p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition">
              <CardContent className="p-8 text-center">
                <TrendingUp className="w-16 h-16 mx-auto mb-4 text-blue-600" />
                <h3 className="text-xl font-bold mb-3">Scalability</h3>
                <p className="text-gray-600">
                  Easily scale your team with our large inventory and flexible bulk ordering options.
                </p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition">
              <CardContent className="p-8 text-center">
                <Shield className="w-16 h-16 mx-auto mb-4 text-purple-600" />
                <h3 className="text-xl font-bold mb-3">Quality Assurance</h3>
                <p className="text-gray-600">
                  Every device is certified with a 12-month warranty and rigorous quality checks.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Business Features */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-12 mb-20">
          <h2 className="text-3xl font-bold mb-12 text-center">Business Features</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="flex items-start space-x-4">
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <Building className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold mb-2">Bulk Discounts</h3>
                <p className="text-gray-700">Special pricing for orders of 10+ devices</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-bold mb-2">Dedicated Account Manager</h3>
                <p className="text-gray-700">Personal support for your business needs</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <Headphones className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-bold mb-2">Priority Support</h3>
                <p className="text-gray-700">Faster response times and dedicated support line</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <Shield className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-bold mb-2">Extended Warranty Options</h3>
                <p className="text-gray-700">Customize warranty coverage for your fleet</p>
              </div>
            </div>
          </div>
        </div>

        {/* Use Cases */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold mb-12 text-center">Perfect For</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="hover:shadow-lg transition">
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4">🚀</div>
                <h3 className="font-bold mb-2">Startups</h3>
                <p className="text-sm text-gray-600">Equip your team without breaking the bank</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition">
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4">🏫</div>
                <h3 className="font-bold mb-2">Educational Institutions</h3>
                <p className="text-sm text-gray-600">Affordable devices for students and staff</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition">
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4">🏢</div>
                <h3 className="font-bold mb-2">SMEs</h3>
                <p className="text-sm text-gray-600">Cost-effective IT solutions for growing businesses</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition">
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4">💼</div>
                <h3 className="font-bold mb-2">Remote Teams</h3>
                <p className="text-sm text-gray-600">Ship devices directly to your distributed workforce</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Testimonials */}
        <div className="bg-gray-50 rounded-2xl p-12">
          <h2 className="text-3xl font-bold mb-12 text-center">What Our Business Clients Say</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400">★</span>
                  ))}
                </div>
                <p className="text-gray-700 mb-4">
                  "Bright Laptop helped us equip our entire team of 25 with quality laptops at a fraction of the cost. 
                  The bulk discount and dedicated support made the process seamless."
                </p>
                <p className="font-semibold">- Founder, Tech Startup</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400">★</span>
                  ))}
                </div>
                <p className="text-gray-700 mb-4">
                  "Excellent quality and service! We've purchased over 50 devices for our students and haven't had a single issue. 
                  Highly recommended for educational institutions."
                </p>
                <p className="font-semibold">- IT Manager, Training Institute</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-20">
          <h2 className="text-3xl font-bold mb-6">Ready to Equip Your Team?</h2>
          <p className="text-xl text-gray-600 mb-8">Get in touch with us for a customized quote</p>
          <Link to="/contact">
            <Button className="bg-black hover:bg-gray-800 text-white px-8 py-6 text-lg">
              Contact Sales
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Business;