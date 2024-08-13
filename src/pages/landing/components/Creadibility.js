import React from "react";

import Arrow from "../../../assets/images/arrow.png";

function Creadibility() {
  return (
    <>
      <div className="container">
        <h2 className="text-center lan-sub-head"> Credibility </h2>
        <div className="line"></div>

        <div className="row row-cols-1 row-cols-lg-2 bd-cre align-items-center">
          <div className="col">
            <img src="images/0xyLabsColorSVG1.webp" className="cre-img" alt="pn" />
          </div>
          <div className="col">
            <p>
              8080 Tools is a product initiative by 0xytocin Labs, the dev team behind many big projects such as Project
              Godjira and Lab Grown Beasts.
            </p>
            <p className="mt-4">
              We are a 25+ member global team. 0xy's deployments have processed more than 5000 ETH worth of value in
              less than a year. We have always had a razor sharp focus on setting up highly performant NFT dApps (mint,
              stake, marketplace etc.) across top-tier projects and 8080 Tools is the productization of this expansive
              experience.
            </p>

            <div className="d-flex  flex-column-reverse  flex-lg-row align-items-center mt-5">
              <a href="https://www.xyz.com/contact" target="_blank" className="btn  contact-btn ms-lg-0">
                {" "}
                Contact Us{" "}
              </a>
              <a href="https://www.xyz.com/" target="_blank" className="btn  comon-buuton">
                {" "}
                Learn More
                <img src={Arrow} alt="arrow" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
export default Creadibility;
