import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { ethers } from "ethers";

const ViewInvoice = () => {
    const [invoiceId, setInvoiceId] = useState("");
    const [invoiceDetails, setInvoiceDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleFetchInvoice = async () => {
        if (!invoiceId) {
            toast.error("Please enter an Invoice ID");
            return;
        }

        setIsLoading(true);
        toast.loading("Fetching invoice details...");

        try {
            const response = await axios.get(`https://payment-invoice.onrender.com/getInvoice/${invoiceId}`);
            if (response.status !== 200) {
                throw new Error("Failed to fetch invoice details");
            }
            setInvoiceDetails(response.data.invoice);
            toast.dismiss();
            toast.success("Invoice details fetched successfully!");
        } catch (error) {
            console.error(error);
            toast.dismiss();
            toast.error("Failed to fetch invoice details. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <Toaster />
            <Link to="/" className="absolute left-0 top-0 bg-green-500 text-white rounded-md px-3 py-3 m-5">Return Home</Link>
            <h2 className="text-2xl font-semibold mb-6">View Invoice</h2>
            <input
                type="text"
                className="w-full max-w-md p-3 rounded-md border border-gray-300"
                placeholder="Enter Invoice ID"
                value={invoiceId}
                onChange={(e) => setInvoiceId(e.target.value)}
            />
            <button
                className="mt-4 bg-green-500 text-white py-3 px-6 rounded-md disabled:bg-gray-400"
                onClick={handleFetchInvoice}
                disabled={isLoading}
            >
                {isLoading ? "Fetching..." : "Fetch Invoice"}
            </button>

            {invoiceDetails && (
                <div className="mt-6 space-y-4">
                    <p><strong>Amount:</strong> {ethers.utils.formatUnits(ethers.BigNumber.from(String(invoiceDetails.amount)), "ether")} ETH</p>
                    <p><strong>Description:</strong> {invoiceDetails.description}</p>
                    <p><strong>Due Date:</strong> {invoiceDetails.dueDate}</p>
                    <p><strong>Status:</strong> {invoiceDetails.status}</p>
                </div>
            )}
        </div>
    );
};

export default ViewInvoice;