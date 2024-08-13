import React from "react";

import Footer from "../../components/Footer";
import LandingHeader from "../landing/LandingHeader";

const Terms = () => {
  document.title = "H3Y - Terms";

  return (
    <div className="container">
      <LandingHeader />
      <div className="terms-content">
        <h1 className="text-center">Terms of Use</h1>
        <h2 className="mb-3 fw-bold pt-4">1. Introduction</h2>
        <p>
          Welcome to HYP3R Bot! Our bot is designed to help the project owners and collab managers of Discord servers
          manage raffles through H3Y. By using our bot, you agree to comply with these Terms and Conditions, as well as
          Discord's Terms of Service and Community Guidelines.
        </p>

        <h2 className="mb-3 fw-bold pt-4">2. Use of the Bot</h2>
        <p>
          Our bot is provided as is, and we cannot guarantee its availability or reliability. We reserve the right to
          modify or discontinue the bot at any time, without prior notice. We also reserve the right to suspend or
          terminate your access to the bot, if we believe that you are in violation of these Terms and Conditions or
          Discord's policies.
          <br />
          You may use our bot to manage raffles on your Discord server, provided that you comply with our guidelines and
          any applicable laws and regulations. You may not use our bot to engage in any illegal or harmful activities,
          or to violate the rights of others.
        </p>
        <h2 className="mb-3 fw-bold pt-4">3. Data Collection and Privacy</h2>
        <p>
          Our bot collects and processes certain data, such as your Discord user ID and server roles, in order to verify
          your eligibility to participate in raffles and to provide you with the bot's services. We respect your privacy
          and will only use your data for these purposes.
          <br />
          We will not share your data with third parties, except as required by law or as necessary to provide the bot's
          services. We use reasonable technical and organisational measures to protect your data against unauthorised
          access, loss, or alteration.
        </p>

        <h2 className="mb-3 fw-bold pt-4">4. Disclaimer of Warranties</h2>
        <p>
          Our bot is provided as is, without any warranties or guarantees of any kind, whether express or implied. We do
          not guarantee that our bot will be error-free, uninterrupted, or meet your specific requirements. We are not
          responsible for any damages or losses that may result from your use of our bot.
        </p>
        <h2 className="mb-3 fw-bold pt-4">5. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by law, we are not liable for any direct, indirect, incidental, special, or
          consequential damages arising from your use of our bot, including but not limited to damages for loss of
          profits, data, or other intangible losses. Our liability is limited to the amount paid by you (if any) to use
          the bot.
        </p>

        <h2 className="mb-3 fw-bold pt-4">6. Indemnification</h2>
        <p>
          You agree to indemnify and hold harmless <b> HYP3R Bot</b> and its owners, directors, officers, employees, and
          agents from and against any claims, damages, liabilities, costs, and expenses (including reasonable attorneys'
          fees) arising from your use of the bot, your breach of these Terms and Conditions, or your violation of any
          applicable laws or regulations.
        </p>
        <h2 className="mb-3 fw-bold pt-4">7. Modifications</h2>
        <p>
          We reserve the right to modify these Terms and Conditions at any time, without prior notice. You are
          responsible for regularly reviewing these Terms and Conditions, and your continued use of the bot after any
          modifications indicates your acceptance of the modified Terms and Conditions.
        </p>

        <h2 className="mb-3 fw-bold pt-4">8. Contact Us</h2>
        <p>
          If you have any questions or concerns about these Terms and Conditions or our bot, please contact us at{" "}
          <a href="mailto:ak@0xytocin.com" className="theme-colored-font">
            ak@0xytocin.com
          </a>
          . We will do our best to address your concerns in a timely and effective manner.
          <br />
          By using our bot, you acknowledge that you have read, understood, and agree to these Terms and Conditions.
          <br />
          Thank you for using HYP3R Bot!
        </p>
      </div>
      <Footer />
    </div>
  );
};

export default Terms;
