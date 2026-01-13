import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Download, Package, MapPin, Phone, CheckCircle, Circle, Truck, FileText, Eye, AlertCircle, MessageSquare, Wrench, Upload, X, Mic, Square, Play } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { getOrderById, getInvoice } from '../api/orderApi';
import { createComplaint, getComplaints } from '../api/complaintApi';
import { createRefurbishmentRequest, getRefurbishmentRequests } from '../api/refurbishmentApi';
import { uploadVoiceMessage } from '../api/uploadApi';
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
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showRefurbishmentModal, setShowRefurbishmentModal] = useState(false);
  const [refurbishmentImages, setRefurbishmentImages] = useState([]);
  const [refurbishmentImageFiles, setRefurbishmentImageFiles] = useState([]);
  const [refurbishmentIssueText, setRefurbishmentIssueText] = useState('');
  const [refurbishmentAccessories, setRefurbishmentAccessories] = useState('');
  const [refurbishmentLoading, setRefurbishmentLoading] = useState(false);
  const [refurbishmentRequests, setRefurbishmentRequests] = useState([]);

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

  // Fetch refurbishment requests for this order
  const fetchRefurbishmentRequests = async () => {
    try {
      const response = await getRefurbishmentRequests({ orderId });
      if (response.success && response.data?.requests) {
        setRefurbishmentRequests(response.data.requests);
      }
    } catch (err) {
      console.error('Error fetching refurbishment requests:', err);
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
          // Fetch refurbishment requests for this order
          fetchRefurbishmentRequests();
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

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Create preview URLs immediately
    const previewUrls = files.map(file => URL.createObjectURL(file));
    setRefurbishmentImages([...refurbishmentImages, ...previewUrls]);
    setRefurbishmentImageFiles([...refurbishmentImageFiles, ...files]);

    try {
      // Upload images to server one by one
      const uploadedUrls = [];
      for (const file of files) {
        const { uploadRefurbishmentImage } = await import('../api/uploadApi');
        const result = await uploadRefurbishmentImage(file);

        if (!result.success) {
          throw new Error(result.error || 'Failed to upload image');
        }

        // Backend returns: { success: true, data: { image: { secure_url, url, ... } } }
        const imageUrl = result.data?.data?.image?.secure_url || 
                        result.data?.data?.image?.url || 
                        result.data?.image?.secure_url ||
                        result.data?.image?.url;
        
        if (imageUrl) {
          uploadedUrls.push(imageUrl);
        } else {
          console.error('Unexpected response format:', result.data);
        }
      }

      // Replace preview URLs with actual uploaded URLs
      if (uploadedUrls.length > 0) {
        setRefurbishmentImages(prevImages => {
          const newImages = [...prevImages];
          const startIndex = newImages.length - previewUrls.length;
          uploadedUrls.forEach((url, index) => {
            newImages[startIndex + index] = url;
          });
          return newImages;
        });
        
        toast({
          title: "Images Uploaded",
          description: `${uploadedUrls.length} image(s) uploaded successfully`,
        });
      }
    } catch (err) {
      console.error('Error uploading images:', err);
      // Remove failed uploads from state
      setRefurbishmentImages(prevImages => prevImages.slice(0, -previewUrls.length));
      setRefurbishmentImageFiles(prevFiles => prevFiles.slice(0, -files.length));
      toast({
        title: "Upload Error",
        description: err.message || "Failed to upload images. Please try again.",
        variant: "destructive",
      });
    }
  };

  const removeImage = (index) => {
    // Revoke object URL if it's a blob URL
    if (refurbishmentImages[index]?.startsWith('blob:')) {
      URL.revokeObjectURL(refurbishmentImages[index]);
    }
    setRefurbishmentImages(refurbishmentImages.filter((_, i) => i !== index));
    setRefurbishmentImageFiles(refurbishmentImageFiles.filter((_, i) => i !== index));
  };

  const handleRequestRefurbishment = async () => {
    // Check for uploaded images (non-blob URLs)
    const uploadedImageUrls = refurbishmentImages.filter(url => !url.startsWith('blob:'));
    
    if (!refurbishmentIssueText.trim() || uploadedImageUrls.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please provide issue description and at least one uploaded image",
        variant: "destructive",
      });
      return;
    }

    try {
      setRefurbishmentLoading(true);
      
      // Get the first product from the order
      const firstProduct = order.products?.[0]?.productId;
      const productId = firstProduct?._id || firstProduct?.id;

      // Filter out blob URLs (preview URLs) - only use uploaded URLs
      const uploadedImageUrls = refurbishmentImages.filter(url => !url.startsWith('blob:'));

      if (uploadedImageUrls.length === 0) {
        toast({
          title: "Upload Error",
          description: "Please wait for images to finish uploading before submitting",
          variant: "destructive",
        });
        return;
      }

      const requestData = {
        orderId: order._id || order.id,
        productId: productId || null,
        images: uploadedImageUrls,
        issueText: refurbishmentIssueText.trim(),
        accessories: refurbishmentAccessories.split(',').map(a => a.trim()).filter(a => a),
      };

      const response = await createRefurbishmentRequest(requestData);
      
      if (response.success) {
        toast({
          title: "Request Submitted",
          description: "Your refurbishment request has been submitted successfully. We'll review it soon.",
        });
        setShowRefurbishmentModal(false);
        setRefurbishmentImages([]);
        setRefurbishmentIssueText('');
        setRefurbishmentAccessories('');
        // Refresh requests list
        fetchRefurbishmentRequests();
      }
    } catch (err) {
      console.error('Error submitting refurbishment request:', err);
      toast({
        title: "Error",
        description: err.response?.data?.error || "Failed to submit refurbishment request",
        variant: "destructive",
      });
    } finally {
      setRefurbishmentLoading(false);
    }
  };

  // Voice recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];
      let interval = null;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        if (interval) {
          clearInterval(interval);
        }
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingTime(0);

      // Update recording time every second
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Error starting recording:', err);
      toast({
        title: "Recording Error",
        description: "Failed to access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
    }
  };

  const clearRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
  };

  const handleRaiseComplaint = async () => {
    // Either description or voice message must be provided
    if (!complaintCategory) {
      toast({
        title: "Validation Error",
        description: "Please select a category",
        variant: "destructive",
      });
      return;
    }

    if (!complaintDescription.trim() && !audioBlob) {
      toast({
        title: "Validation Error",
        description: "Please provide either a description or record a voice message",
        variant: "destructive",
      });
      return;
    }

    try {
      setComplaintLoading(true);
      
      // Get the first product from the order
      const firstProduct = order.products?.[0]?.productId;
      const productId = firstProduct?._id || firstProduct?.id;

      let voiceMessageUrl = null;
      
      // Upload voice message if available
      if (audioBlob) {
        const uploadResult = await uploadVoiceMessage(audioBlob);
        if (uploadResult.success) {
          voiceMessageUrl = uploadResult.data?.data?.audio?.secure_url || 
                           uploadResult.data?.data?.audio?.url;
        } else {
          toast({
            title: "Upload Error",
            description: uploadResult.error || "Failed to upload voice message",
            variant: "destructive",
          });
          setComplaintLoading(false);
          return;
        }
      }

      const complaintData = {
        orderId: order._id || order.id,
        productId: productId || null,
        category: complaintCategory,
        description: complaintDescription.trim() || '',
        voiceMessage: voiceMessageUrl,
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
        clearRecording();
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

            {/* Refurbishment Requests Section */}
            {refurbishmentRequests.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4 flex items-center">
                    <Wrench className="w-5 h-5 mr-2" />
                    Refurbishment Requests
                  </h2>
                  <div className="space-y-3">
                    {refurbishmentRequests.map((request) => (
                      <div key={request._id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <Badge className={`${getComplaintStatusColor(request.status)} text-white`}>
                            {request.status.replace(/_/g, ' ')}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {new Date(request.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">{request.issueText}</p>
                        {request.warehouseShipment?.trackingNumber && (
                          <p className="text-xs text-gray-500">Tracking: {request.warehouseShipment.trackingNumber}</p>
                        )}
                        {request.returnShipment?.trackingNumber && (
                          <p className="text-xs text-gray-500">Return Tracking: {request.returnShipment.trackingNumber}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

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
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setShowRefurbishmentModal(true)}
                  >
                    <Wrench className="w-4 h-4 mr-2" />
                    Request Refurbishment
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
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Please describe your issue in detail (optional if recording voice message)..."
                value={complaintDescription}
                onChange={(e) => setComplaintDescription(e.target.value)}
                rows={5}
                maxLength={1000}
              />
              <p className="text-xs text-gray-500">
                {complaintDescription.length}/1000 characters
              </p>
            </div>
            <div className="space-y-2">
              <Label>Voice Message (Optional)</Label>
              <div className="border rounded-lg p-4 space-y-3">
                {!audioUrl ? (
                  <div className="flex items-center gap-3">
                    {!isRecording ? (
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={startRecording}
                          className="flex items-center gap-2"
                        >
                          <Mic className="w-4 h-4" />
                          Start Recording
                        </Button>
                        <p className="text-sm text-gray-500">Or type your description above</p>
                      </>
                    ) : (
                      <>
                        <Button
                          type="button"
                          variant="destructive"
                          onClick={stopRecording}
                          className="flex items-center gap-2"
                        >
                          <Square className="w-4 h-4" />
                          Stop Recording
                        </Button>
                        <p className="text-sm text-gray-600">
                          Recording... {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                        </p>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <audio src={audioUrl} controls className="flex-1" />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={clearRecording}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={startRecording}
                      className="flex items-center gap-2"
                    >
                      <Mic className="w-4 h-4" />
                      Record Again
                    </Button>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500">
                Record a voice message or provide a text description (at least one is required)
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
                clearRecording();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRaiseComplaint}
              disabled={complaintLoading || !complaintCategory || (!complaintDescription.trim() && !audioBlob)}
              className="bg-black hover:bg-gray-800 text-white"
            >
              {complaintLoading ? 'Submitting...' : 'Submit Complaint'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Refurbishment Modal */}
      <Dialog open={showRefurbishmentModal} onOpenChange={setShowRefurbishmentModal}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Request Refurbishment</DialogTitle>
            <DialogDescription>
              Please provide images of the issue and describe the problem. Include any accessories you're sending (e.g., charger).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="images">Issue Images *</Label>
              <div className="grid grid-cols-3 gap-2 mb-2">
                {refurbishmentImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Issue ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <Input
                id="images"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="cursor-pointer"
              />
              <p className="text-xs text-gray-500">Upload images showing the issue (at least 1 required)</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="issueText">Issue Description *</Label>
              <Textarea
                id="issueText"
                placeholder="Describe the issue in detail..."
                value={refurbishmentIssueText}
                onChange={(e) => setRefurbishmentIssueText(e.target.value)}
                rows={5}
                maxLength={1000}
                required
              />
              <p className="text-xs text-gray-500">
                {refurbishmentIssueText.length}/1000 characters
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="accessories">Accessories (Optional)</Label>
              <Input
                id="accessories"
                placeholder="e.g., Charger, Mouse, Bag (comma-separated)"
                value={refurbishmentAccessories}
                onChange={(e) => setRefurbishmentAccessories(e.target.value)}
              />
              <p className="text-xs text-gray-500">List any accessories you're including with the product</p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                // Clean up blob URLs
                refurbishmentImages.forEach(url => {
                  if (url?.startsWith('blob:')) {
                    URL.revokeObjectURL(url);
                  }
                });
                setShowRefurbishmentModal(false);
                setRefurbishmentImages([]);
                setRefurbishmentImageFiles([]);
                setRefurbishmentIssueText('');
                setRefurbishmentAccessories('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRequestRefurbishment}
              disabled={
                refurbishmentLoading || 
                !refurbishmentIssueText.trim() || 
                refurbishmentImages.filter(url => !url.startsWith('blob:')).length === 0
              }
              className="bg-black hover:bg-gray-800 text-white"
            >
              {refurbishmentLoading ? 'Submitting...' : 'Submit Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderDetail;
