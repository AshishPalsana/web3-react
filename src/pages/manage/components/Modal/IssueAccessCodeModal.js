import { yupResolver } from "@hookform/resolvers/yup";
import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { FormProvider, useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { map } from "lodash";

import FormInput from "../../../../components/FormInput";
import { setLoader } from "../../../../store/reducer";
import { convertToSlug, copyTextToClipboard } from "../../../../utils/common";
import { ApiCall } from "../../../../utils/ApiUtils";
import { issueAccessCodeValidation } from "../../validationSchema";

import { ReactComponent as CopyIcon } from "../../../../assets/images/copy.svg";
import ArrowRight from "../../../../assets/images/arrow.svg";

const IssueAccessCodeModal = ({ issueAccessCodeModal, issueAccessCodeModalClose, item, groupItem }) => {
  const dispatch = useDispatch();
  const [showToast, setShowToast] = useState(true);
  const [stopCopy, setStopCopy] = useState(false);
  const [stopCopyAll, setStopCopyAll] = useState(false);
  const [stopCodesCopy, setStopCodesCopy] = useState(false);
  const [issuedCodes, setIssuedCodes] = useState([]);

  useEffect(() => {
    if (stopCopy) {
      setTimeout(() => {
        setStopCopy(false);
      }, 2000);
    }
  }, [stopCopy]);

  useEffect(() => {
    if (stopCopyAll) {
      setTimeout(() => {
        setStopCopyAll(false);
      }, 2000);
    }
  }, [stopCopyAll]);

  useEffect(() => {
    if (stopCodesCopy) {
      setTimeout(() => {
        setStopCodesCopy(false);
      }, 2000);
    }
  }, [stopCodesCopy]);

  const methods = useForm({
    resolver: yupResolver(issueAccessCodeValidation),
    defaultValues: {
      keyword: "",
      noOfCodes: null,
    },
    mode: "all",
  });

  const {
    handleSubmit,
    formState: { errors },
  } = methods;

  const onSubmit = async (data) => {
    try {
      dispatch(setLoader(true));
      ApiCall("POST", `/rest/allowlist/${item.id}/${groupItem.id}/issueAccessCodes`, {
        ...data,
      })
        .then((result) => {
          if (result.data && result.data.length > 0) {
            setIssuedCodes(result.data);
          }
          dispatch(setLoader(false));
          toast.success(`Code generated!`);
        })
        .catch((error) => {
          dispatch(setLoader(false));
          toast.error(error?.response?.data?.message || "The tracking keyword should be unique.");
          console.log(error);
        });
    } catch (error) {
      dispatch(setLoader(false));
      toast.error(error?.response?.data?.message || "Something went wrong.");
    }
  };

  const handleFormSubmit = async () => {
    if (showToast) {
      await handleSubmit(onSubmit)();
      setShowToast(false);
      setTimeout(() => {
        setShowToast(true);
      }, 3000);
    }

    // eslint-disable-next-line
    for (let [key, value] of Object.entries(methods.formState.errors)) {
      dispatch(setLoader(false));
      if (value?.type === "required") {
        if (showToast) {
          toast.error("Fields with a red dot are mandatory.");
          setShowToast(false);
          setTimeout(() => {
            setShowToast(true);
          }, 3000);
        }
        break;
      }
    }
  };

  return (
    <Modal
      className="add-group-modal edit-modal generate-access-codes-modal"
      size="lg"
      centered
      show={issueAccessCodeModal}
      onHide={issueAccessCodeModalClose}
    >
      <FormProvider {...methods}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleFormSubmit(false);
          }}
        >
          <Modal.Header closeButton className="border-0">
            <h2 className="mb-0">
              <b>Generate Access Codes</b>
            </h2>
          </Modal.Header>
          <Modal.Body>
            <p className="sub-text">{groupItem.groupName}</p>

            <div className="inside-div-cm col-lg-10 w-100 mx-auto d-block mb-5">
              <div className="row">
                <div className="col-lg-12">
                  <FormInput name={`noOfCodes`} type="text" placeholder={"Number of Access Codes"} />
                </div>
              </div>
              <div className="row">
                <div className="col-lg-12">
                  <FormInput name={`keyword`} type="text" placeholder={"Unique Tracking Keyword"} />
                </div>
              </div>

              <div className="d-sm-flex align-items-center justify-content-end">
                <div className="right-pre-div d-flex align-items-center justify-content-between">
                  <button disabled={!showToast} type="submit" className="btn generate-btn">
                    Generate
                    <span className="d-flex">
                      <img src={ArrowRight} alt="Icon" />
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {issuedCodes.length > 0 && (
              <>
                <div className="dashed-border-box">
                  <div className="common-code-result">
                    <ul>
                      {issuedCodes.map((item, index) => {
                        return (
                          <li key={index}>
                            <p>{item?.code}</p>
                            <div className={"custom-tooltip"}>
                              <CopyIcon
                                className="ms-2"
                                width={16}
                                onMouseEnter={() => setStopCopy(false)}
                                onClick={() => {
                                  setStopCopy(true);
                                  copyTextToClipboard(item?.code);
                                }}
                              />
                              <span className={"tooltip-text custom-tooltip-top"}>
                                {!stopCopy ? "Copy code" : "Code Copied Successfully!"}
                              </span>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>

                <div className="inside-div-cm col-lg-10 w-100 mx-auto d-block mb-4">
                  <div className="d-sm-flex align-items-center justify-content-end">
                    <div className={"custom-tooltip"}>
                      <div
                        className="cursor-pointer"
                        onMouseEnter={() => setStopCopyAll(false)}
                        onClick={() => {
                          setStopCopyAll(true);
                          copyTextToClipboard(map(issuedCodes, "code").join(", "));
                        }}
                      >
                        COPY ALL
                        <CopyIcon className="ms-2" />
                      </div>
                      <span className={"tooltip-text custom-tooltip-top"}>
                        {!stopCopyAll ? "Copy all codes" : "Access Codes Copied Successfully!"}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </Modal.Body>
        </form>
      </FormProvider>
    </Modal>
  );
};

export default IssueAccessCodeModal;
