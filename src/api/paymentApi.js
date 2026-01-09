import axiosInstance from './axiosConfig';

export const createRazorpayOrder = async () => {
    const response = await axiosInstance.post('/laptops/payment/create-order');
    return response.data;
};

export const verifyPayment = async (paymentData) => {
    const response = await axiosInstance.post('/laptops/payment/verify-payment', paymentData);
    return response.data;
};
