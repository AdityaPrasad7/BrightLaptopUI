import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Download, Package, MapPin, Phone, CheckCircle, Circle, Truck, FileText, Eye, AlertCircle, MessageSquare } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { getOrderById, getInvoice } from '../api/orderApi';
import { createComplaint, getComplaints } from '../api/complaintApi';
import { toast } from '../hooks/use-toast';
import { generateInvoicePDF } from '../utils/invoicePDF';
import InvoiceView from '../components/InvoiceView';

const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [invoiceData, setInvoiceData] = useState(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [showInvoiceView, setShowInvoiceView] = useState(false);
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [complaintCategory, setComplaintCategory] = useState('');
  const [complaintDescription, setComplaintDescription] = useState('');
  const [complaintLoading, setComplaintLoading] = useState(false);
  const [complaints, setComplaints] = useState([]);
  const [complaintsLoading, setComplaintsLoading] = useState(false);

  // Fetch invoice data separately
  const fetchInvoiceData = async () => {
    try {
      setInvoiceLoading(true);
      const response = await getInvoice(orderId);
      if (response.success && response.data?.invoice) {
        setInvoiceData(response.data);
      }
    } catch (err) {
      console.error('Error fetching invoice:', err);
      // Don't show error toast for invoice, just log it
      // Invoice might not be generated yet
    } finally {
      setInvoiceLoading(false);
    }
  };

  // Fetch complaints for this order
  const fetchComplaints = async () => {
    try {
      setComplaintsLoading(true);
      const response = await getComplaints({ orderId });
      if (response.success && response.data?.complaints) {
        setComplaints(response.data.complaints);
      }
    } catch (err) {
      console.error('Error fetching complaints:', err);
    } finally {
      setComplaintsLoading(false);
    }
  };

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getOrderById(orderId);
        if (response.success && response.data?.order) {
          setOrder(response.data.order);
          
          // Fetch invoice if order is paid
          if (response.data.order.paymentStatus === 'PAID') {
            fetchInvoiceData();
          }
          
          // Fetch complaints for this order
          fetchComplaints();
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

  const handleDownloadInvoice = async () => {
    try {
      // If invoice data is not loaded yet, fetch it
      if (!invoiceData && order?.paymentStatus === 'PAID') {
        toast({
          title: "Loading Invoice",
          description: "Please wait while we prepare your invoice...",
        });
        
        setInvoiceLoading(true);
        const response = await getInvoice(orderId);
        if (response.success && response.data?.invoice) {
          setInvoiceData(response.data);
          generateInvoicePDF(response.data);
          toast({
            title: "Invoice Downloaded",
            description: "Your invoice has been downloaded successfully.",
          });
        } else {
          toast({
            title: "Error",
            description: "Failed to load invoice data",
            variant: "destructive",
          });
        }
        setInvoiceLoading(false);
      } else if (invoiceData) {
        // Generate PDF with existing invoice data
        generateInvoicePDF(invoiceData);
        toast({
          title: "Invoice Downloaded",
          description: "Your invoice has been downloaded successfully.",
        });
      } else {
        toast({
          title: "Invoice Not Available",
          description: "Invoice can only be generated for paid orders.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error('Error downloading invoice:', err);
      toast({
        title: "Error",
        description: err.response?.data?.error || "Failed to download invoice",
        variant: "destructive",
      });
    }
  };

  const handleViewInvoice = async () => {
    try {
      // If invoice data is not loaded yet, fetch it
      if (!invoiceData && order?.paymentStatus === 'PAID') {
        setInvoiceLoading(true);
        const response = await getInvoice(orderId);
        if (response.success && response.data?.invoice) {
          setInvoiceData(response.data);
          setShowInvoiceView(true);
        } else {
          toast({
            title: "Error",
            description: "Failed to load invoice data",
            variant: "destructive",
          });
        }
        setInvoiceLoading(false);
      } else if (invoiceData) {
        setShowInvoiceView(true);
      } else {
        toast({
          title: "Invoice Not Available",
          description: "Invoice can only be generated for paid orders.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error('Error loading invoice:', err);
      toast({
        title: "Error",
        description: err.response?.data?.error || "Failed to load invoice",
        variant: "destructive",
      });
      setInvoiceLoading(false);
    }
  };

  const handleRaiseComplaint = async () => {
    if (!complaintCategory || !complaintDescription.trim()) {
      toast({
        title: "Validation Error",
        description: "Please select a category and provide a description",
        variant: "destructive",
      });
      return;
    }

    try {
      setComplaintLoading(true);
      
      // Get the first product from the order
      const firstProduct = order.products?.[0]?.productId;
      const productId = firstProduct?._id || firstProduct?.id;

      const complaintData = {
        orderId: order._id || order.id,
        productId: productId || null,
        category: complaintCategory,
        description: complaintDescription.trim(),
      };

      const response = await createComplaint(complaintData);
      
      if (response.success) {
        toast({
          title: "Complaint Raised",
          description: "Your complaint has been submitted successfully. We'll get back to you soon.",
        });
        setShowComplaintModal(false);
        setComplaintCategory('');
        setComplaintDescription('');
        // Refresh complaints list
        fetchComplaints();
      }
    } catch (err) {
      console.error('Error raising complaint:', err);
      toast({
        title: "Error",
        description: err.response?.data?.error || "Failed to raise complaint",
        variant: "destructive",
      });
    } finally {
      setComplaintLoading(false);
    }
  };


  // Helper function to format order ID
  const formatOrderId = (id) => {
    if (id && id.length === 24) {
      return `ORD-${id.slice(-6).toUpperCase()}`;
    }
    return id || 'N/A';
  };

  // Helper function to get order status badge color
  const getOrderStatusColor = (status) => {
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

  // Helper function to get complaint status badge color
  const getComplaintStatusColor = (status) => {
    switch (status) {
      case 'OPEN':
        return 'bg-orange-500';
      case 'IN_PROGRESS':
        return 'bg-blue-500';
      case 'RESOLVED':
        return 'bg-green-500';
      case 'CLOSED':
        return 'bg-gray-500';
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
                  <Badge className={`${getOrderStatusColor(order.status)} text-white text-base py-1 px-4`}>
                    {formatStatus(order.status)}
                  </Badge>
                </div>
                <div className="flex space-x-4">
                  {order.paymentStatus === 'PAID' && (
                    <>
                      <Button 
                        variant="outline" 
                        onClick={handleViewInvoice}
                        disabled={invoiceLoading}
                        className="flex-1"
                      >
                        {invoiceLoading ? (
                          <>
                            <Circle className="w-4 h-4 mr-2 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4 mr-2" />
                            View Invoice
                          </>
                        )}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={handleDownloadInvoice}
                        disabled={invoiceLoading}
                        className="flex-1"
                      >
                        {invoiceLoading ? (
                          <>
                            <Circle className="w-4 h-4 mr-2 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4 mr-2" />
                            Download PDF
                          </>
                        )}
                      </Button>
                    </>
                  )}
                  {order.status !== 'APPROVED' && order.status !== 'SHIPPED' && order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                    <Button variant="outline" className="flex-1">
                      Cancel Order
                    </Button>
                  )}
                </div>
                
                {/* Invoice Number Display */}
                {order.paymentStatus === 'PAID' && order.invoiceNumber && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-green-600 mr-2" />
                      <div>
                        <p className="text-sm font-semibold text-green-800">Invoice Generated</p>
                        <p className="text-sm text-green-700">Invoice Number: {order.invoiceNumber}</p>
                        {order.invoiceGeneratedAt && (
                          <p className="text-xs text-green-600 mt-1">
                            Generated on: {new Date(order.invoiceGeneratedAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
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

            {/* Complaints Section */}
            {complaints.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4 flex items-center">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Your Complaints
                  </h2>
                  <div className="space-y-3">
                    {complaints.map((complaint) => (
                      <div key={complaint._id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <Badge className={`${getComplaintStatusColor(complaint.status)} text-white`}>
                            {complaint.status.replace('_', ' ')}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {new Date(complaint.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                        <p className="text-sm font-semibold mb-1">{complaint.category}</p>
                        <p className="text-sm text-gray-600 line-clamp-2">{complaint.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Need Help */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">Need Help?</h2>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setShowComplaintModal(true)}
                  >
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Raise Complaint
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

      {/* Invoice View Modal */}
      {invoiceData && (
        <InvoiceView
          invoiceData={invoiceData}
          isOpen={showInvoiceView}
          onClose={() => setShowInvoiceView(false)}
        />
      )}

      {/* Raise Complaint Modal */}
      <Dialog open={showComplaintModal} onOpenChange={setShowComplaintModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Raise a Complaint</DialogTitle>
            <DialogDescription>
              Please select a category and describe your issue. We'll get back to you soon.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={complaintCategory} onValueChange={setComplaintCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Laptop Issue">Laptop Issue</SelectItem>
                  <SelectItem value="Software Issue">Software Issue</SelectItem>
                  <SelectItem value="Delivery Issue">Delivery Issue</SelectItem>
                  <SelectItem value="Payment / Order Issue">Payment / Order Issue</SelectItem>
                  <SelectItem value="Return / Refund / Replacement">Return / Refund / Replacement</SelectItem>
                  <SelectItem value="Warranty / Service Issue">Warranty / Service Issue</SelectItem>
                  <SelectItem value="Other Issue">Other Issue</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Please describe your issue in detail..."
                value={complaintDescription}
                onChange={(e) => setComplaintDescription(e.target.value)}
                rows={5}
                maxLength={1000}
              />
              <p className="text-xs text-gray-500">
                {complaintDescription.length}/1000 characters
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowComplaintModal(false);
                setComplaintCategory('');
                setComplaintDescription('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRaiseComplaint}
              disabled={complaintLoading || !complaintCategory || !complaintDescription.trim()}
              className="bg-black hover:bg-gray-800 text-white"
            >
              {complaintLoading ? 'Submitting...' : 'Submit Complaint'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderDetail;
