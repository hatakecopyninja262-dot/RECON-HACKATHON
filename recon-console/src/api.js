import axios from 'axios';

const API_BASE = '/api';

export const getReconAnalysis = async (transactionId) => {
  const res = await axios.get(`${API_BASE}/transactions/${transactionId}/recon`);
  return res.data;
};

export const getTransactionDetails = async (transactionId) => {
  const res = await axios.get(`${API_BASE}/transactions/${transactionId}`);
  return res.data;
};
