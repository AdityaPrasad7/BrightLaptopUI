import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, DollarSign, Users, Rocket } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { testimonials } from '../mockData';

const Startups = () => {
  return (
    <div className="py-12 bg-white min-h-screen">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-5xl font-bold mb-6">
            Power Your Startup with <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Premium Tech</span>
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed mb-8">
            Join 50+ successful startups who trust Bright Laptop for their technology needs.
            Get quality refurbished laptops that help you scale without the hefty price tag.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact">
              <Button className="bg-black hover:bg-gray-800 text-white px-8 py-6 text-lg">
                Get Startup Pricing
              </Button>
            </Link>
            <Link to="/all-products">
              <Button variant="outline" className="px-8 py-6 text-lg">
                Browse Products
              </Button>
            </Link>
          </div>
        </div>

        {/* Benefits */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold mb-12 text-center">Why Startups Love Us</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="hover:shadow-lg transition border-2 hover:border-blue-500">
              <CardContent className="p-8 text-center">
                <DollarSign className="w-16 h-16 mx-auto mb-4 text-green-600" />
                <h3 className="text-xl font-bold mb-3">Save 70%</h3>
                <p className="text-gray-600">
                  Invest your runway wisely. Get premium laptops at 70% less than new prices.
                </p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition border-2 hover:border-purple-500">
              <CardContent className="p-8 text-center">
                <Zap className="w-16 h-16 mx-auto mb-4 text-purple-600" />
                <h3 className="text-xl font-bold mb-3">Quick Setup</h3>
                <p className="text-gray-600">
                  Get your team up and running in days, not weeks. Fast delivery across India.
                </p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition border-2 hover:border-orange-500">
              <CardContent className="p-8 text-center">
                <Users className="w-16 h-16 mx-auto mb-4 text-orange-600" />
                <h3 className="text-xl font-bold mb-3">Scale Easily</h3>
                <p className="text-gray-600">
                  Growing your team? We've got you covered with flexible bulk ordering.
                </p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition border-2 hover:border-blue-500">
              <CardContent className="p-8 text-center">
                <Rocket className="w-16 h-16 mx-auto mb-4 text-blue-600" />
                <h3 className="text-xl font-bold mb-3">Startup Support</h3>
                <p className="text-gray-600">
                  Dedicated account manager and priority support for startup partners.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Trusted By */}
        {/* <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-12 mb-20">
          <h2 className="text-3xl font-bold mb-4 text-center">Trusted by 50+ Startup Founders</h2>
          <p className="text-center text-gray-600 mb-12">Join innovative startups who are building the future with Bright Laptop</p>
          <div className="flex flex-wrap justify-center items-center gap-12">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="grayscale hover:grayscale-0 transition">
                <img src={testimonial.logo} alt={testimonial.company} className="h-20 w-20 object-contain" />
              </div>
            ))}
          </div>
        </div> */}

        {/* Special Offers */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold mb-12 text-center">Exclusive Startup Benefits</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white border-2 border-green-200 rounded-xl p-6">
              <div className="text-3xl font-bold text-green-600 mb-2">15%</div>
              <h3 className="font-bold text-lg mb-2">Extra Discount</h3>
              <p className="text-sm text-gray-600">Additional 15% off on bulk orders of 10+ devices</p>
            </div>
            <div className="bg-white border-2 border-blue-200 rounded-xl p-6">
              <div className="text-3xl font-bold text-blue-600 mb-2">FREE</div>
              <h3 className="font-bold text-lg mb-2">Priority Support</h3>
              <p className="text-sm text-gray-600">Dedicated support line with faster response times</p>
            </div>
            <div className="bg-white border-2 border-purple-200 rounded-xl p-6">
              <div className="text-3xl font-bold text-purple-600 mb-2">18M</div>
              <h3 className="font-bold text-lg mb-2">Extended Warranty</h3>
              <p className="text-sm text-gray-600">Extended warranty options up to 18 months</p>
            </div>
          </div>
        </div>

        {/* Use Cases */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold mb-12 text-center">Perfect For Every Startup Role</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:shadow-lg transition">
              <CardContent className="p-6">
                <div className="text-4xl mb-4">💻</div>
                <h3 className="font-bold mb-2">Developers</h3>
                <p className="text-sm text-gray-600">High-performance laptops for coding and development work</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition">
              <CardContent className="p-6">
                <div className="text-4xl mb-4">🎨</div>
                <h3 className="font-bold mb-2">Designers</h3>
                <p className="text-sm text-gray-600">Powerful machines for creative work and design software</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition">
              <CardContent className="p-6">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="font-bold mb-2">Sales Teams</h3>
                <p className="text-sm text-gray-600">Reliable laptops for presentations and client meetings</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition">
              <CardContent className="p-6">
                <div className="text-4xl mb-4">📧</div>
                <h3 className="font-bold mb-2">Operations</h3>
                <p className="text-sm text-gray-600">Efficient devices for daily tasks and productivity</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Success Stories */}
        <div className="bg-gray-50 rounded-2xl p-12 mb-20">
          <h2 className="text-3xl font-bold mb-12 text-center">Startup Success Stories</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400">★</span>
                  ))}
                </div>
                <p className="text-gray-700 mb-4">
                  "As a bootstrapped startup, every rupee counts. Bright Laptop helped us save over ₹3 lakhs on our initial tech setup.
                  The quality is outstanding and we've had zero issues!"
                </p>
                <p className="font-semibold">- Priya S., Founder, EdTech Startup</p>
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
                  "We scaled from 5 to 30 people in 6 months. Bright Laptop's bulk pricing and quick delivery made it seamless.
                  Our dedicated account manager was always responsive and helpful."
                </p>
                <p className="font-semibold">- Rahul M., CTO, SaaS Startup</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Build Your Dream Team?</h2>
          <p className="text-xl text-gray-600 mb-8">Get exclusive startup pricing and benefits</p>
          <Link to="/contact">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 text-lg">
              Claim Your Startup Offer
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Startups;