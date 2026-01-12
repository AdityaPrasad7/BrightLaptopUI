import React from 'react';
import { X, Download, FileText } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { generateInvoicePDF } from '../utils/invoicePDF';
import { toast } from '../hooks/use-toast';

const InvoiceView = ({ invoiceData, isOpen, onClose }) => {
  if (!invoiceData || !invoiceData.invoice) {
    return null;
  }

  const { invoice, order } = invoiceData;

  const handleDownload = () => {
    generateInvoicePDF(invoiceData);
    toast({
      title: "Invoice Downloaded",
      description: "Your invoice has been downloaded successfully.",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              <span>Invoice {invoice.invoiceNumber}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Invoice Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-blue-600 mb-1">Bright Laptop</h2>
                  <p className="text-sm text-gray-600">Your Trusted Laptop Partner</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">123, Tech Street,</p>
                  <p className="text-sm text-gray-600">Bangalore - 560001</p>
                  <p className="text-sm text-gray-600">Karnataka, India</p>
                  <p className="text-sm text-gray-600 mt-2">Phone: +91 80 1234 5678</p>
                  <p className="text-sm text-gray-600">Email: support@brightlaptop.com</p>
                </div>
              </div>

              <div className="flex justify-between items-start mt-6">
                <div>
                  <h3 className="text-xl font-bold mb-4">TAX INVOICE</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-semibold">Invoice Number:</span> {invoice.invoiceNumber}</p>
                    <p><span className="font-semibold">Invoice Date:</span> {invoice.invoiceDate}</p>
                    <p><span className="font-semibold">Order Number:</span> {invoice.orderNumber}</p>
                    <p><span className="font-semibold">Order Date:</span> {invoice.orderDate}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Bill To:</h4>
                  <div className="text-sm text-gray-700">
                    <p className="font-medium">{invoice.customer.name}</p>
                    {invoice.customer.email && <p>{invoice.customer.email}</p>}
                    {invoice.customer.phone && <p>{invoice.customer.phone}</p>}
                    {invoice.customer.address && (
                      <div className="mt-2">
                        <p>{invoice.customer.address.addressLine1}</p>
                        {invoice.customer.address.addressLine2 && <p>{invoice.customer.address.addressLine2}</p>}
                        <p>
                          {invoice.customer.address.city}, {invoice.customer.address.state} {invoice.customer.address.postalCode}
                        </p>
                        {invoice.customer.address.country && <p>{invoice.customer.address.country}</p>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Items Table */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-blue-600 text-white">
                      <th className="border p-2 text-left">Sr No</th>
                      <th className="border p-2 text-left">Description</th>
                      <th className="border p-2 text-center">Warranty</th>
                      <th className="border p-2 text-center">Qty</th>
                      <th className="border p-2 text-right">Unit Price</th>
                      <th className="border p-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items.map((item, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="border p-2">{item.srNo}</td>
                        <td className="border p-2">{item.description}</td>
                        <td className="border p-2 text-center">{item.warranty || 'Default'}</td>
                        <td className="border p-2 text-center">{item.quantity}</td>
                        <td className="border p-2 text-right">₹{item.unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        <td className="border p-2 text-right font-semibold">₹{item.lineTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Pricing Summary */}
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-end">
                <div className="w-80 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-semibold">₹{invoice.pricing.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">GST ({invoice.pricing.gstPercentage}%):</span>
                    <span className="font-semibold">₹{invoice.pricing.gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping:</span>
                    <span className="font-semibold text-green-600">FREE</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Amount:</span>
                    <span>₹{invoice.pricing.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p><span className="font-semibold">Payment Method:</span> {invoice.paymentMethod}</p>
                  <p className="mt-2"><span className="font-semibold">Payment Status:</span> 
                    <Badge className={`ml-2 ${invoice.paymentStatus === 'PAID' ? 'bg-green-500' : 'bg-orange-500'}`}>
                      {invoice.paymentStatus}
                    </Badge>
                  </p>
                </div>
                <div>
                  <p><span className="font-semibold">Order Type:</span> 
                    <Badge className={`ml-2 ${invoice.orderType === 'B2B' ? 'bg-orange-500' : 'bg-blue-500'}`}>
                      {invoice.orderType}
                    </Badge>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Terms and Conditions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Terms & Conditions</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-xs space-y-1 text-gray-600">
                <li>1. Goods once sold will not be taken back or exchanged.</li>
                <li>2. Subject to Bangalore jurisdiction only.</li>
                <li>3. Warranty terms and conditions apply as per manufacturer guidelines.</li>
                <li>4. Invoice generated is computer-generated and does not require signature.</li>
              </ul>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceView;
