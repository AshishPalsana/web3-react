import React, { useState, useEffect } from "react";
import { Dropdown } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { FiEdit } from "react-icons/fi";
import { MdModeEdit } from "react-icons/md";
import { BsStopwatch } from "react-icons/bs";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { GiInfinity } from "react-icons/gi";
import moment from "moment";
import axios from "axios";

import AddAddress from "./Modal/AddAddress";
import AddEditGroup from "./Modal/AddEditGroup";
import { setLoader } from "../../../store/reducer";
import EditIconDesModal from "./Modal/EditIconDesModal";
import RePickConfirmation from "./Modal/PublishConfirmation";
import IssueAccessCodeModal from "./Modal/IssueAccessCodeModal";
import ManageAccessCodeModal from "./Modal/ManageAccessCodeModal";
import AnnouncementConfirmation from "./Modal/AnnouncementConfirmation";
import EditConfirmation from "./Modal/EditConfirmation";
import { ApiCall, ApiGetFile, API_ALLOWLIST_URL } from "../../../utils/ApiUtils";

import { ReactComponent as DropdownIcon } from "../../../assets/images/dropdownIcon.svg";

const LaunchedItem = (props) => {
  const dispatch = useDispatch();
  const { fetchData, groupItem, dataItem, noOfRegCount, getNoOfReg, index, isSearchFetch, isFound, activeGrp } = props;

  const isNextFetch = useSelector(({ isNextFetch }) => isNextFetch);
  const numberOfGroups = useSelector(({ noLimit }) => noLimit?.numberOfGroups);

  const [groupIcon, setGroupIcon] = useState("");
  const [editModal, setEditModal] = useState(false);
  const [stopToast, setStopToast] = useState(false);
  const [editIconDes, setEditIconDes] = useState(false);
  const [stopCopyAll, setStopCopyAll] = useState(false);
  const [addressModal, setAddressModal] = useState(false);
  const [iconDescription, setIconDescription] = useState("");
  const [manageAccessCodeModal, setManageAccessCodeModal] = useState(false);
  const [issueAccessCodeModal, setIssueAccessCodeModal] = useState(false);
  const [address, setAddress] = useState([]);
  const [show, setShow] = useState(false);
  const [addressData, setAddressData] = useState([]);
  const [qnaWinnersData, setQnaWinnersData] = useState([]);
  const [state, setState] = useState(false);
  const [defaultTab, setDefualtTab] = useState("");
  const [accessCodes, setAccessCodes] = useState([]);
  const [accessCodesLength, setAccessCodesLength] = useState("");
  const [isFetchedGetNoReg, setIsFetchedGetNoReg] = useState(false);
  const [annoucementModal, setAnnouncementModal] = useState(false);
  const [editConfirmationModal, setEditConfirmationModal] = useState(false);

  useEffect(() => {
    // useEffect block to fetch Q&A winners and group address when search or group is found
    if ((isSearchFetch || isFound) && groupItem.groupType === "qna") {
      getQAWinners();
      getAddress();
    }
  }, [isSearchFetch, isFound]);

  useEffect(() => {
    // useEffect block to fetch Q&A winners and group address when fetching next page and not fetched previously
    if (isNextFetch[dataItem.id] && !isFetchedGetNoReg) {
      if (groupItem.groupType === "qna") {
        getQAWinners(true);
        getAddress(true);
      }
    }
  }, [isNextFetch]);

  useEffect(() => {
    // useEffect block to handle stopping the toast notification after a delay
    if (stopToast) {
      setTimeout(() => {
        setStopToast(false);
      }, 4000);
    }
  }, [stopToast]);

  useEffect(() => {
    // useEffect block to handle stopping the copy all notification after a delay
    if (stopCopyAll) {
      setTimeout(() => {
        setStopCopyAll(false);
      }, 4000);
    }
  }, [stopCopyAll]);

  // Function to close the edit modal
  const editModalClose = () => setEditModal(false);

  // Function to show the edit modal
  const editModalShow = () => setEditModal(true);

  // Function to show the edit confirmation modal
  const editConfirmationModalShow = () => setEditConfirmationModal(true);

  // Function to close the manage access code modal
  const manageAccessCodeModalClose = () => setManageAccessCodeModal(false);

  const manageAccessCodeModalShow = () => {
    // Function to show the manage access code modal and fetch access codes
    setManageAccessCodeModal(true);
    dispatch(setLoader(true));
    ApiCall("GET", `/rest/allowlist/${dataItem.id}/${groupItem.id}/getAccessCodes`)
      .then((result) => {
        dispatch(setLoader(false));
        if (result && result.data) {
          setAccessCodes(result.data);
        }
      })
      .catch((error) => {
        dispatch(setLoader(false));
        console.log(error);
      });
  };

  // Function to close the issue access code modal
  const issueAccessCodeModalClose = () => setIssueAccessCodeModal(false);

  // Function to show the issue access code modal
  const issueAccessCodeModalShow = () => setIssueAccessCodeModal(true);

  const addressModalClose = () => {
    // Function to close the address modal and reset state
    setAddressModal(false);
    setState(false);
    setAddress([]);
  };

  const addressModalShow = (tab) => {
    // Check if there are registrants or winners
    if (noOfRegCount || qnaWinnersData.length > 0) {
      setState(true);
    }
    setDefualtTab(tab);
    setAddressModal(true);
    setAccessCodesLength(addressData?.length);
  };

  const downloadListRaffle = async (groupId, isWinner) => {
    // API call to download the raffle list
    try {
      dispatch(setLoader(true));
      const token = localStorage.getItem("token");
      const response = await axios({
        method: "GET",
        url: API_ALLOWLIST_URL + `/rest/allowlist/${dataItem.id}/${groupId}/${isWinner ? "getRaffle" : "getWallets"}`,
        responseType: "blob", // important
        headers: {
          Authorization: "Bearer " + token,
        },
      });
      const href = URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = href;
      link.setAttribute(
        "download",
        `${dataItem.projectName}-${groupItem.groupName}-${isWinner ? "winner" : "all"}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(href);
      dispatch(setLoader(false));
      fetchData();
    } catch (error) {
      console.log(error);
      dispatch(setLoader(false));
      toast.error(error?.response?.data?.message || "Something went wrong.");
    }
  };

  const downloadQnAResult = async (groupId, downloadType) => {
    // API call to download the QnA results
    try {
      dispatch(setLoader(true));
      const token = localStorage.getItem("token");
      const response = await axios({
        method: "GET",
        url:
          API_ALLOWLIST_URL +
          `/rest/allowlist/${dataItem.id}/${groupId}/getQnAResult${
            downloadType === "new" ? "/onlynew" : downloadType === "selected" ? "/selected" : ""
          }`,
        responseType: "blob", // important
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      const href = URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = href;
      link.setAttribute("download", `${dataItem.projectName}-${groupItem.groupName}-${downloadType}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(href);
      dispatch(setLoader(false));
      fetchData();
    } catch (error) {
      console.log(error);
      dispatch(setLoader(false));
      toast.error(error?.response?.data?.message || "Something went wrong.");
    }
  };

  const handleActive = async (groupId) => {
    // API call to toggle the group's active status
    try {
      dispatch(setLoader(true));
      const response = await ApiCall(
        "PATCH",
        `/rest/allowlist/groupConfig/${dataItem.id}/${groupId?.id}/toggleActive`,
        {
          status: !groupId?.isActive,
        }
      );
      dispatch(setLoader(false));
      toast.success(
        groupId.isActive ? groupId.groupName + " has been deactivated." : groupId.groupName + " has been activated."
      );
      fetchData();
    } catch (error) {
      console.log(error);
      dispatch(setLoader(false));
      toast.error(error?.response?.data?.message || "Something went wrong.");
    }
  };

  const getQAWinners = async (data) => {
    // API call to fetch Q&A winners
    try {
      !data && dispatch(setLoader(true));
      const response = await ApiCall("POST", `/rest/allowlist/${dataItem.id}/${groupItem?.id}/QnA/getWinners`);
      setQnaWinnersData(response?.data);
      !data && dispatch(setLoader(false));
      setIsFetchedGetNoReg(false);
    } catch (error) {
      !data && dispatch(setLoader(false));
      toast.error("Something went wrong.");
    }
  };

  const getAddress = async (data) => {
    // API call to fetch group address
    try {
      !data && dispatch(setLoader(true));
      const response = await ApiCall("GET", `/rest/allowlist-registrants/${groupItem?.id}`);
      !data && dispatch(setLoader(false));
      if (!response) {
        toast.error("Failed to load. Please try again later.");
      }
      setAddressData(response?.data);
    } catch (error) {
      !data && dispatch(setLoader(false));
      toast.error("Something went wrong.");
    }
  };

  useEffect(() => {
    // useEffect block to fetch group icon when the group item changes
    if (groupItem?.groupIcon) {
      getGroupIcon();
    }
  }, [groupItem]);

  const getGroupIcon = async () => {
    // API call to get the file
    const icon = await ApiGetFile(groupItem?.groupIcon);
    setGroupIcon(icon);
  };

  const handleAnnounce = async (item, isRePick = false) => {
    // API call to announce winners or post announcements
    try {
      dispatch(setLoader(true));
      await ApiCall(
        "POST",
        `/rest/allowlist/${dataItem.id}/${item.id}/${item.groupType === "raffle" ? "announceRaffle" : "announceFCFS"}`
      );
      fetchData();
      isRePick
        ? toast.success("Winners are re-picked. Please download the winners data.")
        : toast.success("Winners announcement posted!");
      dispatch(setLoader(false));
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong.");
      dispatch(setLoader(false));
    }
  };

  return (
    <li className="position-relative" style={{ zIndex: `${99 - index}` }}>
      <div className="group-details">
        {groupIcon?.path && (
          <div className="group-icon">
            <img src={groupIcon?.path} alt="group-icon" />
            <div className="group-icon-edit">
              <FiEdit
                size="22"
                onClick={() => {
                  setIconDescription("Icon");
                  setEditIconDes(!editIconDes);
                }}
              />
            </div>
          </div>
        )}
        <div className="group-details-content">
          <div className="d-flex align-items-center gap-3 mb-2">
            <h5 className="mb-0 group-content-title">{groupItem?.groupName}</h5>
          </div>
          {groupItem?.description && (
            <div className="group-content-description">
              <p>{groupItem?.description}</p>
              <MdModeEdit
                size={22}
                onClick={() => {
                  setIconDescription("Description");
                  setEditIconDes(!editIconDes);
                }}
              />
            </div>
          )}
        </div>
      </div>
      <div className="group-content" style={{ marginBottom: "1.3rem" }}>
        <div className="left-content">
          <div className="d-flex mt-md-3 mt-1 gap-2">
            <button className="btn-gradient btn-gradient-after" onClick={editModalShow}>
              {/* <button className="btn-gradient btn-gradient-after" onClick={editConfirmationModalShow}> */}
              Collab Settings
            </button>
            <button
              className="btn-gradient btn-gradient-after"
              onClick={() => addressModalShow(groupItem?.groupType === "qna" ? "selected_addreses" : "")}
            >
              Add/Manage Wallets
            </button>
            <div className="download-list-dropdown">
              <Dropdown>
                <Dropdown.Toggle className="btn-gradient btn-gradient-before btn-gradient-dropdown">
                  Access Codes
                  <DropdownIcon className="ms-2" />
                </Dropdown.Toggle>
                <Dropdown.Menu className="custom-dropdown-menu">
                  <Dropdown.Item className="custom-dropdown-item text-light" onClick={manageAccessCodeModalShow}>
                    Manage Access Codes
                  </Dropdown.Item>
                  <Dropdown.Item className="custom-dropdown-item text-light" onClick={issueAccessCodeModalShow}>
                    Generate Access Codes
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </div>
        </div>
        <div className={`d-flex align-items-end ${groupItem?.isActive ? "show-main-up-allowlist" : ""}`}>
          <button
            onClick={() => {
              if (groupItem?.isActive) {
                handleActive(groupItem);
              } else {
                if (numberOfGroups <= activeGrp.length) {
                  setStopToast(true);
                  !stopToast &&
                    toast.error(
                      "You have reached the maximum limit to launch collabs. Please deactivate or deschedule an existing collab in order to proceed."
                    );
                } else {
                  handleActive(groupItem);
                }
              }
            }}
            disabled={!dataItem?.isActive}
            className="btn tog-btn p-0 border-0"
          >
            {/* <div className="d-flex align-items-center active-in-toggle-btn">
              <span className="pb fs-16 karla-light">Active</span>
              <div className="toggle-bn group-toggle"></div>
              <span className="pr fs-16 hide-z-index karla-light"> Inactive </span>
            </div> */}
          </button>
        </div>
      </div>

      <div className="group-content-box">
        {groupItem.numberOfCodes > 0 && groupItem?.referralCodesRequired && (
          <div className="access-code-info justify-content-center">
            <AiOutlineInfoCircle />
            <p>
              Access codes are mandatory.
              {/* Generate the first set{" "}
              <button onClick={() => issueAccessCodeModalShow()}>here</button> so that registrations can begin. */}
            </p>
          </div>
        )}
        {groupItem?.isSchedule && moment(groupItem?.scheduleEndDate).diff(moment(), "seconds") >= 0 && (
          <div className="access-code-info justify-content-center">
            <BsStopwatch />
            <p>
              Scheduled from {moment(groupItem?.scheduleStartDate).format("Do MMM yyyy, h:mm a")} to{" "}
              {moment(groupItem?.scheduleEndDate).format("Do MMM yyyy, h:mm a")}
            </p>
          </div>
        )}
        <div className="group-content-box-data">
          <div className="left-content-box row-sm-12">
            <div className="column-center col-sm-5">
              <h1 className="mb-0 min-width">{noOfRegCount ? noOfRegCount : "0"}</h1>
              <p className="mb-0">Registrations</p>
            </div>
            <div className="column-center col-sm-6">
              {groupItem?.maxRegistrations ? (
                <h1
                  style={{ minWidth: "205px", fontSize: groupItem?.maxRegistrations?.toString().length > 6 && "28px" }}
                  className="mb-0"
                >
                  {groupItem?.maxRegistrations}
                </h1>
              ) : (
                <GiInfinity className="infinity" />
              )}
              <p className="mb-0" style={{ fontWeight: "250px" }}>
                Max Allowed Registrations
              </p>
            </div>
          </div>
          <div className="right-content-box">
            <h2
              className={`mb-0 ${groupItem?.groupType !== "qna" && `text-uppercase`} letter-spacing-2pt ${
                groupItem?.groupType === "first-come" ? "first-come-text" : ""
              }`}
            >
              {groupItem?.isPrivate
                ? groupItem?.groupType === "first-come"
                  ? "FIRST COME FIRST SERVE"
                  : groupItem?.groupType === "qna"
                  ? "QnA"
                  : groupItem?.groupType
                : "PUBLIC"}
            </h2>
            {!groupItem?.isPrivate && (
              <p className="mb-2" style={{ maxWidth: "200px" }}>
                All registrants will be on the final collab
              </p>
            )}
            {groupItem.groupType === "raffle" && (
              <p className="mb-2">
                {groupItem?.winners.length > 0
                  ? `${groupItem.winners.length} winners picked`
                  : `${groupItem.noOfWinners} ${groupItem.noOfWinners === 1 ? "winner" : "winners"} to be picked`}
              </p>
            )}
            {groupItem.groupType === "qna" && <p className="mb-2">{`${qnaWinnersData?.length} selections so far`} </p>}
            {groupItem.groupType !== "qna" ? (
              groupItem.isPrivate && groupItem?.groupType === "raffle" ? (
                <div className="d-flex align-items-center gap-1">
                  {groupItem?.winners?.length > 0 && noOfRegCount >= groupItem?.noOfWinners ? (
                    <button
                      className={`btn-gradient btn-gradient-after`}
                      onClick={() => {
                        groupItem.isPublish ? setShow(true) : setAnnouncementModal(true);
                        // groupItem.isPublish ? setShow(true) : repickRaffle(groupItem.id);
                      }}
                    >
                      Re-Pick
                    </button>
                  ) : (
                    <button
                      disabled={!noOfRegCount || noOfRegCount < groupItem?.noOfWinners}
                      className={`btn-gradient btn-gradient-after ${
                        !noOfRegCount || noOfRegCount < groupItem?.noOfWinners ? "disabled" : ""
                      }`}
                      onClick={() => {
                        setAnnouncementModal(true);
                        // repickRaffle(groupItem.id);
                      }}
                    >
                      Pick and Announce
                    </button>
                  )}
                  {show && (
                    <RePickConfirmation
                      show={show}
                      handleClose={() => setShow(false)}
                      handleRePick={() => handleAnnounce(groupItem, true)}
                    />
                  )}
                  {/* <button
                    disabled={groupItem.isPublish || groupItem?.winners?.length === 0}
                    className={`btn-gradient btn-gradient-after ${groupItem.isPublish || groupItem?.winners?.length === 0 ? "disabled" : ""
                      }`}
                    style={{ marginLeft: 5 }}
                    onClick={() => {
                      publishRaffle(groupItem.id);
                    }}
                  >
                    Publish
                  </button> */}
                  {noOfRegCount > 0 ? (
                    <div className="download-list-dropdown">
                      <Dropdown style={{ marginLeft: 5 }}>
                        <Dropdown.Toggle className="btn-gradient btn-gradient-before btn-gradient-dropdown">
                          Download
                          <DropdownIcon className="ms-2" />
                        </Dropdown.Toggle>
                        <Dropdown.Menu className="custom-dropdown-menu">
                          <Dropdown.Item
                            className="custom-dropdown-item text-light"
                            onClick={() => downloadListRaffle(groupItem.id, false)}
                          >
                            Full list
                          </Dropdown.Item>
                          {groupItem?.winners?.length > 0 ? (
                            <Dropdown.Item
                              className="custom-dropdown-item text-light"
                              onClick={() => downloadListRaffle(groupItem.id, true)}
                            >
                              Winner list
                            </Dropdown.Item>
                          ) : null}
                        </Dropdown.Menu>
                      </Dropdown>
                    </div>
                  ) : (
                    <button
                      style={{ marginLeft: 5 }}
                      disabled={true}
                      className={`btn-gradient btn-gradient-after disabled`}
                    >
                      Download
                    </button>
                  )}
                </div>
              ) : (
                <div className="d-flex align-items-center gap-1">
                  <div className="custom-tooltip" style={{ cursor: "pointer" }}>
                    <button
                      disabled={groupItem?.isPublish || noOfRegCount === undefined || noOfRegCount === 0}
                      className={`btn-gradient btn-gradient-after ${
                        groupItem?.groupType === "first-come" ? "mt-2" : ""
                      } ${groupItem?.isPublish || !noOfRegCount || !noOfRegCount > 0 ? "disabled" : ""}`}
                      onClick={() => setAnnouncementModal(true)}
                    >
                      Announce
                    </button>
                    {groupItem?.isPublish && (
                      <span className="tooltip-text custom-tooltip-bottom">Winners have been announced</span>
                    )}
                    {(noOfRegCount === undefined || noOfRegCount === 0) && (
                      <span className="tooltip-text custom-tooltip-bottom">Max registrations can't be 0</span>
                    )}
                  </div>
                  <button
                    disabled={noOfRegCount === undefined || noOfRegCount === 0}
                    className={`btn-gradient btn-gradient-after ${
                      groupItem?.groupType === "first-come" ? "mt-2" : ""
                    } ${noOfRegCount === undefined || noOfRegCount === 0 ? "disabled" : ""}`}
                    onClick={() => downloadListRaffle(groupItem.id, false)}
                  >
                    Download
                  </button>
                </div>
              )
            ) : (
              <>
                <div className="d-flex align-items-center gap-1">
                  {noOfRegCount > 0 ? (
                    <div className="download-list-dropdown">
                      <Dropdown>
                        <Dropdown.Toggle className="btn-gradient btn-gradient-before btn-gradient-dropdown">
                          Download
                          <DropdownIcon className="ms-2" />
                        </Dropdown.Toggle>
                        <Dropdown.Menu className="custom-dropdown-menu">
                          {/* <Dropdown.Item
                            className="custom-dropdown-item text-light"
                            onClick={() => downloadQnAResult(groupItem.id, "new")}
                          >
                            {`New Responses`}
                          </Dropdown.Item> */}
                          <Dropdown.Item
                            className="custom-dropdown-item text-light"
                            onClick={() => downloadQnAResult(groupItem.id, "all")}
                            disabled={addressData.length === 0}
                          >
                            {`All Responses (${addressData.length})`}
                          </Dropdown.Item>
                          <Dropdown.Item
                            className="custom-dropdown-item text-light"
                            onClick={() => downloadQnAResult(groupItem.id, "selected")}
                            disabled={qnaWinnersData.length === 0}
                          >
                            {`Selected (${qnaWinnersData?.length})`}
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </div>
                  ) : (
                    <button
                      style={{ marginLeft: 5 }}
                      disabled={true}
                      className={`btn-gradient btn-gradient-after disabled`}
                    >
                      Download
                    </button>
                  )}
                  <button
                    className="btn-gradient btn-gradient-after"
                    onClick={() => addressModalShow("selected_addreses")}
                  >
                    Selected Addresses
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      {addressModal && (
        <AddAddress
          addressModal={addressModal}
          addressModalClose={addressModalClose}
          onDoneClick={() => toast.success("List updated!")}
          groupItem={groupItem}
          item={dataItem}
          setState={setState}
          state={state}
          addressData={addressData}
          getAddress={getAddress}
          address={address}
          setAddress={setAddress}
          qnaWinnersData={qnaWinnersData}
          getQAWinners={getQAWinners}
          getNoOfReg={getNoOfReg}
          setAddressModal={setAddressModal}
          accessCodesLength={accessCodesLength}
          defaultTab={defaultTab}
          fetchData={fetchData}
        />
      )}
      {editModal && (
        <AddEditGroup
          activeGrp={activeGrp}
          editModal={editModal}
          editModalClose={editModalClose}
          groupItem={groupItem}
          dataItem={dataItem}
          fetchData={fetchData}
        />
      )}
      {manageAccessCodeModal && (
        <ManageAccessCodeModal
          manageAccessCodeModal={manageAccessCodeModal}
          manageAccessCodeModalClose={manageAccessCodeModalClose}
          groupItem={groupItem}
          accessCodes={accessCodes}
          issueAccessCodeModalShow={issueAccessCodeModalShow}
        />
      )}
      {issueAccessCodeModal && (
        <IssueAccessCodeModal
          issueAccessCodeModal={issueAccessCodeModal}
          issueAccessCodeModalClose={issueAccessCodeModalClose}
          groupItem={groupItem}
          item={dataItem}
        />
      )}
      {editIconDes && (
        <EditIconDesModal
          index={index}
          groupIcon={groupIcon}
          dataItem={dataItem}
          groupItem={groupItem}
          fetchData={fetchData}
          editIconDes={editIconDes}
          setEditIconDes={setEditIconDes}
          iconDescription={iconDescription}
          setIconDescription={setIconDescription}
        />
      )}
      {annoucementModal && (
        <AnnouncementConfirmation
          show={annoucementModal}
          handleClose={() => setAnnouncementModal(false)}
          groupItem={groupItem}
          noOfRegCount={noOfRegCount}
          handleAnnounce={handleAnnounce}
        />
      )}
      {/* {editConfirmationModal && (
        <EditConfirmation
          show={editConfirmationModal}
          handleClose={() => setEditConfirmationModal(false)}
          handleEdit={editModalShow}
        />
      )} */}
    </li>
  );
};

export default LaunchedItem;
