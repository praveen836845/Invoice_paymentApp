import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import CreateInvoice from "./pages/CreateInvoice";
import ViewInvoice from "./pages/ViewInvoice";
import PayInvoice from "./pages/PayInvoice";
import VerifyProof from "./pages/verifyProof";
import PaymentConfirmation from "./pages/PaymentConfirmation";
import { ToastContainer } from 'react-toastify';
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { toast } from "react-toastify";
import PayInvoiceQr from "./pages/PayInvoiceQr";

function App() {
    const [walletAddress, setWalletAddress] = useState("");
    const [networkError, setNetworkError] = useState("");
    const [signer, setSigner] = useState(null);
    const [provider, setProvider] = useState(null);
    
    const NETWORK_ID = 421614; // 0x66EED in decimal (Arbitrum Sepolia)

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

            setWalletAddress(address);
            setProvider(web3Provider);
            setSigner(web3Signer);
            checkNetwork(web3Provider);
        } catch (error) {
            console.error("Failed to connect wallet:", error);
            toast.error("Failed to connect wallet. Check MetaMask.");
        }
    };

    // Check if the user is on the correct network
    const checkNetwork = async (web3Provider) => {
        if (!window.ethereum) return;

        try {
            const network = await web3Provider.getNetwork();
            console.log("Current Network:", network.chainId);
        } catch (error) {
            console.error("Error checking network:", error);
            toast.error("Error checking network.");
        }
    };

    // Switch the user to the correct network
    const switchNetwork = async () => {
        if (!window.ethereum) {
            toast.error("MetaMask is not installed!");
            return;
        }

        try {
            await window.ethereum.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: "0x66EED" }],
            });
            setNetworkError(""); // Clear the error once switched successfully
        } catch (switchError) {
            if (switchError.code === 4902) {
                addNetwork();
            } else {
                console.error("Error switching network:", switchError);
            }
        }
    };

    // Add the network if it's not already configured in the wallet
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
                        chainId: "0x66EED",
                        chainName: "Arbitrum Sepolia",
                        rpcUrls: ["https://sepolia-rollup.arbitrum.io/rpc"],
                        nativeCurrency: {
                            name: "Arbitrum Sepolia",
                            symbol: "Sepolia Eth",
                            decimals: 18,
                        },
                        blockExplorerUrls: ["https://arbitrum-sepolia.blockscout.com/"],
                    },
                ],
            });
        } catch (addError) {
            console.error("Error adding network:", addError);
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
                    setWalletAddress(accounts[0]);
                    const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
                    setProvider(web3Provider);
                    const web3Signer = web3Provider.getSigner();
                    setSigner(web3Signer);
                }
            });

            window.ethereum.on("chainChanged", async () => {
                const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
                setProvider(web3Provider);
                const web3Signer = web3Provider.getSigner();
                setSigner(web3Signer);
                const address = await web3Signer.getAddress();
                setWalletAddress(address);
                checkNetwork(web3Provider);
            });
        }
    }, []);

    return (
        <>
            {/* Wallet Connect Button */}
            <img src="https://img.freepik.com/free-vector/colorful-letter-gradient-logo-design_474888-2309.jpg" height="70px" width="100px"/>
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
                    <Route path="/createInvoice" element={<CreateInvoice address={walletAddress} />} />
                    <Route path="/verify" element={<VerifyProof address={walletAddress} />} />

                    <Route path="/viewInvoice" element={<ViewInvoice address={walletAddress} />} />
                    <Route path="/payInvoice" element={<PayInvoice address={walletAddress} />} />
                    <Route path="/payInvoiceQR/:invoiceId" element={<PayInvoiceQr address={walletAddress} />} />
                    <Route path="/paymentConfirmation/:transactionHash" element={<PaymentConfirmation address={walletAddress} />} />
                </Routes>
            </Router>

            <ToastContainer />
        </>
    );
}

export default App;
