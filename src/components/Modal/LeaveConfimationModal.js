import { Modal } from "react-bootstrap";
import { useDispatch } from "react-redux";

import { setCurrentFormStep } from "../../store/reducer";

import ArrowRight from "../../assets/images/arrow.svg";

const LeaveConfimationModal = ({ show, handleClose, handleConfirm, redirectPage }) => {
  const dispatch = useDispatch();

  return (
    <Modal className="delete-confirmation" centered show={show} onHide={handleClose}>
      <Modal.Header closeButton className="border-0 pb-0"></Modal.Header>
      <Modal.Body>
        <p style={{ maxWidth: "280px" }}>
          All unsaved changes will be lost. Are you sure you want to <span>leave</span> this page?
        </p>
      </Modal.Body>
      <Modal.Footer className="justify-content-start border-0">
        <button
          onClick={() => {
            handleConfirm(redirectPage);
            handleClose();
            dispatch(setCurrentFormStep(1));
          }}
          className="btn next-btn m-0"
        >
          Leave
          <span className="d-flex">
            <img src={ArrowRight} alt="Icon" />
          </span>
        </button>
        <button onClick={() => handleClose()} className="btn text-white">
          Cancel
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default LeaveConfimationModal;
