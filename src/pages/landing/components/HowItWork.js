import React from "react";

import Arrow from "../../../assets/images/arrow.png";

const HowItWork = ({ handleConnect, status, isAuthenticated, navigateToManage }) => {
  return (
    <>
      <div className="container">
        <h2 className="text-center lan-sub-head"> How H3Y Works </h2>
        <p className="text-center col-lg-6 mx-auto">
          {" "}
          H3Y is simple and completely customisable. Moreover, you get rewarded with H3Y tokens for the collabs you
          run.{" "}
        </p>
        <div className="line"></div>
        <div className="row row-cols-1 row-cols-lg-2 bd-how">
          <div className="col">
            <h2 className="lan-sub-head">
              {" "}
              It's insanely easy to <span className="d-block">get started </span>{" "}
            </h2>
            <p className="col-lg-8"> Launch in under a minute for free. Get rewarded for a lifetime.</p>
            <div className="d-none d-lg-block">
              {isAuthenticated ? (
                <button className="btn mt-4 comon-buuton" onClick={navigateToManage}>
                  Launch App
                </button>
              ) : (
                <button
                  className="btn mt-4 comon-buuton"
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
          <div className="col">
            <ul className="list-unstyled">
              <li>
                <div className="comon-part1">
                  <figure>
                    <img src="images/launch.svg" alt="launch" />
                  </figure>
                  <div className="right-content1">
                    <h2> Launch in under a minute </h2>
                    <p> Launch collab pages with your logo and branding using our simple launcher. </p>
                  </div>
                </div>
              </li>
              <li>
                <div className="comon-part1">
                  <figure>
                    <img src="images/customize.svg" alt="customize" />
                  </figure>
                  <div className="right-content1">
                    <h2> By CMs for CMs </h2>
                    <p>
                      {" "}
                      Launch collabs in the most suitable mode: Raffle, FCFS or Q&A, easily circulate referral codes to
                      gamify virality and much, much more.{" "}
                    </p>
                  </div>
                </div>
              </li>
              <li>
                <div className="comon-part1">
                  <figure>
                    <img src="images/ownership.svg" alt="ownership" />
                  </figure>
                  <div className="right-content1">
                    <h2> Get Token Rewards </h2>
                    <p>
                      Every success on H3Y gets you $H3Y token rewards. Community members signing up make $H3Y too.
                      Everyone wins.
                    </p>
                  </div>
                </div>
              </li>
            </ul>
            <div className="d-block d-lg-none">
              <button
                className="btn mt-4 comon-buuton"
                data-bs-toggle="modal"
                data-bs-target="#productsModal"
                onClick={handleConnect}
              >
                {" "}
                {status === "connected" ? "Authenticate" : "Connect Wallet"}
                <img src={Arrow} alt="arrow" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default HowItWork;
