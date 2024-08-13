import React, { useState, useEffect } from "react";
import { Navbar } from "react-bootstrap";
import { NavLink, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useWeb3Modal } from "@web3modal/react";
import { useAccount, useSignMessage } from "wagmi";

import OffcanvasNavbar from "../../components/OffcanvasNavbar";
import { useAuth } from "../../hooks/useAuth";
import { cutAddress } from "../../utils/common";

import "./landing.css";

const LandingHeader = () => {
  const { pathname } = useLocation();
  const { login, user } = useAuth();
  const { address, status, isConnected } = useAccount();
  const { open } = useWeb3Modal();

  const [scroll, setScroll] = useState(false);

  const isAuthenticated = isConnected && !!user;

  useEffect(() => {
    window.addEventListener("scroll", () => {
      setScroll(window.scrollY > 50);
    });
  }, []);

  useEffect(() => {
    if (address || user) {
      localStorage.setItem("token", user?.token);
    } else {
      localStorage.clear();
    }
  }, [address, user, status]);

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
    <>
      <section className={scroll ? "full-with" : "fixed-with"}>
        <div className="top-sec-bar navbar-fixed-top comon-page float-start w-100">
          <div className="container">
            <div className="top-inside-div">
              <Navbar expand={false}>
                <NavLink to="/" className="navbar-brand">
                  <img src="images/hyp3-logo.webp" alt="logo" style={{ maxWidth: "140px" }} />
                </NavLink>
                <div className="d-flex align-items-center gap-3">
                  <ul className="d-flex align-items-center flex-row gap-3 navbar-nav ms-auto mb-2 mb-lg-0">
                    <li className="nav-item">
                      {isAuthenticated ? (
                        <button type="button" className="btn active-id-btn">
                          {cutAddress(address, 5)}
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn comon-buuton get-started-bty mx-sm-1"
                          onClick={metamaskHandler}
                        >
                          {status === "connected" ? "Authenticate" : "Connect Wallet"}
                        </button>
                      )}
                    </li>
                  </ul>
                  <OffcanvasNavbar />
                </div>
              </Navbar>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default LandingHeader;
