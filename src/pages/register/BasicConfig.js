import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import BasicForm from "./components/BasicForm";
import Header from "../../components/Header";
import GroupsForm from "./components/GroupsForm";
import Footer from "../../components/Footer";
import { setCurrentFormStep, setDiscordServerData } from "../../store/reducer";
import { ApiCall } from "../../utils/ApiUtils";

const BasicConfig = () => {
  document.title = "H3Y - Launch";

  const dispatch = useDispatch();

  const currentFormStep = useSelector(({ currentFormStep }) => currentFormStep);

  useEffect(() => {
    try {
      window.scrollTo(0, 0);
      ApiCall("GET", `/http/discord/getBotGuilds`).then((botGuildsResponse) => {
        dispatch(setDiscordServerData(botGuildsResponse?.data));
      });
    } catch (error) {
      console.log(error);
    }
  }, []);

  const goBack = (current) => {
    if (current < currentFormStep) dispatch(setCurrentFormStep(currentFormStep - 1));
  };

  const goNext = () => dispatch(setCurrentFormStep(currentFormStep + 1));

  return (
    <>
      <div>
        <Header isConfirmBack={true} />
        <div className="comon-all-body float-start w-100 md-5">
          <div className="comon-div">
            <div className="container px-sm-0">
              <h1 className="main-haeding text-center text-white mb-2 mt-2"> Launch Collab </h1>
              <div className="comon-from mb-md-5 mt-md-3 mb-4 mt-3">
                <div className="blur"></div>
                <div className="main-forms">
                  <div className="link-gopage mb-5">
                    <ul className="list-unstyled d-flex justify-content-center align-items-center mb-1">
                      <li className={`${currentFormStep === 1 ? "active" : ""}`} onClick={() => goBack(1)}>
                        <div className="comon-btn-nomber text-center d-table">
                          <span className="count-div">1</span>
                          <p className="fs-20"> Collab info </p>
                        </div>
                      </li>
                      <li className={`${currentFormStep === 2 ? "active" : ""}`} onClick={() => goBack(2)}>
                        <div className="comon-btn-nomber text-center d-table">
                          <span className="count-div">2</span>
                          <p className="fs-20"> Configure Collabs </p>
                        </div>
                      </li>
                    </ul>
                  </div>
                  {currentFormStep === 1 && <BasicForm goNext={goNext} />}
                  {currentFormStep === 2 && <GroupsForm />}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};
export default BasicConfig;
