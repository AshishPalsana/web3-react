import React from "react";
import { Modal } from "react-bootstrap";

import ArrowRight from "../../../../assets/images/arrow.svg";

const PauseConfirmation = ({ show, handleClose, dataItem, handlePause }) => {
  return (
    <Modal className="pause delete-confirmation" centered show={show} onHide={handleClose}>
      <Modal.Header closeButton className="border-0">
        <Modal.Title>Pause Confirmation</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          Are you sure you want to pause registrations?
          {/* <span>Pausing</span> this collab will make the{" "}
          <span>
            {process.env.REACT_APP_REGISTER_REDIRECT_URL}/{dataItem?.urlSlug}{" "}
          </span>
          inaccessible. Are you sure you want to proceed? */}
        </p>
      </Modal.Body>
      <Modal.Footer className="justify-content-start border-0">
        <button
          onClick={() => {
            handlePause(dataItem?.id);
            handleClose();
          }}
          className="btn next-btn m-0"
        >
          Confirm
          <span className="d-flex">
            <img src={ArrowRight} alt="Icon" />
          </span>
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default PauseConfirmation;
