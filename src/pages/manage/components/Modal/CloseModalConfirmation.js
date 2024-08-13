import React from "react";
import { Modal } from "react-bootstrap";
import { IoIosClose } from "react-icons/io";

import ArrowRight from "../../../../assets/images/arrow.svg";

const CloseModalConfirmation = ({ show, handleClose, setAddGroupModal, setCloseModalConfirmation }) => {
  return (
    <Modal className="pause delete-confirmation" centered show={show}>
      <Modal.Header className="border-0 pb-0 justify-content-end">
        <button
          className="text-white p-0 btn"
          onClick={() => {
            setAddGroupModal(true);
            setCloseModalConfirmation(false);
          }}
        >
          <IoIosClose size="30px" />
        </button>
      </Modal.Header>
      <Modal.Body>
        <p>
          Are you sure you want to <span>close</span> this modal?
          <br /> All the unsaved changes will be lost.
        </p>
      </Modal.Body>
      <Modal.Footer className="justify-content-start border-0">
        <button
          onClick={() => {
            handleClose();
          }}
          className="btn next-btn m-0"
        >
          Confirm
          <span className="d-flex">
            <img src={ArrowRight} alt="Icon" />
          </span>
        </button>
        <button
          className="btn text-white"
          onClick={() => {
            setAddGroupModal(true);
            setCloseModalConfirmation(false);
          }}
        >
          Cancel
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default CloseModalConfirmation;
