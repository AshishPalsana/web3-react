import React from "react";
import { Modal } from "react-bootstrap";

import ArrowRight from "../../../../assets/images/arrow.svg";

const RePickConfirmation = ({ show, handleClose, handleRePick }) => {
  return (
    <Modal className="pause delete-confirmation" centered show={show} onHide={handleClose}>
      <Modal.Header closeButton className="border-0">
        <Modal.Title>Re-Pick Confirmation</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          Re-picking winners will require a manual announcement in your Discord Server. Are you sure you want to re-pick
          the winners?
        </p>
      </Modal.Body>
      <Modal.Footer className="justify-content-start border-0">
        <button
          onClick={() => {
            handleRePick();
            handleClose();
          }}
          className="btn next-btn m-0 re-pick-modal-button"
        >
          Re-pick
          <span className="d-flex">
            <img src={ArrowRight} alt="Icon" />
          </span>
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default RePickConfirmation;
