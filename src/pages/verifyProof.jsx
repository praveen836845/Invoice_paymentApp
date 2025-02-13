
import React, { useState } from "react";
import axios from "axios";

const VerifyProof = () => {
  const [invoiceID, setInvoiceID] = useState("");
  const [verificationStatus, setVerificationStatus] = useState("");

  const handleVerify = async () => {
    try {
      const response = await axios.post("https://payment-invoice.onrender.com/verify", {
        invoiceID // Send invoiceID in the request body
      });
      setVerificationStatus(response.data); // Display the response (e.g., "Verified")
    } catch (error) {
      setVerificationStatus("Verification failed.");
      console.error(error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-semibold text-center mb-6">Verify Invoice</h2>
        <input
          type="text"
          placeholder="Enter Invoice ID"
          value={invoiceID}
          onChange={(e) => setInvoiceID(e.target.value)}
          className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleVerify}
          disabled={!invoiceID}
          className="w-full py-3 bg-blue-500 text-white font-semibold rounded-md disabled:bg-gray-400 hover:bg-blue-600 transition duration-300"
        >
          Verify
        </button>

        {verificationStatus && (
          <div className="mt-4 text-center">
            <h3 className="text-lg font-medium text-gray-700">{verificationStatus}</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyProof;
