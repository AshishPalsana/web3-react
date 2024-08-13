import React from "react";
import { Modal } from "react-bootstrap";

import ArrowRight from "../../../../assets/images/arrow.svg";

const AnnouncementConfirmation = ({ show, handleClose, groupItem, noOfRegCount, handleAnnounce }) => {
  return (
    <Modal className="pause delete-confirmation" centered show={show} onHide={handleClose}>
      <Modal.Header closeButton className="border-0">
        <Modal.Title>Announcement Confirmation</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {!groupItem.maxRegistrations || groupItem.maxRegistrations === noOfRegCount ? (
          <p>This will make an announcement in your Discord server. Would you like to proceed?</p>
        ) : (
          <p>
            The number of registrations received is currently below the maximum allowed registrations. Are you sure you
            want to proceed with the announcement?
          </p>
        )}
      </Modal.Body>
      <Modal.Footer className="justify-content-start border-0">
        <button
          onClick={() => {
            handleAnnounce(groupItem, false);
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

export default AnnouncementConfirmation;
