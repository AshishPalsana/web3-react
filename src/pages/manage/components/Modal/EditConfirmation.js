import React from "react";
import { Modal } from "react-bootstrap";

import ArrowRight from "../../../../assets/images/arrow.svg";

const EditConfirmation = ({ show, handleClose, handleEdit }) => {
  return (
    <Modal className="pause delete-confirmation" centered show={show} onHide={handleClose}>
      <Modal.Header closeButton className="border-0">
        <Modal.Title>Edit Confirmation</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          <span>Editing</span> this collab will make the ....
        </p>
      </Modal.Body>
      <Modal.Footer className="justify-content-start border-0">
        <button
          onClick={() => {
            handleEdit();
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

export default EditConfirmation;
