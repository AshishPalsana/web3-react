import React, { useState } from "react";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import moment from "moment";

import { setCurrentFormStep, setIsEditUserId, setSavedFirstStep, setSaveDraftData } from "../../../store/reducer";
import LaunchModal from "./Modal/LaunchModal";

const noOfRq = ["allowListName", "projectName", "projectLogo", "projectBackgroundImage", "projectWebsite", "discord"];

const Draft = ({ draftData, fetchData, deployedData }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [launchData, setLaunchData] = useState({});
  const numberOfAllowlist = useSelector(({ noLimit }) => noLimit?.numberOfAllowlist);

  const LaunchModalShow = () => setShow(true);
  const LaunchModalClose = () => setShow(false);

  const editDraft = (item) => {
    const { allowlistGroup, ...rest } = item;
    localStorage.setItem("basicForm", JSON.stringify(rest));
    dispatch(setSavedFirstStep(rest));
    dispatch(setSaveDraftData(rest));
    dispatch(setCurrentFormStep(1));
    dispatch(setIsEditUserId(false));
    navigate("/launch");
  };

  return (
    <>
      <div className="content-wrap">
        {draftData?.map((curElem, index) => {
          let noOfUserField = 0;
          noOfRq.map((item) => {
            if (curElem[item]) noOfUserField = noOfUserField + 1;
          });
          let progress = Math.round((noOfUserField / noOfRq.length) * 100);

          if (curElem.allowlistGroup.length <= 0) {
            progress = 60;
          }

          return (
            <div key={index}>
              <div className="comon-draft-div-main pt-4">
                <div className="comon-items-draft">
                  <div className="d-lg-flex align-items-center justify-content-between">
                    <h2 className="dft-titel">
                      {curElem.projectName} <span> DRAFT </span>
                    </h2>
                    <span className="right-cm-df">
                      last edited on {moment(curElem?.updatedAt).format("Do of MMMM, YYYY")}{" "}
                    </span>
                  </div>
                  <div className="row">
                    <div className="col-sm-8">
                      <div className="pogress-div start">
                        <div className="dft-top">
                          <h5>Progress </h5>
                        </div>
                        <div className="dft-ps">
                          <div className="prog-div">
                            <div className="progress">
                              <div
                                className="progress-bar"
                                role="progressbar"
                                style={{ width: `${progress}%` }}
                                aria-valuenow="25"
                                aria-valuemin="0"
                                aria-valuemax="100"
                              ></div>
                            </div>
                            <span className="d-block text-center"> {progress}% </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-sm-4">
                      <div className="pogress-div end">
                        <div className="dft-top">
                          <h5> Actions </h5>
                        </div>
                        <div className="dft-ps">
                          {progress >= 100 ? (
                            <>
                              <button className="btn-gradient btn-gradient-after" onClick={() => editDraft(curElem)}>
                                EDIT
                              </button>
                              <p className="px-1 fs-4">•</p>
                              <button
                                className="btn-gradient btn-gradient-after"
                                onClick={() => {
                                  const resumeData = deployedData?.filter((item) => item?.isActive);
                                  if (numberOfAllowlist > resumeData?.length) {
                                    setLaunchData(curElem);
                                    LaunchModalShow();
                                  } else {
                                    toast.error(
                                      "You have reached the maximum limit to launch a collab. Please pause an existing collab to launch a new one."
                                    );
                                  }
                                }}
                              >
                                LAUNCH
                              </button>
                            </>
                          ) : (
                            <button className="btn-gradient btn-gradient-after" onClick={() => editDraft(curElem)}>
                              COMPLETE
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {show && (
        <LaunchModal show={show} LaunchModalClose={LaunchModalClose} launchData={launchData} fetchData={fetchData} />
      )}
    </>
  );
};
export default Draft;
