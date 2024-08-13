import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import LaunchedItem from "./LaunchedItem";
import PauseConfirmation from "./Modal/PauseConfirmation";
import AddEditGroup from "./Modal/AddEditGroup";
import EditConfirmation from "./Modal/EditConfirmation";
import { ConfirmationDialogProvider } from "../../../components/ConfirmationModel";
import { ApiCall } from "../../../utils/ApiUtils";
import { setIsEditUserId } from "../../../store/reducer";

import { ReactComponent as RedirectIcon } from "../../../assets/images/redirect-icon.svg";

const Launched = ({
  dataItem,
  handlePause,
  handleResume,
  fetchData,
  isSearchFetch,
  // isFound,
  index,
  activeAllowlistId,
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const isNextFetch = useSelector(({ isNextFetch }) => isNextFetch);
  const numberOfGroups = useSelector(({ noLimit }) => noLimit?.numberOfGroups);

  const [show, setShow] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [addGroupModal, setAddGroupModal] = useState(false);
  const [noOfReg, setNoOfReg] = useState([]);
  const [activeGrp, setActiveGrp] = useState([]);
  const [isFetchedGetNoReg, setIsFetchedGetNoReg] = useState(false);
  const [editConfirmationModal, setEditConfirmationModal] = useState(false);

  const getNoOfReg = () => {
    ApiCall("GET", `/rest/allowlist/${dataItem?.id}/getRegistrantsCount`)
      .then((result) => {
        setNoOfReg(result.data);
        setIsFetchedGetNoReg(true);
      })
      .catch((error) => {
        toast.error("Failed to get data.");
        console.log(error);
      });
  };

  useEffect(() => {
    if (showToast) {
      setTimeout(() => {
        setShowToast(false);
      }, 4000);
    }
  }, [showToast]);

  useEffect(() => {
    if (isSearchFetch || activeAllowlistId === dataItem.id) {
      getNoOfReg();
    }
  }, [isSearchFetch, activeAllowlistId]);

  useEffect(() => {
    if (isNextFetch[dataItem?.id] && !isFetchedGetNoReg) {
      getNoOfReg();
    }
  }, [isNextFetch]);

  const editProjectDetail = (id) => {
    dispatch(setIsEditUserId(id));
    navigate("/launch", { state: { index } });
  };

  useEffect(() => {
    const dd = dataItem?.allowlistGroup?.filter((item) =>
      item.isActive === true ? item.isActive === true : item.isSchedule === true
    );
    setActiveGrp(dd);
  }, [dataItem]);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <ConfirmationDialogProvider>
      <div className="allowlist-content-wrap">
        <div className="mb-md-4 mb-3">
          <div className="title-wrap">
            <div className="d-flex gap-3 align-items-baseline">
              <div
                style={{
                  color: !dataItem?.isActive ? "rgba(255, 255, 255, 0.3)" : "#fff",
                  maxWidth: dataItem?.isActive ? "630px" : "500px",
                }}
                className={`mb-0 custom-tooltip`}
              >
                <h1 className="mb-0">{dataItem?.projectName}</h1>
                <span className={`tooltip-text custom-tooltip-bottom`}>{dataItem?.projectName}</span>
              </div>
              {!dataItem?.isActive && (
                <h5
                  className="ms-3"
                  style={{ color: !dataItem?.isActive ? "rgba(255, 255, 255, 0.3)" : "#fff", margin: 0 }}
                >
                  Paused
                </h5>
              )}
            </div>
            <ul>
              <li>
                <button className="btn-gradient btn-gradient-after" onClick={() => editProjectDetail(dataItem?.id)}>
                  {/* <button className="btn-gradient btn-gradient-after" onClick={() => setEditConfirmationModal(true)}> */}
                  Edit Branding
                </button>
              </li>
              {dataItem?.isActive ? (
                <li>
                  <button className="btn-gradient btn-gradient-after" onClick={handleShow}>
                    Pause
                  </button>
                </li>
              ) : (
                <li>
                  <button
                    className="btn-gradient btn-gradient-after"
                    onClick={() => {
                      handleResume(dataItem?.id);
                    }}
                  >
                    Resume
                  </button>
                </li>
              )}
            </ul>
          </div>
          <div className="d-flex gap-2 mt-2">
            <p className="url-slug-text">
              {process.env.REACT_APP_REGISTER_REDIRECT_URL}/{dataItem?.urlSlug}
            </p>
            <div className="redirect-icon">
              <a
                href={`${window.location.protocol}//${process.env.REACT_APP_REGISTER_REDIRECT_URL}/${dataItem?.urlSlug}`}
                target="_blank"
              >
                <RedirectIcon height={14} width={14} />
              </a>
            </div>
          </div>
        </div>
        <hr />
        <div className="launched-main-content">
          <ul>
            {dataItem?.allowlistGroup.map((item, index) => (
              <LaunchedItem
                key={index}
                fetchData={fetchData}
                groupItem={item}
                dataItem={dataItem}
                index={index}
                getNoOfReg={getNoOfReg}
                noOfRegCount={noOfReg.find((item1) => item1._id === item.id)?.count}
                isSearchFetch={isSearchFetch}
                isFound={activeAllowlistId === dataItem.id}
                activeGrp={activeGrp}
              />
            ))}
          </ul>
        </div>
        {show && (
          <PauseConfirmation show={show} handleClose={handleClose} dataItem={dataItem} handlePause={handlePause} />
        )}
        {addGroupModal && (
          <AddEditGroup
            addGroupModal={addGroupModal}
            setAddGroupModal={setAddGroupModal}
            dataItem={dataItem}
            fetchData={fetchData}
          />
        )}
        {/* {editConfirmationModal && (
          <EditConfirmation
            show={editConfirmationModal}
            handleClose={() => setEditConfirmationModal(false)}
            handleEdit={() => editProjectDetail(dataItem?.id)}
          />
        )} */}
      </div>
    </ConfirmationDialogProvider>
  );
};

export default Launched;
