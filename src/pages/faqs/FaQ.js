import { Accordion } from "react-bootstrap";
import AccordionItem from "react-bootstrap/esm/AccordionItem";
import AccordionHeader from "react-bootstrap/esm/AccordionHeader";
import AccordionBody from "react-bootstrap/esm/AccordionBody";
import { IoIosWarning } from "react-icons/io";

import Footer from "../../components/Footer";
import Header from "../../components/Header";

const FaQ = () => {
  document.title = "H3Y - FAQs";

  return (
    <div className="container">
      <Header />

      <div className="onboarding-content">
        <div className="accordian-container">
          <h1>FAQs</h1>
          <h2>About H3Y</h2>
          <Accordion>
            <AccordionItem eventKey="0">
              <AccordionHeader>What is H3Y?</AccordionHeader>
              <AccordionBody>
                H3Y is a simple, free forever collab management tool that rewards collab managers for choosing H3Y as
                their go-to tool for launching collabs.
              </AccordionBody>
            </AccordionItem>
            <AccordionItem eventKey="1">
              <AccordionHeader>How can H3Y help you?</AccordionHeader>
              <AccordionBody>
                H3Y is built to streamline the entire collab management journey and provides numerous benefits and
                rewards for both collab managers and project founders. Following are a few benefits of choosing H3Y as
                a go-to collab management tool:
                <p>
                  <br />
                  <b>Benefits for Collab Managers:</b>
                </p>
                <ul>
                  <li>You can launch whitelist collabs with just a few clicks.</li>
                  <li>All collab-related announcements are automatically made in your discord server.</li>
                  <li>You can get an infinite number of registrations.</li>
                  <li>You can track activity for all your collabs in a single dashboard.</li>
                  <li>You get rewarded for each collab you launch on H3Y.</li>
                </ul>
                <br />
                <p>
                  <b>Benefits for Project Founders:</b>
                </p>
                <ul>
                  <li>You can get collabs launched for free forever.</li>
                  <li>
                    You can boost your audience growth and give them a gamified experience through customized
                    qualification criteria and invite codes.
                  </li>
                  <li>Your audience is constantly informed about the collabs in your discord server.</li>
                  <li>Your audience gets to participate in all the collabs launched across the H3Y network.</li>
                </ul>
              </AccordionBody>
            </AccordionItem>
          </Accordion>

          <h2>Running Collabs on H3Y</h2>
          <Accordion>
            <AccordionItem eventKey="0">
              <AccordionHeader>What is HYP3R Bot and how to install it?</AccordionHeader>
              <AccordionBody>
                <span className="onboarding-warn">
                  <IoIosWarning /> Only Server Admins can install and configure
                </span>
                HYP3R is a Discord bot that facilitates collab management on H3Y. It allows you to verify Collab
                Managers and set-up channels for automatic announcements in your server when collabs get launched and
                winners are picked.
                <br />
                <br />
                The bot installation and set-up process is a simple one-time task, it allows auto-announcements and
                makes it easy for your collab managers to run collabs without worrying about Discord permissions.
                <br />
                <br />
                Steps to install HYP3R Bot:
                <ol>
                  <li>
                    <a href="#" className="discord-inline-link">
                      Click Here
                    </a>{" "}
                    to install HYP3R Bot 🤖
                    <br />
                    <br />
                  </li>
                  <li>
                    To set-up channels for automatic announcements, enter the following command:
                    <br />
                    <p className="code-block">
                      /setup-announcements launch<span className="code-hl-1">[input1]</span> winners
                      <span className="code-hl-2">[input2]</span>
                    </p>
                    <p>
                      <span className="inline-code-block code-hl-1">[input1]</span> - channel for collab launch
                      announcements 📃
                    </p>
                    <p>
                      <span className="inline-code-block code-hl-2">[input2]</span> - channel for collab winner
                      announcements 🏆
                    </p>
                    <br />
                  </li>
                  <li>
                    To ensure only verified CMs can run collabs on H3Y, run the command:
                    <p className="code-block">
                      /add-cm collab-manager <span className="code-hl-1"> [@discordID]</span>
                    </p>
                    <br />
                    🎉 Congratulations! You've successfully installed and set up HYP3R Bot for your server.
                  </li>
                </ol>
              </AccordionBody>
            </AccordionItem>
            <AccordionItem eventKey="1">
              <AccordionHeader>How to launch collabs on H3Y?</AccordionHeader>
              <AccordionBody>
                <span className="onboarding-warn">
                  <IoIosWarning /> Only verified CMs can launch collabs on H3Y. Visit Step 1 to know more about
                  verification on H3Y.
                </span>
                <p>
                  <br />
                  On H3Y, you can launch collabs with customized qualification criteria such as
                  <ul>
                    <br />
                    <li>making it mandatory for specific roles on discord,</li>
                    <li>following users follow, like and retweet on Twitter</li>
                    <li>having minimum balance</li>
                    <li>Tokengating for NFT from contracts</li>
                  </ul>
                </p>
                <p>
                  <br />
                  H3Y further provides you with a referral codes feature, which users can use to contribute to your
                  growth by inviting their friends and participating in your collab.
                  <br />
                  <br />
                  Here’s how you can launch collabs on H3Y.
                  <ol>
                    <br />
                    <li>
                      Once, you are verified as a CM, sign-in to{" "}
                      <a href="https://launch.hyp3.xyz/" className="discord-inline-link">
                        H3Y website
                      </a>{" "}
                      to access your dashboard.
                    </li>
                    <li>
                      In your dashboard, locate and click the <b>"Launch"</b> button to open the Collab Launcher form.
                    </li>
                    <li>
                      On the form's first page, fill in basic details of your project and authenticate your discord to
                      select the server where your collab will take place.
                    </li>
                    <li>
                      On the second page, define your Collab type (Raffle, FCFS or QnA). Add any qualification criteria
                      that participants need to meet to join your collab.
                    </li>
                    <li>
                      Once you have filled the form with all the necessary information, click the <b>"Done"</b> button
                      to submit it.
                    </li>
                  </ol>
                  <br />
                  🥳Congrats! Your Collab is now launched!
                  <br />
                  <br />
                  📢An announcement will be automatically made in your discord server to notify your participants. You
                  can access all the details and manage your collab through your manage dashboard
                </p>
              </AccordionBody>
            </AccordionItem>
            <AccordionItem eventKey="2">
              <AccordionHeader>How to select winners for your collabs?</AccordionHeader>
              <AccordionBody>
                Here’s how you can select winners for different types of collabs across servers through a single
                <a href="/manage"> Manage Dashboard</a>. <br />
                <br />
                <p>
                  <b>Winner Selection for Raffle:</b>
                  <ul>
                    <li>
                      {" "}
                      Click on <b> "Pick and Announce"</b> button.
                    </li>
                    <li>
                      This will automatically send an announcement to your Discord server and notify the winners via
                      email as well.{" "}
                    </li>
                    <li>
                      You can download the details of all the participants and winners by clicking the <b>download</b>{" "}
                      button.
                    </li>
                  </ul>
                  <br />
                  <b>Winner Selection for FCFS:</b>
                  <ul>
                    <li>
                      {" "}
                      Click on <b>"Announce"</b> button.
                    </li>
                    <li>
                      {" "}
                      This will trigger an automatic announcement in your Discord server, notifying the winners through
                      email as well.{" "}
                    </li>
                    <li>
                      You can download the details of all the participants and winners by clicking the <b>download</b>{" "}
                      button.
                    </li>
                  </ul>
                  <br />
                  <b> Winner Selection for QnA:</b>
                  <ul>
                    <li> Download and review the responses from the participants. </li>
                    <li>
                      {" "}
                      Pick the winners and upload their wallet addresses in your dashboard through the{" "}
                      <b>"Selected Addresses"</b> button.
                    </li>
                    <li>
                      Once the wallet addresses are uploaded, a notification will be sent to the winners via email.
                    </li>
                  </ul>
                </p>
              </AccordionBody>
            </AccordionItem>
          </Accordion>

          <h2>Give and Take Whitelist Spots on H3Y</h2>
          <Accordion>
            <AccordionItem eventKey="0">
              <AccordionHeader>How to upload spots on H3Y?</AccordionHeader>
              <AccordionBody>
                If you are in a server with HYP3R Bot installed, then you can upload spots and notify hundreds of CMs in
                H3Y network with just a click. To upload spots, enter the command :
                <p className="code-block">
                  /upload-spots: Enter project title:
                  <span className="code-hl-1">[Title of the Project]</span>
                </p>
                <p>
                  <br />
                  If your project is present in our database,
                  <ul>
                    <li>The entered project will appear in a drop-down.</li>
                    <li>On selecting the project, all the details about project will appear.</li>
                    <li>"Click add spots button" and provide your basic details.</li>
                    <li>That’s it, available spots are added to your project.</li>
                  </ul>
                </p>
                <p>
                  <br />
                  If your project is not present in our database,
                  <ul>
                    <li>
                      You can request to add your project by clicking the button <b>"Add your project details"</b>
                    </li>
                    <li>
                      You will have to enter both <b>Project Details</b> and <b>Project Mint Details</b>
                    </li>
                    <li>Once your project details are added, you can add spots for your project.</li>
                  </ul>
                </p>
                <br />
                🎉 Congratulations! After you add spots, a notification will be automatically made across all the
                servers with HYP3R Bot installed about the spots availability and fellow CMs can reach out to you.
              </AccordionBody>
            </AccordionItem>
            <AccordionItem eventKey="1">
              <AccordionHeader>How to find spots on H3Y?</AccordionHeader>
              <AccordionBody>
                If a server has HYP3R Bot installed, anyone can easily discover spots for projects approved by H3Y.{" "}
                <br />
                <br />
                <p>
                  <b> To Find Spots for All Projects:</b>
                  <br />
                  <ul>
                    <li>
                      In any channel of the server, type the command
                      <span className="inline-code-block">/all-spots</span>
                    </li>
                    <li>HYP3R bot will return you the list of all available spots across projects in H3Y.</li>
                  </ul>
                  <br />
                  <b>To Find Spots for a Specific Project:</b>
                  <ul>
                    <li>
                      In any channel of the server, type the command
                      <span className="inline-code-block">
                        /find-spots Project <span className="code-hl-1">[Enter project name]</span>
                      </span>
                    </li>
                    <li>
                      If the project has active spots available, HYP3R Bot will return you the details of the project,
                      including the title and information about the CM who is offering the spots.
                    </li>
                  </ul>
                </p>
                <br />
              </AccordionBody>
            </AccordionItem>
          </Accordion>

          <h2>Events and Rewards on H3Y</h2>
          <Accordion>
            <AccordionItem eventKey="0">
              <AccordionHeader>How to win Weekly Rewards on H3Y?</AccordionHeader>
              <AccordionBody>
                <p>
                  <b>Weekly Rewards:</b>
                  <br />
                  <ul>
                    <li>
                      Every week, $600 is given away to the top 3 collab managers who have accumulated the most H3Y
                      points.
                    </li>
                    <li>The reward distribution is as follows:</li>
                    <ul>
                      <li>🥇 1st Place: $300</li>
                      <li>🥈 2nd Place: $200</li>
                      <li>🥉 3rd Place: $100</li>
                    </ul>
                  </ul>
                  <br />
                  <b>Eligibility for Rewards:</b>
                  <br />
                  <ul>
                    <li>To be eligible for a reward, you need to accumulate at least 1500 new points within a week</li>
                  </ul>
                  <br />
                  <b>Point Calculation in H3Y:</b>
                  <br />
                  <ul>
                    <li>Earn 10 points for every new participant who joins your collabs.</li>
                    <li>Earn 5 points for every repeat participant who registers to your collab.</li>
                    <li>
                      Earn 10% of all H3Y points accumulated by other collab managers whom you have invited to H3Y.
                    </li>
                  </ul>
                  <br />
                  <b>Check Your Leaderboard Position:</b>
                  <br />
                  <ul>
                    <li>
                      To see your position on the leaderboard, click on the following link:
                      <a href="/leaderboard"> Leaderboard Link</a>.
                    </li>
                    <li>
                      The leaderboard shows weekly and all-time rankings of collab managers based on their H3Y points.
                    </li>
                  </ul>
                </p>
              </AccordionBody>
            </AccordionItem>
            <AccordionItem eventKey="1">
              <AccordionHeader>How to check your eligibility for Air-Drops Season 1?</AccordionHeader>
              <AccordionBody>
                <p>
                  <b>Earn H3Y Tokens:</b>
                  <ul>
                    <li>
                      As a Collab Manager (CM), you can earn 10 $H3Y tokens for every point obtained through successful
                      registrations.
                      <span className="inline-code-block">1 point = $10 H3Y tokens</span>
                    </li>
                  </ul>
                  <br />
                  <b>Check Eligible Rewards:</b>
                  <ul>
                    <li>
                      Discover your eligible rewards on the dedicated <a href="/claim">air-drops page</a>.
                    </li>
                    <li>
                      Click on the provided link to access the air-drops page and see what rewards you are eligible for.
                    </li>
                  </ul>
                  <br />
                  <b>Incentives for Impactful Collabs:</b>
                  <ul>
                    <li>
                      By organizing engaging and successful collabs, you increase your potential rewards during our
                      season 1 airdrops.
                    </li>
                  </ul>
                </p>
              </AccordionBody>
            </AccordionItem>
          </Accordion>
          <h2>H3Y Broadcast</h2>
          <Accordion>
            <AccordionItem eventKey="0">
              <AccordionHeader>
                What is H3Y Broadcast and How to become a part of it? (Only for Server Admins)
              </AccordionHeader>
              <AccordionBody>
                H3Y Broadcast is an innovative communication solution, where you can receive information about all the
                available whitelist spots across all projects in H3Y Network
                <br />
                <br />
                Further, you can also receive announcements for giveaways launched on H3Y directly in your server and
                encourage your community to participate in amazing deals.
                <br />
                <br />
                Follow these steps to join the H3Y Broadcast network and receive announcements of available spots and
                collabs launched across H3Y.
                <br />
                <br />
                Enter the following command:
                <p className="code-block">
                  /setup-broadcast collabs-launch
                  <span className="code-hl-1">[input1]</span> collabs-winners<span className="code-hl-2">[input2]</span>{" "}
                  spots<span className="code-hl-1">[input3]</span>
                </p>
                <ul>
                  <li>[input1]: Specify the broadcast channel for collab launch announcements.</li>
                  <li>[input2]: Specify the broadcast channel for winner announcements.</li>
                  <li>[input3]: Specify the broadcast channel for available spots across H3Y.</li>
                </ul>
                <br />
                After selecting the channels for broadcast, you will join the H3Y Broadcast network and start receiving
                announcements for collabs launched and spots uploaded across the H3Y platform.
              </AccordionBody>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default FaQ;
