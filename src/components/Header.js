import React, { useState } from "react";
import { Navbar } from "react-bootstrap";
import { useLocation } from "react-router-dom";
import { useAccount, useSignMessage } from "wagmi";
import { useNavigate } from "react-router-dom";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { toast } from "react-toastify";
import { useWeb3Modal } from "@web3modal/react";

import OffcanvasNavbar from "./OffcanvasNavbar";
import LeaveConfimationModal from "./Modal/LeaveConfimationModal";
import { cutAddress } from "../utils/common";
import { useAuth } from "../hooks/useAuth";

const Header = ({ isConfirmBack = false }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { login } = useAuth();
  const { address, status, isConnected } = useAccount();
  const { open } = useWeb3Modal();
  const [show, setShow] = useState(false);

  let user = localStorage.getItem("user");
  if (user) {
    user = JSON.parse(user);
  }

  const isAuthenticated = isConnected && !!user;

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const goToHome = () => {
    if (isConfirmBack) {
      handleShow();
    } else {
      navigate("/");
    }
  };

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
    <>
      {process.env.REACT_APP_BANNER_TEXT && pathname !== "/faqs" && (
        <Navbar fixed="top" className="fixed-navbar">
          <p>
            {process.env.REACT_APP_BANNER_TEXT}
            {process.env.REACT_APP_BANNER_INFO_TOOLTIP_TEXT && (
              <div className="custom-tooltip" style={{ cursor: "pointer" }}>
                {" "}
                <AiOutlineInfoCircle />
                <span className="tooltip-text custom-tooltip-bottom text-start p-2">
                  {process.env.REACT_APP_BANNER_INFO_TOOLTIP_TEXT}
                </span>
              </div>
            )}
          </p>
        </Navbar>
      )}
      <div
        id="custom-navbar"
        className={`${
          process.env.REACT_APP_BANNER_TEXT && pathname !== "/faqs" && "top-banner"
        } header custom-navbar float-start w-100`}
      >
        <div className="container px-4">
          <Navbar expand={false} className="p-0">
            <div className="navbar-brand" style={{ cursor: "pointer" }} onClick={goToHome}>
              <img src="images/hyp3-logo.webp" alt="logo" />
            </div>
            <div className="d-flex align-items-center gap-4">
              {isAuthenticated ? (
                <button type="button" className="btn active-id-btn">
                  {cutAddress(address, 5)}
                </button>
              ) : (
                <button type="button" className="btn connect-btn" onClick={metamaskHandler}>
                  {status === "connected" ? "Authenticate" : "Connect Wallet"}
                </button>
              )}
              <OffcanvasNavbar />
            </div>
          </Navbar>
        </div>
      </div>
      {show && (
        <LeaveConfimationModal
          show={show}
          handleClose={handleClose}
          handleConfirm={(e) => navigate(e)}
          redirectPage={"/"}
        />
      )}
    </>
  );
};
export default Header;
