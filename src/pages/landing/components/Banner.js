import React from "react";
import { NavLink } from "react-router-dom";

import Arrow from "../../../assets/images/arrow.png";

const Banner = ({ handleConnect, status, isAuthenticated, navigateToManage }) => {
  return (
    <>
      <section className="float-start w-100">
        <div className="container">
          <div className="ban-text text-center banner">
            <h1>
              {" "}
              <span className="sp-color"> Supercharge </span>
              <span className="d-sm-block">
                {" "}
                <span className="d-block d-sm-inline"> Your Collabs </span>{" "}
              </span>
            </h1>

            <ul className="list-unstyled d-flex align-items-center justify-content-center">
              <li>
                <NavLink to="/">Free Forever</NavLink>
              </li>
              <li>
                <NavLink to="/">Simple & Powerful</NavLink>
              </li>
              <li>
                <NavLink to="/">Get Token Rewards</NavLink>
              </li>
            </ul>

            <p className="text-center col-lg-6 mx-auto">
              H3Y is a simple, free forever collab management tool that rewards you for the collabs you run and
              participate in.
            </p>
            {isAuthenticated ? (
              <button className="btn mx-auto comon-buuton" onClick={navigateToManage}>
                Launch App
              </button>
            ) : (
              <button
                className="btn mx-auto comon-buuton"
                data-bs-toggle="modal"
                data-bs-target="#productsModal"
                onClick={handleConnect}
              >
                {status === "connected" ? "Authenticate" : "Connect Wallet"}
                <img src={Arrow} alt="arrow" />
              </button>
            )}
          </div>
        </div>
      </section>
    </>
  );
};
export default Banner;
