import React from "react";
import { useNavigate } from "react-router-dom";

import Banner from "./components/Banner";
import HowItWork from "./components/HowItWork";
import Creadibility from "./components/Creadibility";
import Multilogo from "./components/Multilogo";

import "./landing.css";

const Home = ({ handleConnect, status, isAuthenticated }) => {
  const navigate = useNavigate();

  const navigateToManage = () => {
    navigate("/manage");
  };

  return (
    <>
      <Banner
        handleConnect={handleConnect}
        status={status}
        isAuthenticated={isAuthenticated}
        navigateToManage={navigateToManage}
      />
      <section
        className="float-start w-100 body-total-part scrollspy-example"
        data-bs-spy="scroll"
        data-bs-target="#navbar-example2"
        data-bs-offset="100"
        tabIndex="0"
      >
        <div id="howitworks" className="how-it-work-1">
          <HowItWork
            handleConnect={handleConnect}
            status={status}
            isAuthenticated={isAuthenticated}
            navigateToManage={navigateToManage}
          />
        </div>
        <div id="credibility" className="credibility-div">
          <Creadibility handleConnect={handleConnect} isAuthenticated={isAuthenticated} />
        </div>
        <Multilogo />
      </section>
    </>
  );
};
export default Home;
