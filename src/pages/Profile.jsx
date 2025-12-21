import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Package, LogOut, MapPin, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { getStoredUser, logout, isAuthenticated } from '../api/authApi';
import { getOrders } from '../api/orderApi';
import { toast } from '../hooks/use-toast';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    // Get user from localStorage
    const storedUser = getStoredUser();
    if (storedUser) {
      setUser(storedUser);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setOrdersLoading(true);
        const response = await getOrders();
        if (response.success && response.data?.orders) {
          const ordersData = response.data.orders;
          setOrders(ordersData);
          
          // Extract unique addresses from orders
          const uniqueAddresses = [];
          const addressMap = new Map();
          
          ordersData.forEach((order) => {
            if (order.shippingAddress) {
              const addressKey = `${order.shippingAddress.fullName}-${order.shippingAddress.postalCode}-${order.shippingAddress.phone}`;
              if (!addressMap.has(addressKey)) {
                addressMap.set(addressKey, true);
                uniqueAddresses.push({
                  id: `addr-${uniqueAddresses.length + 1}`,
                  name: order.shippingAddress.fullName,
                  phone: order.shippingAddress.phone,
                  address: order.shippingAddress.addressLine1,
                  locality: order.shippingAddress.addressLine2 || '',
                  city: order.shippingAddress.city,
                  state: order.shippingAddress.state,
                  pincode: order.shippingAddress.postalCode,
                  country: order.shippingAddress.country,
                  addressType: 'Home', // Default, could be enhanced
                  isDefault: uniqueAddresses.length === 0, // First address as default
                });
              }
            }
          });
          
          setAddresses(uniqueAddresses);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast({
          title: "Error",
          description: error.response?.data?.error || "Failed to load orders",
          variant: "destructive",
        });
      } finally {
        setOrdersLoading(false);
      }
    };

    if (user) {
      fetchOrders();
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    navigate('/login');
  };

  if (!user) {
    return null; // or a loading spinner
  }

  // Helper function to format order ID
  const formatOrderId = (orderId) => {
    // If it's a MongoDB ObjectId, format it nicely
    if (orderId && orderId.length === 24) {
      return `ORD-${orderId.slice(-6).toUpperCase()}`;
    }
    return orderId || 'N/A';
  };

  // Helper function to get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'DELIVERED':
      case 'APPROVED':
        return 'bg-green-500';
      case 'SHIPPED':
      case 'IN_TRANSIT':
        return 'bg-blue-500';
      case 'PENDING':
        return 'bg-orange-500';
      case 'CANCELLED':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Helper function to format status display
  const formatStatus = (status) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">Profile</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* User Info Card */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="w-32 h-32 bg-black rounded-full flex items-center justify-center mb-4">
                    <User className="w-16 h-16 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">{user.name}</h2>
                </div>

                <Separator className="my-4" />

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Email</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                  {user.phone && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Phone</p>
                      <p className="font-medium">
                        <span className="mr-2">🇮🇳</span>
                        {user.phone}
                      </p>
                    </div>
                  )}
                  {user.role && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Role</p>
                      <Badge className="bg-blue-100 text-blue-700">
                        {user.role.replace('_', ' ')}
                      </Badge>
                    </div>
                  )}
                  {user.companyName && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Company</p>
                      <p className="font-medium">{user.companyName}</p>
                    </div>
                  )}
                </div>

                <Separator className="my-6" />

                <Button variant="outline" className="w-full" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Orders and Addresses */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="orders" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="orders">My Orders</TabsTrigger>
                <TabsTrigger value="addresses">Addresses</TabsTrigger>
              </TabsList>
              
              <TabsContent value="orders" className="mt-6">
                {ordersLoading ? (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <p className="text-gray-600">Loading orders...</p>
                    </CardContent>
                  </Card>
                ) : orders.length === 0 ? (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <div className="mb-6">
                        <Package className="w-24 h-24 mx-auto text-gray-300" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">No orders yet.</h3>
                      <p className="text-gray-600 mb-6">Start shopping to see your orders here</p>
                      <Link to="/all-products">
                        <Button className="bg-black hover:bg-gray-800 text-white">
                          Start Shopping
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => {
                      const firstProduct = order.products?.[0]?.productId;
                      const productId = firstProduct?._id || firstProduct?.id;
                      const productName = firstProduct?.name || 'Product';
                      let productImage = '/placeholder-image.jpg';
                      if (firstProduct?.images && Array.isArray(firstProduct.images) && firstProduct.images.length > 0) {
                        productImage = firstProduct.images[0];
                      } else if (firstProduct?.image) {
                        productImage = firstProduct.image;
                      }
                      const quantity = order.products?.[0]?.quantity || 0;
                      const orderId = order._id || order.id;
                      
                      return (
                        <Link key={orderId} to={`/order/${orderId}`}>
                          <Card className="hover:shadow-lg transition cursor-pointer">
                            <CardContent className="p-6">
                              <div className="flex items-start justify-between mb-4">
                                <div>
                                  <div className="flex items-center space-x-3 mb-2">
                                    <h3 className="font-bold text-lg">{formatOrderId(orderId)}</h3>
                                    <Badge className={`${getStatusColor(order.status)} text-white`}>
                                      {formatStatus(order.status)}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-gray-600">
                                    Ordered on {new Date(order.createdAt || order.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                  </p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-400" />
                              </div>
                              
                              <div className="flex items-center space-x-4 mb-4">
                                <img
                                  src={productImage}
                                  alt={productName}
                                  className="w-20 h-20 object-cover rounded"
                                  onError={(e) => {
                                    if (e.target.src !== window.location.origin + '/placeholder-image.jpg') {
                                      e.target.src = '/placeholder-image.jpg';
                                    }
                                  }}
                                  loading="lazy"
                                />
                                <div className="flex-1">
                                  <h4 className="font-semibold line-clamp-1">{productName}</h4>
                                  <p className="text-sm text-gray-600">Quantity: {quantity}</p>
                                  {order.orderType === 'B2B' && (
                                    <Badge className="bg-orange-100 text-orange-700 text-xs mt-1">B2B Order</Badge>
                                  )}
                                </div>
                              </div>

                              <Separator className="my-4" />

                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm text-gray-600">Total Amount</p>
                                  <p className="text-xl font-bold">₹{order.totalAmount?.toLocaleString() || '0'}</p>
                                </div>
                                <Button variant="outline">View Details</Button>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="addresses" className="mt-6">
                <div className="space-y-4">
                  {addresses.length === 0 ? (
                    <Card>
                      <CardContent className="p-12 text-center">
                        <div className="mb-6">
                          <MapPin className="w-24 h-24 mx-auto text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">No addresses found.</h3>
                        <p className="text-gray-600 mb-6">Addresses will appear here after you place an order</p>
                        <Link to="/all-products">
                          <Button className="bg-black hover:bg-gray-800 text-white">
                            Start Shopping
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ) : (
                    <>
                      {addresses.map((address) => (
                        <Card key={address.id} className={address.isDefault ? 'border-2 border-black' : ''}>
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <h3 className="font-bold">{address.name}</h3>
                                  <Badge variant="outline">{address.addressType}</Badge>
                                  {address.isDefault && (
                                    <Badge className="bg-black text-white">Default</Badge>
                                  )}
                                </div>
                                <p className="text-gray-700 mb-1">{address.address}</p>
                                {address.locality && (
                                  <p className="text-gray-700 mb-1">{address.locality}, {address.city}</p>
                                )}
                                {!address.locality && (
                                  <p className="text-gray-700 mb-1">{address.city}</p>
                                )}
                                <p className="text-gray-700 mb-2">{address.state} - {address.pincode}</p>
                                {address.country && (
                                  <p className="text-gray-600 text-sm mb-1">Country: {address.country}</p>
                                )}
                                <p className="text-gray-600 text-sm">Phone: {address.phone}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;