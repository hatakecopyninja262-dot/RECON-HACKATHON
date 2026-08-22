import React, { useState, useEffect } from 'react';
import { getProducts, createDemoProduct, createTransaction, simulatePayment } from './api';
import { QrCode, ShoppingBag, ShieldCheck, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';

const STATES = {
  PRODUCT: 'PRODUCT',
  CHECKOUT: 'CHECKOUT',
  PROCESSING: 'PROCESSING',
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR'
};

function App() {
  const [appState, setAppState] = useState(STATES.PRODUCT);
  const [product, setProduct] = useState(null);
  const [transaction, setTransaction] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    // Initialize product on load
    const initProduct = async () => {
      try {
        let products = await getProducts();
        let demoProduct = products.find(p => p.name === "Wireless Earbuds Pro");
        if (!demoProduct) {
          demoProduct = await createDemoProduct();
        }
        setProduct(demoProduct);
      } catch (err) {
        console.error("Failed to load products:", err);
      }
    };
    initProduct();
  }, []);

  const handleBuyNow = () => {
    setAppState(STATES.CHECKOUT);
  };

  const handlePaymentSubmit = async () => {
    setAppState(STATES.PROCESSING);
    try {
      // 1. Create Transaction
      const tx = await createTransaction(product.price);
      setTransaction(tx);
      
      // 2. Simulate Payment Flow
      await simulatePayment(tx.transaction_id);
      
      // 3. Show Success
      setAppState(STATES.SUCCESS);
    } catch (err) {
      console.error("Payment failed:", err);
      setErrorMessage(err.response?.data?.detail || "An unexpected error occurred connecting to the payment gateway.");
      setAppState(STATES.ERROR);
    }
  };

  const resetFlow = () => {
    setTransaction(null);
    setAppState(STATES.PRODUCT);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden animate-fade-in">
        
        {/* Header */}
        <div className="bg-gray-900 text-white p-4 text-center">
          <h1 className="text-xl font-bold tracking-wider flex items-center justify-center gap-2">
            <ShieldCheck size={20} />
            RECON PAY
          </h1>
        </div>

        <div className="p-6">
          {appState === STATES.PRODUCT && (
            <div className="animate-fade-in flex flex-col items-center">
              <div className="w-48 h-48 bg-gray-100 rounded-xl mb-6 flex items-center justify-center">
                <ShoppingBag size={64} className="text-gray-300" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                {product ? product.name : "Loading..."}
              </h2>
              <p className="text-gray-500 mb-6 text-center text-sm">
                {product ? product.description : "Please wait"}
              </p>
              <div className="text-3xl font-bold text-gray-900 mb-8">
                ₹{product ? product.price.toLocaleString() : "..."}
              </div>
              <button 
                onClick={handleBuyNow}
                disabled={!product}
                className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-300"
              >
                BUY NOW
              </button>
            </div>
          )}

          {appState === STATES.CHECKOUT && (
            <div className="animate-fade-in">
              <h2 className="text-xl font-semibold mb-4 border-b pb-2">Order Summary</h2>
              <div className="flex justify-between items-center mb-6">
                <span className="text-gray-600">{product.name}</span>
                <span className="font-semibold">₹{product.price.toLocaleString()}</span>
              </div>
              
              <div className="bg-gray-50 border rounded-xl p-6 flex flex-col items-center mb-6">
                <p className="text-sm text-gray-500 mb-4 uppercase tracking-wider font-semibold">Scan to Pay</p>
                <div className="bg-white p-4 rounded-lg shadow-sm mb-4 border border-gray-200">
                  <QrCode size={120} className="text-gray-800" />
                </div>
                <p className="text-xs text-gray-400 text-center">This is a simulated QR code for demo purposes.</p>
              </div>

              <button 
                onClick={handlePaymentSubmit}
                className="w-full bg-brand-600 text-white py-3 rounded-lg font-medium hover:bg-brand-700 transition-colors shadow-lg shadow-brand-500/30"
              >
                I've Paid ₹{product.price.toLocaleString()}
              </button>
              
              <button 
                onClick={() => setAppState(STATES.PRODUCT)}
                className="w-full text-gray-500 py-3 text-sm mt-2 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
          )}

          {appState === STATES.PROCESSING && (
            <div className="animate-fade-in flex flex-col items-center justify-center py-12">
              <Loader2 size={48} className="text-brand-600 animate-spin mb-6" />
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Processing payment...</h2>
              <p className="text-gray-500 text-sm text-center">Please do not close this window or press back.</p>
            </div>
          )}

          {appState === STATES.SUCCESS && (
            <div className="animate-fade-in flex flex-col items-center py-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 size={40} className="text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">PAYMENT SUCCESSFUL</h2>
              <div className="text-3xl font-bold text-green-600 mb-6">
                ₹{product.price.toLocaleString()}
              </div>
              
              <div className="w-full bg-gray-50 rounded-lg p-4 mb-8 text-sm border border-gray-100">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-500">Transaction ID</span>
                  <span className="font-mono font-medium text-gray-900">{transaction?.transaction_id}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-500">Status</span>
                  <span className="font-medium text-gray-900">Payment captured successfully</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Time</span>
                  <span className="font-medium text-gray-900">
                    {new Date().toLocaleTimeString()}
                  </span>
                </div>
              </div>

              <button 
                onClick={resetFlow}
                className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Return to Shop
              </button>
            </div>
          )}

          {appState === STATES.ERROR && (
            <div className="animate-fade-in flex flex-col items-center py-6">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <AlertCircle size={40} className="text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">PAYMENT COULD NOT BE COMPLETED</h2>
              <p className="text-gray-500 text-center text-sm mb-8">
                {errorMessage}
              </p>
              
              <button 
                onClick={resetFlow}
                className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                TRY AGAIN
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
