// App.js
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import CreateInvoice from "./pages/CreateInvoice";
import ViewInvoice from "./pages/ViewInvoice";
import PayInvoice from "./pages/PayInvoice";
import VerifyProof from "./pages/verifyProof";
import PaymentConfirmation from "./pages/PaymentConfirmation";
import PayInvoiceQr from "./pages/PayInvoiceQr";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import toast, { Toaster } from "react-hot-toast";
import ProtectedRoute from './pages/ProtectedRoute';
function App() {
    const [walletAddress, setWalletAddress] = useState("");
    const [networkError, setNetworkError] = useState("");
    const [signer, setSigner] = useState(null);
    const [provider, setProvider] = useState(null);

    const NETWORK_ID = 421614; // Arbitrum Sepolia

    // Shorten wallet address for UI
    const shortenAddress = (address) =>
        `${address.slice(0, 5)}...${address.slice(-4)}`;

    // Connect Wallet Functionality
    const connectWallet = async () => {
        if (typeof window.ethereum === "undefined") {
            toast.error("MetaMask is not installed!");
            return;
        }

        try {
            const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });

            if (accounts.length === 0) {
                toast.error("No accounts found. Please connect to MetaMask.");
                return;
            }

            const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
            const web3Signer = web3Provider.getSigner();
            const address = await web3Signer.getAddress();

            // Check if the wallet is on the correct network
            const network = await web3Provider.getNetwork();
            if (network.chainId !== NETWORK_ID) {
                toast.error("Please switch to Arbitrum Sepolia.");
                setNetworkError("Please switch to Arbitrum Sepolia.");
                setWalletAddress(""); // Clear the wallet address if on the wrong network
                return;
            }

            // If on the correct network, set the wallet address and provider
            setWalletAddress(address);
            setProvider(web3Provider);
            setSigner(web3Signer);
            setNetworkError(""); // Clear any network errors
            toast.success("Wallet connected successfully!");
        } catch (error) {
            console.error("Failed to connect wallet:", error);
            toast.error("Failed to connect wallet. Check MetaMask.");
        }
    };

    // Switch the user to the correct network
    const switchNetwork = async () => {
        if (!window.ethereum) {
            toast.error("MetaMask is not installed!");
            return;
        }

        try {
            // Try switching to Arbitrum Sepolia
            await window.ethereum.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: "0x66EEE" }], // Use the correct chain ID
            });
            setNetworkError(""); // Clear the error once switched successfully
            toast.success("Switched to Arbitrum Sepolia!");
        } catch (switchError) {
            // If the network is not added, add it
            if (switchError.code === 4902) {
                await addNetwork();
                // Retry switching after adding the network
                try {
                    await window.ethereum.request({
                        method: "wallet_switchEthereumChain",
                        params: [{ chainId: "0x66EEE" }], // Use the correct chain ID
                    });
                    setNetworkError("");
                    toast.success("Switched to Arbitrum Sepolia!");
                } catch (retryError) {
                    console.error("Error switching network after adding:", retryError);
                    toast.error("Failed to switch network. Please connect to Arbitrum Sepolia.");
                }
            } else {
                console.error("Error switching network:", switchError);
                toast.error("Failed to switch network. Please connect to Arbitrum Sepolia.");
            }
        }
    };

    const addNetwork = async () => {
        if (!window.ethereum) {
            toast.error("MetaMask is not installed!");
            return;
        }

        try {
            await window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: [
                    {
                        chainId: "0x66EEE", // Use the correct chain ID
                        chainName: "Arbitrum Sepolia",
                        rpcUrls: ["https://sepolia-rollup.arbitrum.io/rpc"], // Correct RPC URL
                        nativeCurrency: {
                            name: "Ethereum",
                            symbol: "ETH", // Correct symbol (1-6 characters)
                            decimals: 18,
                        },
                        blockExplorerUrls: ["https://sepolia.arbiscan.io/"], // Correct block explorer
                    },
                ],
            });
            toast.success("Arbitrum Sepolia network added!");
        } catch (addError) {
            console.error("Error adding network:", addError);
            toast.error("Failed to add Arbitrum Sepolia network.");
        }
    };

    // Listen for account and network changes
    useEffect(() => {
        if (window.ethereum) {
            window.ethereum.on("accountsChanged", async (accounts) => {
                if (accounts.length === 0) {
                    setWalletAddress("");
                    toast.error("Wallet disconnected. Please reconnect.");
                } else {
                    const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
                    const network = await web3Provider.getNetwork();
                    if (network.chainId !== NETWORK_ID) {
                        setWalletAddress(""); // Clear the wallet address if on the wrong network
                        // toast.error("Please switch to Arbitrum Sepolia.");
                        return;
                    }
                    setWalletAddress(accounts[0]);
                    setProvider(web3Provider);
                    const web3Signer = web3Provider.getSigner();
                    setSigner(web3Signer);
                    toast.success("Wallet reconnected!");
                }
            });

            window.ethereum.on("chainChanged", async (chainId) => {
                const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
                const network = await web3Provider.getNetwork();
                if (network.chainId !== NETWORK_ID) {
                    setWalletAddress(""); // Clear the wallet address if on the wrong network
                    // toast.error("Please switch to Arbitrum Sepolia.");
                    return;
                }
                const web3Signer = web3Provider.getSigner();
                const address = await web3Signer.getAddress();
                setWalletAddress(address);
                setProvider(web3Provider);
                setSigner(web3Signer);
                // toast.success("Network switched to Arbitrum Sepolia!");
            });
        }
    }, []);

    return (
        <>
            {/* Wallet Connect Button */}
            <button
                onClick={connectWallet}
                className="wallet-btn bg-blue-600 top-0 absolute right-0 m-5 p-3 text-center rounded-md text-white"
            >
                {!walletAddress ? "Connect Wallet" : shortenAddress(walletAddress)}
            </button>

            {/* Network Error Display */}
            {networkError && (
                <div className="w-auto m-5 p-5 absolute bg-red-500 text-white rounded-md">
                    {networkError}
                    <button
                        onClick={switchNetwork}
                        className="ml-4 p-2 outline-none rounded-md bg-blue-500"
                    >
                        Switch Network
                    </button>
                </div>
            )}

            {/* Router Setup */}
            <Router>
                <Routes>
                    <Route path="/" element={<Home address={walletAddress} />} />
                    <Route
                        path="/createInvoice"
                        element={
                            <ProtectedRoute walletAddress={walletAddress}>
                                <CreateInvoice address={walletAddress} />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/verify"
                        element={
                            <ProtectedRoute walletAddress={walletAddress}>
                                <VerifyProof address={walletAddress} />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/viewInvoice"
                        element={
                            <ProtectedRoute walletAddress={walletAddress}>
                                <ViewInvoice address={walletAddress} />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/payInvoice"
                        element={
                            <ProtectedRoute walletAddress={walletAddress}>
                                <PayInvoice address={walletAddress} />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/payInvoiceQR/:invoiceId"
                        element={
                            <ProtectedRoute walletAddress={walletAddress}>
                                <PayInvoiceQr address={walletAddress} />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/paymentConfirmation/:transactionHash"
                        element={
                            <ProtectedRoute walletAddress={walletAddress}>
                                <PaymentConfirmation address={walletAddress} />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </Router>

            {/* Toaster for displaying toast messages */}
            <Toaster />
        </>
    );
}

export default App;