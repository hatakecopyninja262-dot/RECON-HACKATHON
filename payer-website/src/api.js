import axios from 'axios';

const API_BASE = 'https://recon-hackathon-1.onrender.com/api';

export const getProducts = async () => {
  const res = await axios.get(`${API_BASE}/products`);
  return res.data;
};

export const createDemoProduct = async () => {
  const res = await axios.post(`${API_BASE}/products`, {
    name: "Wireless Earbuds Pro",
    description: "RECON hackathon demo product",
    price: 1499,
    currency: "INR"
  });
  return res.data;
};

export const createTransaction = async (amount) => {
  const res = await axios.post(`${API_BASE}/transactions`, {
    amount: amount,
    currency: "INR",
    payer: "ACC_USER_001",
    expected_receiver: "ACC_MERCHANT_001"
  });
  return res.data;
};

export const simulatePayment = async (transactionId) => {
  const res = await axios.post(
    `${API_BASE}/transactions/${transactionId}/simulate-payment`
  );
  return res.data;
};