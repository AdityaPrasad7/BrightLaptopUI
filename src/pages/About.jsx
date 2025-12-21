import React from 'react';
import { Shield, Leaf, Award, Users } from 'lucide-react';

const About = () => {
  return (
    <div className="py-12 bg-white min-h-screen">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-5xl font-bold mb-6">About Bright Laptop</h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            We're on a mission to make premium technology accessible to everyone while reducing electronic waste. 
            Every device we refurbish is a step towards a more sustainable future.
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-8 mb-20">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">20,000+</div>
            <p className="text-gray-600">Happy Customers</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">50+</div>
            <p className="text-gray-600">Startup Partners</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-600 mb-2">75%</div>
            <p className="text-gray-600">Less Carbon Emission</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-orange-600 mb-2">12 Months</div>
            <p className="text-gray-600">Warranty</p>
          </div>
        </div>

        {/* Our Story */}
        <div className="max-w-4xl mx-auto mb-20">
          <h2 className="text-3xl font-bold mb-6">Our Story</h2>
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              Founded with a vision to bridge the gap between affordability and quality, Bright Laptop has become India's 
              trusted destination for certified refurbished laptops and computers. We believe that everyone deserves 
              access to premium technology without breaking the bank.
            </p>
            <p>
              Our team of expert technicians carefully inspects, tests, and refurbishes each device to meet the highest 
              quality standards. With over 20,000 satisfied customers and counting, we've helped individuals, startups, 
              and educational institutions access reliable technology at unbeatable prices.
            </p>
            <p>
              Beyond affordability, we're committed to environmental sustainability. Every refurbished device we sell 
              represents a step towards reducing electronic waste and minimizing our carbon footprint.
            </p>
          </div>
        </div>

        {/* Our Values */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold mb-12 text-center">Our Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Quality</h3>
              <p className="text-gray-600">
                Rigorous 40-point inspection ensures every device meets our high standards
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Leaf className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Sustainability</h3>
              <p className="text-gray-600">
                Reducing e-waste and carbon emissions through refurbishment
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-10 h-10 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Trust</h3>
              <p className="text-gray-600">
                Comprehensive warranty and excellent customer support
              </p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Accessibility</h3>
              <p className="text-gray-600">
                Making premium technology affordable for everyone
              </p>
            </div>
          </div>
        </div>

        {/* Quality Process */}
        <div className="bg-gray-50 rounded-2xl p-12">
          <h2 className="text-3xl font-bold mb-8 text-center">Our Quality Process</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mb-4">
                1
              </div>
              <h3 className="text-xl font-bold mb-2">Inspection</h3>
              <p className="text-gray-700">
                Every device undergoes a comprehensive 40-point hardware and software inspection to identify any issues.
              </p>
            </div>
            <div>
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mb-4">
                2
              </div>
              <h3 className="text-xl font-bold mb-2">Refurbishment</h3>
              <p className="text-gray-700">
                Our expert technicians repair, clean, and refurbish the device to restore it to excellent working condition.
              </p>
            </div>
            <div>
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mb-4">
                3
              </div>
              <h3 className="text-xl font-bold mb-2">Certification</h3>
              <p className="text-gray-700">
                Final testing and quality check ensures the device meets our certification standards before shipping.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;