import React, { useState } from "react";
import { Modal } from "react-bootstrap";
import { BiUpload } from "react-icons/bi";
import { toast } from "react-toastify";

import { ApiCall } from "../../../../utils/ApiUtils";

import ArrowRight from "../../../../assets/images/arrow.svg";

const BulkUpload = ({
  getNoOfReg,
  bulkUpload,
  bulkUploadModalClose,
  groupType,
  groupId,
  allowlistId,
  setState,
  getAddress,
  fetchData,
  getQAWinners,
}) => {
  const [csvFile, setCsvFile] = useState(undefined);
  const [showErr, setShowErr] = useState(false);

  const handleChange = (e) => {
    setShowErr(false);
    e.target.files[0].type === "text/csv" ? setCsvFile(e.target.files[0]) : setCsvFile(undefined);
    e.target.files[0].type !== "text/csv" && toast.error("Please upload a csv file.");
  };

  // Funtion to import CSV of the addresses.
  const importCSV = async () => {
    if (csvFile) {
      setShowErr(false);
      try {
        const formData = new FormData();
        formData.append("file", csvFile);
        let response;
        if (groupType === "qna") {
          // replace with qna bulk upload API
          response = await ApiCall("POST", `/rest/allowlist/${allowlistId}/${groupId}/QnA/addWinners/bulk`, formData);
          getQAWinners();
        } else {
          response = await ApiCall("POST", `/rest/allowlist/${allowlistId}/${groupId}/csvUpload`, formData);
          getAddress();
        }
        fetchData();
        getNoOfReg();
        setState(true);
        if (!response) {
          toast.error("Failed to load. Please try again later.");
        }
        if (response?.data?.inValid?.length > 0 || response?.data?.valid?.length <= 0) {
          toast.error("Some addresses exist already or are invalid.");
        }
        if (response?.responseType === "error") {
          toast.error(response?.message);
        }
        bulkUploadModalClose();
        setCsvFile();
      } catch (error) {
        console.log(error);
        toast.error("Please upload a CSV file.");
      }
    } else {
      setShowErr(true);
    }
  };

  return (
    bulkUpload && (
      <Modal
        className="edit-modal bulk-upload"
        size="lg"
        centered
        show={bulkUpload}
        onHide={() => {
          setShowErr(false);
          bulkUploadModalClose();
        }}
      >
        <Modal.Header closeButton className="border-0">
          <h4>Bulk Upload</h4>
        </Modal.Header>
        <Modal.Body>
          <div className={`form-group ${showErr ? "form-error dot" : ""}`}>
            <div className="box">
              <section className="outputName" style={{ color: "rgba(255, 255, 255, 0.8)", fontFamily: "KarlaBold" }}>
                {csvFile ? csvFile?.name : "Click here to bulk upload"}
              </section>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => {
                  handleChange(e);
                }}
                className="inputFile inputFile-1"
              />
              <BiUpload />
            </div>
            {showErr && (
              <div className="error-text mt-1">
                <span className="info">i</span>
                <span>Please choose a CSV file</span>
              </div>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer className="justify-content-end border-0">
          <button onClick={importCSV} className="btn next-btn m-0">
            Done
            <span className="d-flex">
              <img src={ArrowRight} alt="Icon" />
            </span>
          </button>
        </Modal.Footer>
      </Modal>
    )
  );
};

export default BulkUpload;
