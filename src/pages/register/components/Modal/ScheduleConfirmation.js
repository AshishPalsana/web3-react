import React from "react";
import { Modal } from "react-bootstrap";
import { useFormContext } from "react-hook-form";

import ArrowRight from "../../../../assets/images/arrow.svg";

const ScheduleConfirmation = ({ changeSchedule, setChangeSchedule, setIndexSchedule, indexSchedule }) => {
  const { setValue } = useFormContext();
  return (
    <Modal
      className="pause schedule-confirmation delete-confirmation"
      style={{ zIndex: 1099 }}
      centered
      show={changeSchedule}
      onHide={() => {
        setChangeSchedule(false);
        setIndexSchedule("");
        setValue(`groupList.${indexSchedule}.isSchedule`, true);
      }}
    >
      <Modal.Header closeButton className="border-0 pb-0"></Modal.Header>
      <Modal.Body className="pt-0">
        <p>
          The scheduled date & time will no longer be valid. Are you sure you want to <span>change</span> the collab
          status? <br />
        </p>
      </Modal.Body>
      <Modal.Footer className="justify-content-start border-0">
        <div className="schedule-btn position-relative m-0">
          <button
            onClick={() => {
              setChangeSchedule(false);
              setIndexSchedule("");
            }}
            className="btn next-btn m-0"
          >
            Confirm
            <span className="d-flex">
              <img src={ArrowRight} alt="Icon" />
            </span>
          </button>
        </div>
        <button
          onClick={() => {
            setChangeSchedule(false);
            setIndexSchedule("");
            setValue(`groupList.${indexSchedule}.isSchedule`, true);
          }}
          className="btn text-white ms-2 m-0"
        >
          Cancel
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default ScheduleConfirmation;
