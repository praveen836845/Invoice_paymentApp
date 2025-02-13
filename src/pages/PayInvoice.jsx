import React, { useState, useEffect } from "react";
import axios from "axios";
import Ethers from "../utils/Ethers";
import { ethers } from "ethers";
import { Link } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast"; // Import toast and Toaster

const PayInvoice = ({ address }) => {
    const [invoiceId, setInvoiceId] = useState("");
    const [invoiceDetails, setInvoiceDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState("");
    const [walletAddress, setWalletAddress] = useState("");
    const [receiptUrl, setReceiptUrl] = useState("");

    useEffect(() => {
        if (address) {
            setWalletAddress(address);
        }
    }, [address]);

    const handleFetchInvoice = async () => {
        // Show loading toast
        const toastId = toast.loading("Fetching invoice details...");

        try {
            const response = await axios.get(`https://payment-invoice.onrender.com/getInvoice/${invoiceId}`);
            const bigno = ethers.BigNumber.from(response.data.invoice.amount.toString());
            const amount = ethers.utils.formatEther(bigno);

            response.data.invoice.amount = amount;
            setInvoiceDetails(response.data.invoice);

            // Dismiss loading toast and show success toast
            toast.success("Invoice fetched successfully!", { id: toastId });
        } catch (error) {
            console.error("Error fetching invoice:", error);
            setPaymentStatus("Failed to fetch invoice. Please try again.");

            // Dismiss loading toast and show error toast
            toast.error("Failed to fetch invoice. Please try again.", { id: toastId });
        }
    };

    const handlePayment = async () => {
        if (!invoiceDetails) {
            console.log("Invoice details are not available");
            return;
        }

        if (!walletAddress) {
            console.log("Wallet address is not connected.");
            setPaymentStatus("Please connect your wallet.");
            return;
        }

        setLoading(true);
        setPaymentStatus("Processing payment...");
        console.log("Payment processing started...");

        // Show loading toast for payment
        const paymentToastId = toast.loading("Processing payment...");

        try {
            const { provider, signer, contract } = Ethers();

            if (!contract) {
                console.log("Ethereum contract not found.");
                setPaymentStatus("Ethereum environment not found. Install MetaMask and try again.");
                toast.error("Ethereum environment not found. Install MetaMask and try again.", { id: paymentToastId });
                return;
            }

            const paymentAmountInWei = ethers.utils.parseUnits(invoiceDetails.amount.toString(), "ether");
            console.log("Payment amount (in Wei):", paymentAmountInWei);

            const tx = await contract.payInvoice(invoiceId, {
                value: paymentAmountInWei,
            });

            const receipt = await tx.wait();
            setPaymentStatus("Payment successful! Transaction Hash: " + receipt.transactionHash);

            // Update invoice status on the backend
            try {
                const response = await axios.post("https://payment-invoice.onrender.com/updateInvoiceStatus", {
                    invoiceId,
                    transactionHash: receipt.transactionHash,
                });
                setReceiptUrl(response.data.receiptPdfUrl);
                toast.success("Payment successful!", { id: paymentToastId });
            } catch (error) {
                console.error("Error updating invoice status:", error);
                setPaymentStatus("Failed to update invoice status.");
                toast.error("Failed to update invoice status.", { id: paymentToastId });
            }
        } catch (error) {
            console.error("Error during payment:", error);
            setPaymentStatus("Payment failed. Please try again.");
            toast.error("Payment failed. Please try again.", { id: paymentToastId });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Add Toaster component to display toasts */}

            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
                <Link to="/" className="absolute left-0 top-0 bg-green-500 text-white rounded-md px-3 py-3 m-5">Return Home</Link>
                <h2 className="text-2xl font-semibold mb-6">Pay Invoice</h2>

                {walletAddress && (
                    <p className="text-lg mb-4">
                        <strong>Connected Wallet Address: </strong>{walletAddress}
                    </p>
                )}

                <input
                    type="text"
                    className="w-full max-w-md p-3 rounded-md border border-gray-300"
                    placeholder="Enter Invoice ID"
                    value={invoiceId}
                    onChange={(e) => setInvoiceId(e.target.value)}
                />
                <button
                    className="mt-4 bg-blue-500 text-white py-3 px-6 rounded-md"
                    onClick={handleFetchInvoice}
                >
                    Fetch Invoice
                </button>

                {invoiceDetails && (
                    <div className="mt-6 space-y-4">
                        <p><strong>Amount:</strong> {invoiceDetails.amount} ETH </p>
                        <p><strong>Recipient:</strong> {invoiceDetails.issuer}</p>
                        <p><strong>Due Date:</strong> {new Date(invoiceDetails.dueDate).toLocaleString()}</p>
                        <button
                            className="mt-4 bg-green-500 text-white py-3 px-6 rounded-md"
                            onClick={handlePayment}
                            disabled={loading}
                        >
                            {loading ? "Processing..." : "Pay Now"}
                        </button>
                    </div>
                )}

                {paymentStatus && (
                    <div className="mt-6 text-center text-lg">
                        <p>{paymentStatus}</p>
                        {receiptUrl && (
                            <div className="mt-4">
                                <a href={receiptUrl} download>
                                    <button className="bg-green-500 text-white py-2 px-4 rounded-md">
                                        View Receipt
                                    </button>
                                </a>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
};

export default PayInvoice;