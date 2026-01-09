import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Plus, ChevronLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Separator } from '../components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { getCart, checkout } from '../api/cartApi';
import { getStoredUser } from '../api/authApi';
import { getAddresses, addAddress } from '../api/userApi';
import { createRazorpayOrder, verifyPayment } from '../api/paymentApi';
import { toast } from '../hooks/use-toast';

const Checkout = ({ onCartUpdate }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [newAddress, setNewAddress] = useState({
    fullName: '',
    phone: '',
    pincode: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    country: 'India',
    addressType: 'Home'
  });
  const navigate = useNavigate();

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await getCart();
      if (response.success && response.data.cart) {
        const cart = response.data.cart;
        setCartItems(cart.items || []);
        setCartTotal(cart.totalAmount || 0);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to load cart",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
    fetchSavedAddresses();
  }, []);

  const fetchSavedAddresses = async () => {
    try {
      const response = await getAddresses();
      if (response.success && Array.isArray(response.data)) {
        setAddresses(response.data);

        // Auto-select default address or first address
        if (response.data.length > 0 && !selectedAddress) {
          const defaultAddr = response.data.find(addr => addr.isDefault) || response.data[0];
          setSelectedAddress(defaultAddr);
        }
      }
    } catch (error) {
      console.error('Error fetching saved addresses:', error);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const response = await addAddress(newAddress);
      if (response.success) {
        setAddresses(response.data);
        // Find the newly added address (usually the last one or one with matching details)
        const addedAddress = response.data[response.data.length - 1];
        setSelectedAddress(addedAddress);

        setNewAddress({
          fullName: '',
          phone: '',
          pincode: '',
          addressLine1: '',
          addressLine2: '',
          city: '',
          state: '',
          country: 'India',
          addressType: 'Home'
        });
        setShowAddressForm(false);
        toast({
          title: "Address Added",
          description: "Your address has been saved successfully.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save address",
        variant: "destructive",
      });
    }
  };



  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleProceed = async () => {
    if (!selectedAddress && addresses.length === 0) {
      toast({
        title: "No Address Selected",
        description: "Please add and select a delivery address.",
        variant: "destructive"
      });
      return;
    }

    if (!selectedAddress) {
      toast({
        title: "Address Not Selected",
        description: "Please select a delivery address.",
        variant: "destructive"
      });
      return;
    }

    setProcessing(true);

    try {
      const isLoaded = await loadRazorpay();
      if (!isLoaded) {
        toast({
          title: "Error",
          description: "Razorpay SDK failed to load. Are you online?",
          variant: "destructive",
        });
        setProcessing(false);
        return;
      }

      // Get user's email from stored auth data
      const user = getStoredUser();
      const userEmail = user?.email || '';

      if (!userEmail) {
        toast({
          title: "Email Required",
          description: "Please ensure you are logged in with a valid email address.",
          variant: "destructive",
        });
        setProcessing(false);
        return;
      }

      // 1. Create Order on Backend
      const orderResponse = await createRazorpayOrder();

      if (!orderResponse.success) {
        throw new Error("Failed to create payment order");
      }

      const { data: orderData, key } = orderResponse;

      // 2. Initialize Razorpay Options
      const options = {
        key: key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Bright Laptop",
        description: "Laptop Purchase",
        image: "/logo.png", // Ensure you have a logo or remove this
        order_id: orderData.id,
        handler: async function (response) {
          try {
            // 3. Verify Payment on Backend
            const verificationData = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,

              // Pass Checkout Data for Order Creation
              shippingAddress: {
                fullName: selectedAddress.fullName,
                addressLine1: selectedAddress.addressLine1,
                addressLine2: selectedAddress.addressLine2 || '',
                city: selectedAddress.city,
                state: selectedAddress.state,
                postalCode: selectedAddress.pincode,
                country: selectedAddress.country || 'India',
                phone: selectedAddress.phone,
              },
              billingAddress: {
                fullName: selectedAddress.fullName,
                addressLine1: selectedAddress.addressLine1,
                addressLine2: selectedAddress.addressLine2 || '',
                city: selectedAddress.city,
                state: selectedAddress.state,
                postalCode: selectedAddress.pincode,
                country: selectedAddress.country || 'India',
                phone: selectedAddress.phone,
              },
              contactEmail: userEmail,
              contactPhone: selectedAddress.phone,
              notes: ''
            };

            const verifyResponse = await verifyPayment(verificationData);

            if (verifyResponse.success) {
              toast({
                title: "Order Placed",
                description: "Payment successful! Your order has been placed.",
              });
              if (onCartUpdate) onCartUpdate();
              navigate('/profile');
            } else {
              throw new Error("Payment verification failed");
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            toast({
              title: "Payment Verification Failed",
              description: "Payment was successful but verification failed. Please contact support.",
              variant: "destructive",
            });
          }
        },
        prefill: {
          name: selectedAddress.fullName,
          email: userEmail,
          contact: selectedAddress.phone
        },
        notes: {
          address: selectedAddress.addressLine1
        },
        theme: {
          color: "#000000"
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

      paymentObject.on('payment.failed', function (response) {
        toast({
          title: "Payment Failed",
          description: response.error.description || "Payment failed. Please try again.",
          variant: "destructive"
        });
      });

    } catch (error) {
      console.error('Error during checkout:', error);
      toast({
        title: "Checkout Failed",
        description: error.response?.data?.error || error.message || "Failed to initiate checkout.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const savings = cartItems.reduce((sum, item) => {
    const product = item.productId;
    const mrp = product?.mrp || product?.basePrice || 0;
    const unitPrice = item.unitPrice || 0;
    return sum + ((mrp - unitPrice) * item.quantity);
  }, 0);

  const subtotal = cartTotal + savings;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/cart')}
          className="mb-6"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to Cart
        </Button>

        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <span>Home</span>
          <span>/</span>
          <span>Cart</span>
          <span>/</span>
          <span className="text-black font-medium">Address</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Address Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Add Address Button */}
            <Card>
              <CardContent className="p-6">
                {addresses.length === 0 ? (
                  <div className="text-center py-8">
                    <MapPin className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-bold mb-2">No addresses found :(</h3>
                    <p className="text-gray-600 mb-6">Add a delivery address to proceed</p>
                    <Dialog open={showAddressForm} onOpenChange={setShowAddressForm}>
                      <DialogTrigger asChild>
                        <Button className="bg-black hover:bg-gray-800 text-white">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Address
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Add New Address</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleAddAddress} className="space-y-4 mt-4">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Full Name *</label>
                              <Input
                                value={newAddress.fullName}
                                onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                                placeholder="Enter your name"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Phone Number *</label>
                              <Input
                                value={newAddress.phone}
                                onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                                placeholder="10-digit mobile number"
                                required
                              />
                            </div>
                          </div>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Pincode *</label>
                              <Input
                                value={newAddress.pincode}
                                onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                                placeholder="6-digit pincode"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">City *</label>
                              <Input
                                value={newAddress.city}
                                onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                                placeholder="Enter city"
                                required
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Address (House No, Building, Street) *</label>
                            <Input
                              value={newAddress.addressLine1}
                              onChange={(e) => setNewAddress({ ...newAddress, addressLine1: e.target.value })}
                              placeholder="Enter complete address"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Locality / Town *</label>
                            <Input
                              value={newAddress.addressLine2}
                              onChange={(e) => setNewAddress({ ...newAddress, addressLine2: e.target.value })}
                              placeholder="Enter locality"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">State *</label>
                            <Input
                              value={newAddress.state}
                              onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                              placeholder="Enter state"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Address Type</label>
                            <div className="flex space-x-4">
                              <label className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  name="addressType"
                                  value="Home"
                                  checked={newAddress.addressType === 'Home'}
                                  onChange={(e) => setNewAddress({ ...newAddress, addressType: e.target.value })}
                                />
                                <span>Home</span>
                              </label>
                              <label className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  name="addressType"
                                  value="Work"
                                  checked={newAddress.addressType === 'Work'}
                                  onChange={(e) => setNewAddress({ ...newAddress, addressType: e.target.value })}
                                />
                                <span>Work</span>
                              </label>
                            </div>
                          </div>
                          <div className="flex justify-end space-x-4 pt-4">
                            <Button type="button" variant="outline" onClick={() => setShowAddressForm(false)}>
                              Cancel
                            </Button>
                            <Button type="submit" className="bg-black hover:bg-gray-800 text-white">
                              Save Address
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold">Select Delivery Address</h2>
                      <Dialog open={showAddressForm} onOpenChange={setShowAddressForm}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Plus className="w-4 h-4 mr-2" />
                            Add New Address
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Add New Address</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={handleAddAddress} className="space-y-4 mt-4">
                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium mb-2">Full Name *</label>
                                <Input
                                  value={newAddress.fullName}
                                  onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                                  placeholder="Enter your name"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-2">Phone Number *</label>
                                <Input
                                  value={newAddress.phone}
                                  onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                                  placeholder="10-digit mobile number"
                                  required
                                />
                              </div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium mb-2">Pincode *</label>
                                <Input
                                  value={newAddress.pincode}
                                  onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                                  placeholder="6-digit pincode"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-2">City *</label>
                                <Input
                                  value={newAddress.city}
                                  onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                                  placeholder="Enter city"
                                  required
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Address (House No, Building, Street) *</label>
                              <Input
                                value={newAddress.addressLine1}
                                onChange={(e) => setNewAddress({ ...newAddress, addressLine1: e.target.value })}
                                placeholder="Enter complete address"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Locality / Town *</label>
                              <Input
                                value={newAddress.addressLine2}
                                onChange={(e) => setNewAddress({ ...newAddress, addressLine2: e.target.value })}
                                placeholder="Enter locality"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">State *</label>
                              <Input
                                value={newAddress.state}
                                onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                                placeholder="Enter state"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Address Type</label>
                              <div className="flex space-x-4">
                                <label className="flex items-center space-x-2">
                                  <input
                                    type="radio"
                                    name="addressType"
                                    value="Home"
                                    checked={newAddress.addressType === 'Home'}
                                    onChange={(e) => setNewAddress({ ...newAddress, addressType: e.target.value })}
                                  />
                                  <span>Home</span>
                                </label>
                                <label className="flex items-center space-x-2">
                                  <input
                                    type="radio"
                                    name="addressType"
                                    value="Work"
                                    checked={newAddress.addressType === 'Work'}
                                    onChange={(e) => setNewAddress({ ...newAddress, addressType: e.target.value })}
                                  />
                                  <span>Work</span>
                                </label>
                              </div>
                            </div>
                            <div className="flex justify-end space-x-4 pt-4">
                              <Button type="button" variant="outline" onClick={() => setShowAddressForm(false)}>
                                Cancel
                              </Button>
                              <Button type="submit" className="bg-black hover:bg-gray-800 text-white">
                                Save Address
                              </Button>
                            </div>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <div className="space-y-4">
                      {addresses.map((address) => (
                        <Card
                          key={address.id}
                          className={`cursor-pointer transition-all hover:shadow-md ${selectedAddress?.id === address.id
                            ? 'border-black border-2 shadow-sm'
                            : 'border-gray-200 hover:border-gray-300'
                            }`}
                          onClick={() => setSelectedAddress(address)}
                        >
                          <CardContent className="p-5">
                            <div className="flex items-start space-x-4">
                              <div className="mt-1">
                                <input
                                  type="radio"
                                  checked={selectedAddress?.id === address.id}
                                  onChange={() => setSelectedAddress(address)}
                                  className="w-5 h-5 text-black focus:ring-black cursor-pointer"
                                />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center space-x-2">
                                    <span className="font-bold text-lg">{address.fullName}</span>
                                    <span className="bg-gray-100 text-xs px-2 py-1 rounded font-medium">
                                      {address.addressType}
                                    </span>
                                    {address.isDefault && (
                                      <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded font-medium">
                                        Default
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <p className="text-sm text-gray-700 mb-1 leading-relaxed">
                                  {address.addressLine1}
                                  {address.addressLine2 && `, ${address.addressLine2}`}
                                </p>
                                <p className="text-sm text-gray-700 mb-1">
                                  {address.city}, {address.state} - {address.pincode}
                                </p>
                                {address.country && (
                                  <p className="text-sm text-gray-600 mb-1">{address.country}</p>
                                )}
                                <p className="text-sm text-gray-600 font-medium mt-2">
                                  📞 {address.phone}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-6">Product Information & Review</h2>

                {cartItems.map((item, index) => {
                  const product = item.productId;
                  const productId = product?._id || product?.id || item.productId;
                  const productName = product?.name || 'Product';
                  // Handle images array - check if it exists and has items
                  let productImage = '/placeholder-image.jpg';
                  if (product?.images && Array.isArray(product.images) && product.images.length > 0) {
                    productImage = product.images[0];
                  } else if (product?.image) {
                    productImage = product.image;
                  }
                  const unitPrice = item.unitPrice || 0;

                  return (
                    <div key={item._id || productId}>
                      <div className="flex gap-4 mb-4">
                        <img
                          src={productImage}
                          alt={productName}
                          className="w-20 h-20 object-cover rounded"
                          onError={(e) => {
                            // Prevent infinite loop by checking if already set to placeholder
                            if (e.target.src !== window.location.origin + '/placeholder-image.jpg') {
                              e.target.src = '/placeholder-image.jpg';
                            }
                          }}
                          loading="lazy"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm line-clamp-2 mb-1">{productName}</h3>
                          {product?.specifications && (
                            <p className="text-xs text-gray-600 mb-1">
                              {product.specifications.storage || ''}, {product.specifications.ram || ''}
                            </p>
                          )}
                          <div className="flex items-center space-x-2">
                            <span className="font-bold">₹{unitPrice.toLocaleString()}</span>
                            <span className="text-xs text-gray-500">x {item.quantity}</span>
                          </div>
                        </div>
                      </div>
                      {index < cartItems.length - 1 && <Separator className="my-4" />}
                    </div>
                  );
                })}

                <Separator className="my-6" />

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span className="font-semibold">₹{subtotal.toLocaleString()}</span>
                  </div>
                  {savings > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount</span>
                      <span className="font-semibold">-₹{savings.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span className="font-semibold text-green-600">Free</span>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="flex justify-between text-lg font-bold mb-6">
                  <span>Total</span>
                  <span>₹{cartTotal.toLocaleString()}</span>
                </div>

                {/* <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Payment Method *</label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="COD">Cash on Delivery</SelectItem>
                      <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                      <SelectItem value="DEBIT_CARD">Debit Card</SelectItem>
                      <SelectItem value="UPI">UPI</SelectItem>
                      <SelectItem value="NET_BANKING">Net Banking</SelectItem>
                      <SelectItem value="WALLET">Wallet</SelectItem>
                    </SelectContent>
                  </Select>
                </div> */}

                <Button
                  onClick={handleProceed}
                  className="w-full bg-black hover:bg-gray-800 text-white py-6"
                  disabled={!selectedAddress || processing}
                >
                  {processing ? 'Processing...' : 'Proceed and Checkout'}
                </Button>

                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-600 flex items-center justify-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    100% Secured Payments
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;