import React, { useEffect, useState } from "react";
import { Modal, Accordion, Card } from "react-bootstrap";
import { map, without } from "lodash";
import { useAccordionButton } from "react-bootstrap/AccordionButton";

import { copyTextToClipboard } from "../../../../utils/common";

import { ReactComponent as CopyIcon } from "../../../../assets/images/copy.svg";
import chevronDown from "../../../../assets/images/chevron-down.svg";
import ArrowRight from "../../../../assets/images/arrow.svg";

const ManageAccessCodeModal = ({
  manageAccessCodeModal,
  manageAccessCodeModalClose = () => {},
  groupItem,
  accessCodes,
  issueAccessCodeModalShow = () => {},
}) => {
  const [pillsTab, setPillsTab] = useState("all");
  const [toggle, setToggle] = useState(false);
  const [stopCopy, setStopCopy] = useState(false);
  const [stopCopyAll, setStopCopyAll] = useState(false);
  const [stopCodesCopy, setStopCodesCopy] = useState(false);

  useEffect(() => {
    if (stopCopy) {
      setTimeout(() => {
        setStopCopy(false);
      }, 2000);
    }
  }, [stopCopy]);

  useEffect(() => {
    if (stopCopyAll) {
      setTimeout(() => {
        setStopCopyAll(false);
      }, 2000);
    }
  }, [stopCopyAll]);

  useEffect(() => {
    if (stopCodesCopy) {
      setTimeout(() => {
        setStopCodesCopy(false);
      }, 2000);
    }
  }, [stopCodesCopy]);

  function CustomToggle({ children, eventKey }) {
    const decoratedOnClick = useAccordionButton(eventKey);

    return (
      <div
        className="text-dark"
        onClick={() => {
          decoratedOnClick();
          setToggle(!toggle);
        }}
      >
        <div className="row">
          <div
            className="tab-text d-flex justify-content-between text-white align-items-center"
            style={{ width: "95%" }}
          >
            {children}
          </div>
          <div className="w-5 d-flex px-0 align-items-center" style={{ width: "5%" }}>
            <img
              className={toggle ? "accordion-arrow-up" : "accordion-arrow-down"}
              src={chevronDown}
              width="12"
              height="12"
              alt="chevron-right"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <Modal
      className="add-group-modal edit-modal manage-access-codes-modal"
      size="lg"
      centered
      show={manageAccessCodeModal}
      onHide={manageAccessCodeModalClose}
    >
      <Modal.Header closeButton className="border-0">
        <h2 className="mb-0">
          <b>Manage Access Codes</b>
        </h2>
      </Modal.Header>
      <Modal.Body>
        <p className="mb-4 sub-head">
          Manage access codes across various unique tracking keywords for <b>{groupItem.groupName}</b>
        </p>

        <Accordion flush defaultActiveKey={0}>
          {Object.keys(accessCodes).length > 0 &&
            Object.keys(accessCodes).map((item, index) => {
              let used = 0;
              let unused = 0;
              accessCodes[item].forEach((i) => {
                if (i.isClaimed) used += 1;
                if (!i.isClaimed) unused += 1;
              });

              const unusedCodes = without(
                map(accessCodes[item], function (o) {
                  if (o.isClaimed == false) return o.code;
                }),
                undefined
              );

              return (
                <Card className="accordion-card mb-3">
                  <div className="container">
                    <Card.Header className="accordion-card-header p-2">
                      <CustomToggle eventKey={index}>
                        <span>{`Unique Tracking Keyword`}</span>
                        <span>{item}</span>
                      </CustomToggle>
                    </Card.Header>
                    <Accordion.Collapse eventKey={index}>
                      <Card.Body className="p-2">
                        <div style={{ width: "95%" }}>
                          <div className="d-flex justify-content-between number-access-codes">
                            <span>Number of Access Codes</span>
                            <span className="w-25 text-end">{accessCodes[item]?.length}</span>
                          </div>
                        </div>
                        <div className="d-flex align-items-center gap-2 justify-content-between">
                          <TabMenu
                            pillsTab={pillsTab}
                            all={accessCodes[item]?.length}
                            used={used}
                            unUsed={unused}
                            setPillsTab={setPillsTab}
                          />
                        </div>
                        <div className="dashed-border-box">
                          <div className="common-code-result">
                            <ul>
                              {accessCodes[item] &&
                                accessCodes[item].length > 0 &&
                                accessCodes[item]?.map((singleItem, index) => {
                                  return (
                                    pillsTab === "all" && (
                                      <li key={index}>
                                        {pillsTab === "all" && (
                                          <>
                                            <p>{singleItem?.code}</p>
                                            <div className={"custom-tooltip"}>
                                              <CopyIcon
                                                className="ms-2"
                                                width={16}
                                                onMouseEnter={() => setStopCopyAll(false)}
                                                onClick={() => {
                                                  setStopCopyAll(true);
                                                  copyTextToClipboard(singleItem?.code);
                                                }}
                                              />
                                              <span className={"tooltip-text custom-tooltip-top"}>
                                                {!stopCopyAll ? "Copy code" : "Code copied to the clipboard!"}
                                              </span>
                                            </div>
                                          </>
                                        )}
                                      </li>
                                    )
                                  );
                                })}
                            </ul>
                            <ul>
                              {accessCodes[item] &&
                                accessCodes[item].length > 0 &&
                                pillsTab === "used" &&
                                accessCodes[item]?.map(
                                  (singleItem, index) =>
                                    singleItem?.isClaimed === true && (
                                      <li key={index}>
                                        <>
                                          <p>{singleItem?.code}</p>
                                        </>
                                      </li>
                                    )
                                )}
                            </ul>
                            <ul>
                              {accessCodes[item] &&
                                accessCodes[item].length > 0 &&
                                pillsTab === "unused" &&
                                accessCodes[item]?.map((singleItem, index) => {
                                  return (
                                    singleItem?.isClaimed === false && (
                                      <li key={index}>
                                        <>
                                          <p>{singleItem?.code}</p>
                                          <div className={"custom-tooltip"}>
                                            <CopyIcon
                                              className="ms-2"
                                              width={16}
                                              onMouseEnter={() => setStopCodesCopy(false)}
                                              onClick={() => {
                                                setStopCodesCopy(true);
                                                copyTextToClipboard(singleItem?.code);
                                              }}
                                            />
                                            <span className={"tooltip-text custom-tooltip-top"}>
                                              {!stopCodesCopy ? "Copy code" : "Code copied to the clipboard!"}
                                            </span>
                                          </div>
                                        </>
                                      </li>
                                    )
                                  );
                                })}
                            </ul>
                          </div>
                        </div>
                        {pillsTab !== "used" && (
                          <div className="inside-div-cm col-lg-10 w-100 mx-auto d-block mb-4">
                            <div className="d-sm-flex align-items-center justify-content-end">
                              <div className="custom-tooltip">
                                <div
                                  className="cursor-pointer"
                                  onMouseEnter={() => setStopCopy(false)}
                                  onClick={() => {
                                    setStopCopy(true);
                                    copyTextToClipboard(map(unusedCodes).join(", "));
                                  }}
                                >
                                  COPY ALL
                                  <CopyIcon className="ms-2" />
                                </div>
                                <span className="tooltip-text custom-tooltip-top">
                                  {!stopCopy ? "Copy all codes" : "Codes copied to the clipboard!"}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </Card.Body>
                    </Accordion.Collapse>
                  </div>
                </Card>
              );
            })}
        </Accordion>
        {Object.keys(accessCodes).length === 0 && (
          <div className="no-access-code-section">
            <p>You haven’t generated any code yet</p>
            <div className="d-flex justify-content-center">
              <button
                onClick={() => {
                  manageAccessCodeModalClose();
                  issueAccessCodeModalShow();
                }}
                className="btn next-btn gen-btn m-0"
              >
                <span>Generate Now</span>
                <span className="d-flex">
                  <img src={ArrowRight} alt="Icon" />
                </span>
              </button>
            </div>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
};

const TabMenu = ({ pillsTab, all, used, unUsed, setPillsTab }) => (
  <div className="tabs-section my-2">
    <ul className="nav nav-pills align-items-center mx-0" id="pills-tab" role="tablist">
      <li className="nav-item" role="presentation">
        <button
          disabled={all === 0}
          onClick={() => setPillsTab("all")}
          className={`nav-link fs-6 ${pillsTab === "all" ? "active" : ""}`}
          id="pills-home-tab"
          data-bs-toggle="pill"
          data-bs-target="#pills-launched"
          type="button"
          role="tab"
        >
          {`All(${all})`}
        </button>
      </li>
      <li className="nav-item" role="presentation">
        <button
          disabled={used === 0}
          onClick={() => setPillsTab("used")}
          className={`nav-link fs-6 ${pillsTab === "used" ? "active" : ""}`}
          id="pills-profile-tab"
          data-bs-toggle="pill"
          data-bs-target="#pills-drafts"
          type="button"
          role="tab"
        >
          {`Used(${used})`}
        </button>
      </li>
      <li className="nav-item" role="presentation">
        <button
          disabled={unUsed === 0}
          onClick={() => setPillsTab("unused")}
          className={`nav-link fs-6 ${pillsTab === "unused" ? "active" : ""}`}
          id="pills-profile-tab"
          data-bs-toggle="pill"
          data-bs-target="#pills-drafts"
          type="button"
          role="tab"
        >
          {`Unused(${unUsed})`}
        </button>
      </li>
    </ul>
  </div>
);

export default ManageAccessCodeModal;
