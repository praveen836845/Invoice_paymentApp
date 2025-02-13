import { useEffect, useRef } from "react";
import { Navigate } from "react-router-dom";
import toast from "react-hot-toast";

const ProtectedRoute = ({ children, walletAddress }) => {
    const hasShownToast = useRef(false);

    useEffect(() => {
        if (!walletAddress && !hasShownToast.current) {
            toast.error("Please connect your wallet to access this pages.");
            hasShownToast.current = true;
        }
        
        // Reset the ref when wallet gets connected
        if (walletAddress) {
            hasShownToast.current = false;
        }
    }, [walletAddress]);

    if (!walletAddress) {
        return <Navigate to="/" />;
    }

    return children;
};

export default ProtectedRoute;