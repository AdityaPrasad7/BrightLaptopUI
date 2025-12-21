import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { toast } from '../hooks/use-toast';
import { register, storeAuthData } from '../api/authApi';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    isBusiness: false,
    businessName: '',
    gstNumber: '',
    businessAddress: ''
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter your full name",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    if (!formData.email.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter your email",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    if (!formData.password) {
      toast({
        title: "Validation Error",
        description: "Please enter a password",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Validation Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Validation Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    if (!termsAccepted) {
      toast({
        title: "Validation Error",
        description: "Please accept the Terms of Service and Privacy Policy",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Business validation
    if (formData.isBusiness) {
      if (!formData.businessName.trim()) {
        toast({
          title: "Validation Error",
          description: "Business name is required for B2B registration",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      if (!formData.gstNumber.trim()) {
        toast({
          title: "Validation Error",
          description: "GST number is required for B2B registration",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      if (!formData.businessAddress.trim()) {
        toast({
          title: "Validation Error",
          description: "Business address is required for B2B registration",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
    }

    try {
      // Determine role based on business checkbox
      const role = formData.isBusiness ? 'B2B_BUYER' : 'B2C_BUYER';

      // Prepare registration data
      const registrationData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: role,
      };

      // Add B2B specific fields if B2B buyer
      if (role === 'B2B_BUYER') {
        registrationData.companyName = formData.businessName.trim();
        registrationData.gstNumber = formData.gstNumber.trim().toUpperCase();
        registrationData.businessAddress = formData.businessAddress.trim();
      }

      // Call register API
      const response = await register(registrationData);

      if (response.success) {
        // Store auth data
        storeAuthData(response.data.token, response.data.user);

    toast({
      title: "Account Created",
      description: "Your account has been created successfully!",
    });

        // Redirect to home or profile
        navigate('/');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Registration failed. Please try again.';
      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
      <div className="container mx-auto px-4">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Create Account</h1>
              <p className="text-gray-600">Join us and start shopping</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Phone Number</label>
                <Input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 1234567890"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <Input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Confirm Password</label>
                <Input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  className="w-full"
                />
              </div>

              {/* Business Checkbox */}
              <div className="flex items-start space-x-2 p-4 bg-gray-50 rounded-lg">
                <input 
                  type="checkbox" 
                  className="mt-1 rounded" 
                  checked={formData.isBusiness}
                  onChange={(e) => setFormData({...formData, isBusiness: e.target.checked})}
                />
                <div>
                  <p className="font-medium text-sm">Are you a business?</p>
                  <p className="text-xs text-gray-600">Check this if you're registering for bulk purchases (B2B)</p>
                </div>
              </div>

              {/* Business Fields - Show only when business is checked */}
              {formData.isBusiness && (
                <div className="space-y-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <h3 className="font-semibold text-sm text-orange-800">Business Information</h3>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Business Name *</label>
                    <Input
                      type="text"
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleChange}
                      placeholder="Enter your business name"
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">GST Number *</label>
                    <Input
                      type="text"
                      name="gstNumber"
                      value={formData.gstNumber}
                      onChange={handleChange}
                      placeholder="Enter GST number (e.g., 29AAJCK8673K1ZN)"
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Business Address *</label>
                    <Input
                      type="text"
                      name="businessAddress"
                      value={formData.businessAddress}
                      onChange={handleChange}
                      placeholder="Enter complete business address"
                      className="w-full"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-start space-x-2">
                <input 
                  type="checkbox" 
                  className="mt-1 rounded" 
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                />
                <p className="text-xs text-gray-600">
                  I agree to the{' '}
                  <Link to="/terms" className="text-blue-600 hover:text-blue-700">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-blue-600 hover:text-blue-700">
                    Privacy Policy
                  </Link>
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-black hover:bg-gray-800 text-white py-6"
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                  Login
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Signup;