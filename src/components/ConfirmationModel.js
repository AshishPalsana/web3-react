import React from "react";
import { Modal } from "react-bootstrap";
import { IoIosClose } from "react-icons/io";

import ArrowRight from "../assets/images/arrow.svg";

const ConfirmationDialogContext = React.createContext({});

const ConfirmationDialogProvider = ({ children }) => {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogConfig, setDialogConfig] = React.useState({});

  const openDialog = ({ title, message, actionCallback }) => {
    setDialogOpen(true);
    setDialogConfig({ title, message, actionCallback });
  };

  const resetDialog = () => {
    setDialogOpen(false);
    setDialogConfig({});
  };

  const onConfirm = () => {
    resetDialog();
    dialogConfig.actionCallback(true);
  };

  const onDismiss = () => {
    resetDialog();
    dialogConfig.actionCallback(false);
  };

  return (
    <ConfirmationDialogContext.Provider value={{ openDialog }}>
      {dialogOpen && (
        <Modal show={dialogOpen} onHide={onDismiss} centered className={`pause delete-confirmation`} size="lg">
          <Modal.Header className="border-0 pb-0 justify-content-end">
            <button onClick={onDismiss} className="text-white p-0 btn">
              <IoIosClose size="30px" />
            </button>
          </Modal.Header>
          <Modal.Body>
            <label>{dialogConfig?.title}</label>
          </Modal.Body>

          <Modal.Footer className="justify-content-start border-0">
            <button onClick={onConfirm} className="btn next-btn m-0">
              Confirm
              <span className="d-flex">
                <img src={ArrowRight} alt="Icon" />
              </span>
            </button>
            <button onClick={onDismiss} className="btn text-white">
              Cancel
            </button>
          </Modal.Footer>
        </Modal>
      )}
      {children}
    </ConfirmationDialogContext.Provider>
  );
};

const useConfirmationDialog = () => {
  const { openDialog } = React.useContext(ConfirmationDialogContext);

  const getConfirmation = ({ ...options }) =>
    new Promise((res) => {
      openDialog({ actionCallback: res, ...options });
    });

  return { getConfirmation };
};

export { ConfirmationDialogProvider, useConfirmationDialog };
