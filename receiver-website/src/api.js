import axios from 'axios';

const API_BASE = '/api';

export const getTransaction = async (transactionId) => {
  const res = await axios.get(`${API_BASE}/transactions/${transactionId}`);
  return res.data;
};

export const getEvents = async (transactionId) => {
  const res = await axios.get(`${API_BASE}/transactions/${transactionId}/events`);
  return res.data;
};

export const getSettlement = async (transactionId) => {
  const res = await axios.get(`${API_BASE}/transactions/${transactionId}/settlement`);
  return res.data;
};

export const getRefund = async (transactionId) => {
  const res = await axios.get(`${API_BASE}/transactions/${transactionId}/refund`);
  return res.data;
};

export const getBankCase = async (transactionId) => {
  const res = await axios.get(`${API_BASE}/transactions/${transactionId}/bank-case`);
  return res.data;
};
