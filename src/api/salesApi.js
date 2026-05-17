import axios from 'axios';

const API_BASE_URL = 'https://localhost:7294/api';

export const createSalesInvoice = async (invoiceData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/Sales/invoice`, invoiceData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to create sales invoice';
  }
};

export const getRecentInvoices = async (limit = 10) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/Sales/invoice?limit=${limit}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch invoices';
  }
};

export const getOverdueInvoices = async (months = 1) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/Sales/invoice/overdue?months=${months}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch overdue invoices';
  }
};

export const sendBulkReminders = async (months = 1) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/Sales/invoice/remind-overdue?months=${months}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to send bulk reminders';
  }
};

export const sendSingleReminder = async (invoiceId) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/Sales/invoice/${invoiceId}/remind`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to send reminder';
  }
};

export const markInvoiceAsPaid = async (invoiceId) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/Sales/invoice/${invoiceId}/mark-paid`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to mark invoice as paid';
  }
};

export const sendInvoiceEmail = async (invoiceId) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/Sales/invoice/${invoiceId}/email`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to send email';
  }
};
