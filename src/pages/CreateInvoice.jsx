import { useState, useEffect } from "react";
import axios from "axios";
import { ethers } from "ethers";
import Ethers from "../utils/Ethers";
import { Link } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

const CreateInvoice = ({ address }) => {
  const [payer, setPayer] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [invoiceId, setInvoiceId] = useState("");
  const [paymentUrl, setPaymentUrl] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [invoicePdfUrl, setInvoicePdfUrl] = useState("");
  const [items, setItems] = useState([{ itemName: "", itemPrice: "" }]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [walletAddress, setWalletAddress] = useState("");

  useEffect(() => {
    if (address) {
      setWalletAddress(address);
    }
  }, [address]);

  console.log("Connected address:", address);

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] = value;
    setItems(updatedItems);
    const newTotal = updatedItems.reduce(
      (acc, item) => acc + parseFloat(item.itemPrice || 0),
      0
    );
    setTotalAmount(newTotal);
  };

  const handleAddItem = () => {
    if (items.length < 5) {
      setItems([...items, { itemName: "", itemPrice: "" }]);
    }
  };

  const handleRemoveItem = (index) => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
    const newTotal = updatedItems.reduce(
      (acc, item) => acc + parseFloat(item.itemPrice || 0),
      0
    );
    setTotalAmount(newTotal);
  };

  const handleCopyInvoiceId = () => {
    navigator.clipboard.writeText(invoiceId);
    toast.success("Invoice ID copied to clipboard!");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted!");

    const loadingToast = toast.loading("Processing transaction...");

    const Etherinst = Ethers();
    try {
      const amountInWei = ethers.utils
        .parseUnits(totalAmount.toString(), "ether")
        .toString();
      const dueDateTimestamp = new Date(dueDate).getTime();

      console.log("Issuer Address (connected wallet):", walletAddress);

      const { provider, signer, contract } = Etherinst;
      console.log("Smart Contract Instance:", contract);

      // Step 1: Execute the transaction
      const tx = await contract.createInvoice(
        payer,
        amountInWei,
        description,
        dueDateTimestamp
      );

      // Step 2: Wait for the transaction to be mined
      const receipt = await tx.wait(); // Wait for the transaction to be confirmed

      // Step 3: Extract the invoice ID from the transaction receipt
      const invoiceId = receipt.events[0].args.invoiceId.toString();
      console.log("Payer Address:", payer);

      // Step 4: Send the invoice data to the backend
      const response = await axios.post(
        "https://payment-invoice.onrender.com/createInvoice",
        {
          payer,
          description,
          dueDate: dueDateTimestamp,
          items,
          amount: amountInWei,
          invoiceId,
          issuerAddress: walletAddress,
        }
      );

      console.log("Response:", response);

      // Step 5: Update state and show success toast
      if (response.status === 201) {
        setInvoiceId(response.data.invoiceId);
        setPaymentUrl(response.data.paymentUrl);
        setQrCode(response.data.qrCode);
        setInvoicePdfUrl(response.data.issuerPdfUrl);

        toast.dismiss(loadingToast);
        toast.success("Invoice created successfully! 🎉");
      } else {
        console.log("Server Response:", response.data);
        toast.dismiss(loadingToast);
        toast.error("Failed to create invoice. Please try again.");
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error.message);
      toast.dismiss(loadingToast);
      toast.error(`Error: ${error.message}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <Toaster />
      <Link
        to="/"
        className="absolute left-0 top-0 bg-green-500 text-white rounded-md px-3 py-3 m-5"
      >
        Return Home
      </Link>
      <h2 className="text-2xl font-semibold mb-6">Create an Invoice</h2>
      {walletAddress ? (
        <div>
          <p>Connected Wallet (Issuer): {walletAddress}</p>
        </div>
      ) : (
        <p>No wallet connected</p>
      )}

      <form className="w-full max-w-md space-y-4" onSubmit={handleSubmit}>
        <input
          type="text"
          className="w-full p-3 rounded-md border border-gray-300"
          placeholder="Payer Address (manually enter)"
          value={payer}
          onChange={(e) => setPayer(e.target.value)}
        />
        <textarea
          className="w-full p-3 rounded-md border border-gray-300"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          type="date"
          className="w-full p-3 rounded-md border border-gray-300"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />

        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={index} className="flex items-center space-x-4">
              <input
                type="text"
                className="w-full p-3 rounded-md border border-gray-300"
                placeholder={`Item ${index + 1}`}
                value={item.itemName}
                onChange={(e) =>
                  handleItemChange(index, "itemName", e.target.value)
                }
              />
              <input
                type="number"
                className="w-full p-3 rounded-md border border-gray-300"
                placeholder="Price"
                value={item.itemPrice}
                onChange={(e) =>
                  handleItemChange(index, "itemPrice", e.target.value)
                }
              />
              {items.length > 1 && (
                <button
                  type="button"
                  className="text-red-500"
                  onClick={() => handleRemoveItem(index)}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          className="w-full bg-gray-300 text-gray-800 py-2 rounded-md mt-4"
          onClick={handleAddItem}
        >
          Add Item
        </button>

        <div className="mt-4 text-lg font-semibold">
          <p>Total Amount: ${totalAmount.toFixed(2)}</p>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-3 rounded-md mt-6"
        >
          Create Invoice
        </button>
      </form>

      {invoiceId && (
        <div className="mt-6 text-center">
          <p className="text-lg font-semibold">Invoice Created! �</p>
          <div className="flex items-center justify-center space-x-4 mt-2">
            <span className="text-blue-600 font-medium">Invoice ID:</span>
            <span className="bg-gray-200 px-3 py-1 rounded-md">
              {invoiceId}
            </span>
            <button
              className="bg-gray-300 px-3 py-1 rounded-md"
              onClick={handleCopyInvoiceId}
            >
              Copy
            </button>
          </div>

          {invoicePdfUrl && (
            <div className="mt-4">
              <a href={invoicePdfUrl} download>
                <button className="bg-green-500 text-white py-2 px-4 rounded-md">
                  Download Invoice
                </button>
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CreateInvoice;