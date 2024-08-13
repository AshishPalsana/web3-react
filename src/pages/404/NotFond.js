import React from "react";
import { useNavigate } from "react-router-dom";

import Footer from "../../components/Footer";

import Oops from "../../assets/images/oops.svg";

const NotFond = () => {
  document.title = "H3Y - Page not found";

  const navigate = useNavigate();
  return (
    <>
      <div className="container">
        <div className="not-found">
          <div className="opps-text">
            <h1>Error 404!</h1>
            <p>Page not found!</p>
            <button onClick={() => navigate(-1)}>Go back</button>
          </div>
          <div className="opps-icon">
            <img src={Oops} alt="Oops" />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default NotFond;
