import React from "react";
import { Modal } from "react-bootstrap";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { setLoader } from "../../../../store/reducer";
import { ApiCall } from "../../../../utils/ApiUtils";

import ArrowRight from "../../../../assets/images/arrow.svg";

const LaunchModal = ({ show, LaunchModalClose, launchData, fetchData }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const launchDraft = async () => {
    try {
      dispatch(setLoader(true));
      launchData.allowlistGroup[0].isActive = !launchData.allowlistGroup[0].isSchedule;
      await ApiCall("PUT", `/rest/allowlist/launch/${launchData.id}`, {
        groupConfig: launchData.allowlistGroup,
      });

      dispatch(setLoader(false));
      toast.success(`Registration page launched!`);
      LaunchModalClose();
      fetchData();
      navigate("/manage");
    } catch (error) {
      dispatch(setLoader(false));
      console.log(error);
      toast.error(error?.response?.data?.message || "Something went wrong.");
    }
  };

  return (
    <Modal className="delete-confirmation" centered show={show} onHide={LaunchModalClose}>
      <Modal.Header closeButton className="border-0">
        <h4>Launch Confirmation</h4>
      </Modal.Header>
      <Modal.Body>
        <p>
          Are you sure you want to <span>Launch</span> this collab?
        </p>
      </Modal.Body>
      <Modal.Footer className="justify-content-start border-0">
        <button onClick={launchDraft} className="btn next-btn m-0">
          Launch
          <span className="d-flex">
            <img src={ArrowRight} alt="Icon" />
          </span>
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default LaunchModal;
