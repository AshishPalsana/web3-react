import React from "react";
import { useAccount, useSignMessage } from "wagmi";
import { useWeb3Modal } from "@web3modal/react";
import { toast } from "react-toastify";
import { useLocation } from "react-router-dom";

import Home from "../landing/Home";
import Footer from "../../components/Footer";
import LandingHeader from "../landing/LandingHeader";
import { useAuth } from "../../hooks/useAuth";

const Connect = () => {
  document.title = "H3Y - Simple & Fast Collab Tool | Free Forever";

  const { pathname } = useLocation();
  const { login, user } = useAuth();
  const { address, status, isConnected } = useAccount();
  const { open } = useWeb3Modal();

  const isAuthenticated = isConnected && !!user;

  // Function to handle successful signing of the message
  const { signMessage } = useSignMessage({
    onSuccess(data, variables) {
      const payload = {
        message: variables.message,
        signature: data,
        wallet_address: address,
      };
      if (payload) {
        login(payload, pathname);
      }
    },
    onError() {
      toast.error("Hey, just need to verify it’s you. Please authenticate to proceed.");
    },
  });

  // Function to handle the Metamask authentication
  const metamaskHandler = async () => {
    if (status === "connected") {
      const message = `{
        address: ${address},
        timestamp: ${parseInt(Date.now() / 1000)}
      }`;

      signMessage({ message });
    } else {
      open();
    }
  };

  return (
    <div className="landing container">
      <LandingHeader />
      <Home
        handleConnect={metamaskHandler}
        status={status}
        isAuthenticated={isAuthenticated}
        user={user}
        address={address}
      />
      <Footer />
    </div>
  );
};
export default Connect;
