import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Download, Package, MapPin, Phone, CheckCircle, Circle, Truck } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { getOrderById } from '../api/orderApi';
import { toast } from '../hooks/use-toast';

const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getOrderById(orderId);
        if (response.success && response.data?.order) {
          setOrder(response.data.order);
        } else {
          setError('Order not found');
        }
      } catch (err) {
        console.error('Error fetching order:', err);
        setError(err.response?.data?.error || 'Failed to load order');
        toast({
          title: "Error",
          description: err.response?.data?.error || "Failed to load order details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const handleDownloadInvoice = () => {
    toast({
      title: "Downloading Invoice",
      description: "Your invoice is being prepared for download.",
    });
    // In a real app, this would trigger PDF download
  };

  // Helper function to format order ID
  const formatOrderId = (id) => {
    if (id && id.length === 24) {
      return `ORD-${id.slice(-6).toUpperCase()}`;
    }
    return id || 'N/A';
  };

  // Helper function to get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED':
      case 'DELIVERED':
        return 'bg-green-500';
      case 'SHIPPED':
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

  // Generate timeline from order status
  const generateTimeline = (order) => {
    const timeline = [];
    const statusOrder = ['PENDING', 'APPROVED', 'SHIPPED', 'DELIVERED'];
    const currentStatusIndex = statusOrder.indexOf(order.status);
    
    statusOrder.forEach((status, index) => {
      if (index <= currentStatusIndex) {
        timeline.push({
          status: formatStatus(status),
          completed: true,
          date: index === currentStatusIndex ? new Date(order.updatedAt || order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Completed'
        });
      } else {
        timeline.push({
          status: formatStatus(status),
          completed: false,
          date: 'Pending'
        });
      }
    });
    
    return timeline;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500 mb-4">{error || 'Order not found'}</p>
          <Button onClick={() => navigate('/profile')} variant="outline">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Orders
          </Button>
        </div>
      </div>
    );
  }

  const timeline = generateTimeline(order);

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/profile')}
          className="mb-6"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to Orders
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-2xl font-bold mb-2">Order {formatOrderId(order._id || order.id)}</h1>
                    <p className="text-gray-600">
                      Placed on {new Date(order.createdAt || order.date).toLocaleDateString('en-IN', { 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </p>
                  </div>
                  <Badge className={`${getStatusColor(order.status)} text-white text-base py-1 px-4`}>
                    {formatStatus(order.status)}
                  </Badge>
                </div>
                <div className="flex space-x-4">
                  <Button 
                    variant="outline" 
                    onClick={handleDownloadInvoice}
                    className="flex-1"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Invoice
                  </Button>
                  {order.status !== 'APPROVED' && order.status !== 'SHIPPED' && order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                    <Button variant="outline" className="flex-1">
                      Cancel Order
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Tracking Timeline */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Track Shipment</h2>
                  {order.deliveryDate && (
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Scheduled Delivery</p>
                      <p className="font-semibold">{new Date(order.deliveryDate).toLocaleDateString('en-IN', { 
                        day: 'numeric', 
                        month: 'short', 
                        year: 'numeric' 
                      })}</p>
                    </div>
                  )}
                </div>

                {order.status === 'APPROVED' || order.status === 'SHIPPED' ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <p className="text-blue-800 font-medium">
                      <Truck className="w-4 h-4 inline mr-2" />
                      {order.status === 'SHIPPED' ? 'Shipped' : 'Order Approved'} - {order.deliveryDate ? `Expected delivery: ${new Date(order.deliveryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}` : 'Delivery date will be updated soon'}
                    </p>
                  </div>
                ) : order.status === 'PENDING' ? (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                    <p className="text-orange-800 font-medium">
                      Order is pending approval
                    </p>
                  </div>
                ) : null}

                <div className="space-y-6">
                  {timeline.map((step, index) => (
                    <div key={index} className="flex items-start">
                      <div className="flex flex-col items-center mr-4">
                        {step.completed ? (
                          <CheckCircle className="w-6 h-6 text-green-500 fill-current" />
                        ) : (
                          <Circle className="w-6 h-6 text-gray-300" />
                        )}
                        {index < timeline.length - 1 && (
                          <div className={`w-0.5 h-12 ${step.completed ? 'bg-green-500' : 'bg-gray-300'}`} />
                        )}
                      </div>
                      <div className="flex-1 pt-0.5">
                        <h3 className={`font-semibold ${step.completed ? 'text-black' : 'text-gray-400'}`}>
                          {step.status}
                        </h3>
                        <p className={`text-sm ${step.completed ? 'text-gray-600' : 'text-gray-400'}`}>
                          {step.date}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-6">Order Items</h2>
                <div className="space-y-4">
                  {order.products?.map((orderItem, index) => {
                    const product = orderItem.productId;
                    const productId = product?._id || product?.id;
                    const productName = product?.name || 'Product';
                    let productImage = '/placeholder-image.jpg';
                    if (product?.images && Array.isArray(product.images) && product.images.length > 0) {
                      productImage = product.images[0];
                    } else if (product?.image) {
                      productImage = product.image;
                    }
                    const quantity = orderItem.quantity || 0;
                    const unitPrice = orderItem.priceAtPurchase || 0;
                    const totalPrice = unitPrice * quantity;
                    
                    return (
                      <div key={productId || index}>
                        <div className="flex gap-4">
                          <img
                            src={productImage}
                            alt={productName}
                            className="w-24 h-24 object-cover rounded"
                            onError={(e) => {
                              if (e.target.src !== window.location.origin + '/placeholder-image.jpg') {
                                e.target.src = '/placeholder-image.jpg';
                              }
                            }}
                            loading="lazy"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold mb-1">{productName}</h3>
                            {product?.brand && (
                              <p className="text-sm text-gray-600 mb-2">{product.brand}</p>
                            )}
                            <div className="flex items-center space-x-2">
                              {order.orderType === 'B2B' ? (
                                <Badge className="bg-orange-500 text-white text-xs">B2B Pricing</Badge>
                              ) : (
                                <Badge className="bg-blue-500 text-white text-xs">B2C Pricing</Badge>
                              )}
                              <span className="text-sm text-gray-600">Qty: {quantity}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">₹{totalPrice.toLocaleString()}</p>
                            <p className="text-sm text-gray-600">₹{unitPrice.toLocaleString()} each</p>
                          </div>
                        </div>
                        {index < order.products.length - 1 && <Separator className="my-4" />}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Order Summary */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold">₹{order.totalAmount?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-semibold text-green-600">FREE</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="font-bold">Total</span>
                    <span className="font-bold text-xl">₹{order.totalAmount?.toLocaleString() || '0'}</span>
                  </div>
                  {order.paymentMethod && (
                    <>
                      <Separator />
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Payment Method</span>
                        <span className="font-semibold">{order.paymentMethod.replace('_', ' ')}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Payment Status</span>
                        <Badge className={order.paymentStatus === 'PAID' ? 'bg-green-500' : 'bg-orange-500'}>{order.paymentStatus || 'PENDING'}</Badge>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Shipping Address
                </h2>
                {order.shippingAddress ? (
                  <div className="text-sm space-y-1">
                    <p className="font-semibold">{order.shippingAddress.fullName}</p>
                    <p className="text-gray-700">{order.shippingAddress.addressLine1}</p>
                    {order.shippingAddress.addressLine2 && (
                      <p className="text-gray-700">{order.shippingAddress.addressLine2}</p>
                    )}
                    <p className="text-gray-700">{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                    <p className="text-gray-700">{order.shippingAddress.postalCode}</p>
                    {order.shippingAddress.country && (
                      <p className="text-gray-700">{order.shippingAddress.country}</p>
                    )}
                    <p className="text-gray-600 flex items-center mt-2">
                      <Phone className="w-4 h-4 mr-1" />
                      {order.shippingAddress.phone}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Address not available</p>
                )}
                {order.contactEmail && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-600">Contact Email</p>
                    <p className="text-sm font-medium">{order.contactEmail}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Need Help */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">Need Help?</h2>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Package className="w-4 h-4 mr-2" />
                    Return/Replace Items
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Phone className="w-4 h-4 mr-2" />
                    Contact Support
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
