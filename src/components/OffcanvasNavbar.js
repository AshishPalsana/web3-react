import { useState } from "react";
import { Nav, Navbar, Offcanvas } from "react-bootstrap";
import { RxHamburgerMenu } from "react-icons/rx";
import { useLocation, useNavigate } from "react-router-dom";
import { useAccount } from "wagmi";

import LeaveConfimationModal from "./Modal/LeaveConfimationModal";

import { ReactComponent as Airdrop } from "../assets/images/airdrop.svg";
import { ReactComponent as Discord } from "../assets/images/discord.svg";
import { ReactComponent as CloseIcon } from "../assets/images/offcanvas-close.svg";

const OffcanvasNavbar = () => {
  const { isConnected } = useAccount();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const [showNavbar, setShowNavbar] = useState(false);
  const [show, setShow] = useState(false);
  const [redirectPage, setRedirectPage] = useState(null);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  let user = localStorage.getItem("user");
  if (user) {
    user = JSON.parse(user);
  }

  const isAuthenticated = isConnected && !!user;

  const handleNavbarClose = () => setShowNavbar(false);
  const handleNavbarShow = () => setShowNavbar(true);

  const handleRedirect = (slug) => {
    if (pathname === "/launch") {
      handleShow();
      setRedirectPage(slug);
    } else {
      navigate(slug);
    }
  };

  return (
    <>
      <Navbar.Toggle aria-controls={`offcanvasNavbar-expand-${false}`}>
        <RxHamburgerMenu onClick={handleNavbarShow} />
      </Navbar.Toggle>
      <Offcanvas
        className="custom-offcanvas"
        style={{ background: pathname === "/" && "#110134" }}
        id={`offcanvasNavbar-expand-${false}`}
        aria-labelledby={`offcanvasNavbarLabel-expand-${false}`}
        placement="end"
        show={showNavbar}
        onHide={handleNavbarClose}
      >
        <Offcanvas.Header>
          <CloseIcon onClick={handleNavbarClose} />
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Nav className="justify-content-end flex-grow-1 pe-3">
            {isAuthenticated && (
              <Nav.Link
                active={pathname === "/launch"}
                disabled={pathname === "/launch"}
                onClick={() => handleRedirect("/launch")}
              >
                Launch Collabs
              </Nav.Link>
            )}
            {isAuthenticated && (
              <Nav.Link
                active={pathname === "/manage"}
                disabled={pathname === "/manage"}
                onClick={() => handleRedirect("/manage")}
              >
                Manage Collabs
              </Nav.Link>
            )}
            <Nav.Link
              active={pathname === "/discover"}
              disabled={pathname === "/discover"}
              onClick={() => handleRedirect("/discover")}
            >
              Discover Collabs
            </Nav.Link>
            <Nav.Link
              active={pathname === "/leaderboard"}
              disabled={pathname === "/leaderboard"}
              onClick={() => handleRedirect("/leaderboard")}
            >
              Leaderboard
            </Nav.Link>
            {/* <Nav.Link active={pathname === "/"} disabled={pathname === "/"} onClick={() => handleRedirect("/")}>
              About us
            </Nav.Link> */}
            <Nav.Link
              active={pathname === "/faqs"}
              disabled={pathname === "/faqs"}
              onClick={() => handleRedirect("/faqs")}
            >
              FAQs
            </Nav.Link>
            <hr />
            <Nav.Link active={pathname === "/claim"} disabled={pathname === "/claim"} href={"/claim"} target="_blank">
              <Airdrop /> Airdrops
            </Nav.Link>
            <Nav.Link
              target="_blank"
              active={false}
              href={`${process.env.REACT_APP_DISCORD_JOIN_LINK}`}
            >
              <Discord /> Join Discord
            </Nav.Link>

            {/*<Nav.Link
              target="_blank"
              href={`${process.env.REACT_APP_DISCORD_AUTH_URL}/oauth2/authorize?client_id=${process.env.REACT_APP_DISCORD_AUTH_CLIENT_ID}&permissions=268435456&scope=bot%20applications.commands`}
            >
              <Discord /> Install Discord
            </Nav.Link> */}
          </Nav>
        </Offcanvas.Body>
      </Offcanvas>
      {show && (
        <LeaveConfimationModal
          show={show}
          handleClose={handleClose}
          handleConfirm={(e) => navigate(e)}
          redirectPage={redirectPage}
        />
      )}
    </>
  );
};

export default OffcanvasNavbar;
