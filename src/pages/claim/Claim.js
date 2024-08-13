import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useAccount } from "wagmi";

import Footer from "../../components/Footer";
import Header from "../../components/Header";
import { ApiCall } from "../../utils/ApiUtils";
import { currencyFormatter } from "../../utils/common";

const Claim = () => {
  document.title = "H3Y - Airdrop";

  const { address, isConnected } = useAccount();
  const [claimTokenData, setClaimTokenData] = useState({});

  let user = localStorage.getItem("user");
  if (user) {
    user = JSON.parse(user);
  }

  // Function to get the claim data based on wallet address
  const getClaimToken = async () => {
    try {
      const resp = await ApiCall("GET", `/rest/allowlist-registrants/getCMDataByWalletAddress/${address}`);
      setClaimTokenData(resp?.data);
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Something went wrong.");
    }
  };

  // Effect to call the API funtion if wallet address exists
  useEffect(() => {
    if (address) {
      getClaimToken();
    }
  }, [address]);

  return (
    <>
      <Header />
      <div className="airdrop-section">
        <div className="airdrop-box">
          <div className="drop-title">
            <span>Airdrops coming soon!</span>
          </div>
          {isConnected && !!user && address ? (
            <div className="drop-body">
              <span>You are eligible for</span>
              <p>{currencyFormatter((claimTokenData?.points || 0) * 10)} $H3Y TOKENS</p>
              <span className="stay-tune">Stay tuned for more info on airdrop date and other details.</span>
            </div>
          ) : (
            <div className="drop-body">
              <span>Connect and authenticate your wallet to discover your air-drop rewards!</span>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Claim;
