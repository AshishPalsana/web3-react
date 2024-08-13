import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { BsX } from "react-icons/bs";
import { GrClose } from "react-icons/gr";
import { FaInfoCircle } from "react-icons/fa";
import { useDispatch } from "react-redux";
import CreatableSelect from "react-select/creatable";
import { components } from "react-select";
import { toast } from "react-toastify";
import { ethers } from "ethers";

import { ApiCall } from "../../../../utils/ApiUtils";
import { setLoader } from "../../../../store/reducer";
import { copyTextToClipboard, cutAddress } from "../../../../utils/common";
import BulkUpload from "./BulkUpload";
import { useConfirmationDialog } from "../../../../components/ConfirmationModel";

import ArrowRight from "../../../../assets/images/arrow.svg";
import RemovePurple from "../../../../assets/images/e-remove-purple.png";

const isMobileView = window?.innerWidth < 991;

const colorStyles = {
  multiValue: (styles, { data }) => ({
    ...styles,
    borderColor: data.isValid && `#ff0000 ${" "} !important`,
  }),
  multiValueLabel: (styles, { data }) => ({
    ...styles,
    color: data.isValid && `#ff0000 ${" "} !important`,
  }),
  multiValueRemove: (styles, { data }) => ({
    ...styles,
    color: data.isValid && `#ff0000 ${" "} !important`,
  }),
};

const AddAddress = ({
  addressModal,
  addressModalClose,
  onDoneClick,
  item,
  groupItem,
  state,
  setState,
  addressData,
  getAddress,
  address,
  setAddress,
  getNoOfReg,
  setAddressModal,
  defaultTab,
  fetchData,
  qnaWinnersData,
  getQAWinners,
  accessCodesLength,
}) => {
  const dispatch = useDispatch();
  const [searchAdd, setSearchAdd] = useState("");
  const [bulkUpload, setBulkUpload] = useState(false);
  const [pillsTab, setPillsTab] = useState("");
  const [stopCopy, setStopCopy] = useState(false);
  const { getConfirmation } = useConfirmationDialog();

  const { id: groupId, groupType, maxRegistrations } = groupItem;
  // Set the initial value for pillsTab
  useEffect(() => {
    setPillsTab(defaultTab);
  }, [defaultTab]);

  // Set a timeout to reset stopCopy after 2 seconds
  useEffect(() => {
    if (stopCopy) {
      setTimeout(() => {
        setStopCopy(false);
      }, 2000);
    }
  }, [stopCopy]);

  // Function to show the bulk upload modal
  const bulkUploadModalShow = () => setBulkUpload(true);

  // Function to close the bulk upload modal
  const bulkUploadModalClose = () => {
    setBulkUpload(false);
  };

  // Fetch the address and Q&A winners data
  useEffect(() => {
    getAddress();
    if (groupType === "qna") {
      getQAWinners();
    }
  }, []);

  // Function to add addresses or Q&A winners
  const addAddress = async (isQaWinners) => {
    try {
      dispatch(setLoader(true));
      const res = await ApiCall(
        "POST",
        isQaWinners ? `/rest/allowlist/${item.id}/${groupId}/QnA/addWinners` : `/rest/allowlist-registrants`,
        isQaWinners
          ? { wallets: address.map((item) => item.value) }
          : {
              allowlistRegistrants: {
                groupId: groupId,
                urlSlug: item.urlSlug,
                walletAddresses: address.map((item) => item.value),
              },
            }
      );
      dispatch(setLoader(false));
      if (res?.status === "ERROR") {
        if (res?.statusCode === 409) {
          const dd = isQaWinners
            ? address.map((item) => ({
                ...item,
                label: cutAddress(item.label),
                isValid: res?.data.find((item1) => item1?.walletAddress === item?.value) ? true : item.isValid,
              }))
            : address.map((item) => ({
                ...item,
                label: cutAddress(item.label),
                isValid: res?.data.find((item1) => item1 === item?.value) ? true : item.isValid,
              }));
          setAddress(dd);
          return;
        }
        return toast.error(res?.message || "Something went wrong.");
      }
      setState(true);
      getNoOfReg();
      setAddress([]);
      getAddress();
      fetchData();
      if (groupType === "qna") {
        getQAWinners();
      }
    } catch (error) {
      dispatch(setLoader(false));
      toast.error("The wallet addresses have already been used." || "Something went wrong.");
    }
  };

  // Function to handle clearing of addresses or Q&A winners
  const handleClear = async () => {
    try {
      if (groupType === "qna" && pillsTab === "selected_addreses") {
        removeQnAWinner(qnaWinnersData, true);
      } else {
        const confirmed = await getConfirmation({
          title: (
            <p>
              Are you sure you want to <span>delete</span> all addresses?
            </p>
          ),
        });

        if (confirmed) {
          dispatch(setLoader(true));
          await ApiCall("DELETE", `/rest/allowlist-registrants/${groupId}`);
          dispatch(setLoader(false));
          getNoOfReg();
          getAddress();
          fetchData();
        }
      }
    } catch (error) {
      dispatch(setLoader(false));
      toast.error("Something went wrong.");
    }
  };

  // Function to delete an address
  const deleteAddress = async (walletAddress) => {
    try {
      const confirmed = await getConfirmation({
        title: (
          <p>
            Are you sure you want to <span>delete</span> this wallet?
          </p>
        ),
      });
      if (confirmed) {
        dispatch(setLoader(true));
        const response = await ApiCall("DELETE", `/rest/allowlist-registrants/${groupId}/${walletAddress}`);
        dispatch(setLoader(false));

        if (!response) {
          toast.error("Failed to load. Please try again later.");
        } else {
          getNoOfReg();
          getAddress();
          if (groupType === "qna") {
            getQAWinners();
          }
          fetchData();
        }
      }
    } catch (error) {
      toast.error("Something went wrong.");
      dispatch(setLoader(false));
    }
  };

  // Function to remove a Q&A winner
  const removeQnAWinner = async (deleteWalletAddress, isAll) => {
    try {
      const confirmed = await getConfirmation({
        title: (
          <p>
            Are you sure you want to <span>delete</span> {`${isAll ? "all" : "this"}`} wallet?
          </p>
        ),
      });
      if (confirmed) {
        dispatch(setLoader(true));
        await ApiCall("POST", `/rest/allowlist/${item.id}/${groupId}/QnA/removeWinners`, {
          wallets: deleteWalletAddress,
        });
        dispatch(setLoader(false));

        getNoOfReg();
        getQAWinners();
      }
    } catch (error) {
      dispatch(setLoader(false));
      toast.error("Something went wrong.");
    }
  };

  // Filter the data based on the selected tab and search text
  const filterData =
    pillsTab === "selected_addreses"
      ? qnaWinnersData?.filter((item) => item?.search(searchAdd) >= 0)
      : addressData?.filter((item) => item?.walletAddress?.search(searchAdd) >= 0);

  // Check if there is an existing address
  const isAddressExits = address.find((item) => item.isValid);

  // Check if there are any existing addresses
  const isAddressExisting = address.filter((item) => item.isValid);

  // Filter the group address data
  const groupAddressData = filterData?.filter((item) => item.walletAddress === isAddressExits?.value);

  // Function to handle the change event for the addresses input
  const onChange = (val) => {
    let isInvalid = false;
    val.map((item) => {
      if (!ethers.utils.isAddress(item.value)) {
        toast.error("Invalid address.");
        isInvalid = true;
      }
    });
    if (!isInvalid) {
      const mappedVal = val.map((item) => ({
        ...item,
        label: cutAddress(item.label),
        isValid:
          groupType === "qna" && pillsTab === "selected_addreses"
            ? qnaWinnersData.includes(item?.value)
            : filterData.find((item1) => item1.walletAddress === item?.value),
      }));
      setAddress(mappedVal);
    }
  };

  return (
    <>
      {addressModal && (
        <Modal className="edit-modal add-address" size="lg" centered show={addressModal} onHide={addressModalClose}>
          <Modal.Header closeButton className="border-0 pb-3">
            <h4>{groupType === "qna" ? "Selected Addresses" : "Registrations"}</h4>
          </Modal.Header>
          <Modal.Body>
            {/* {groupType === "qna" && state && (
              <div className={`tab-pane fade active show`} id="pills-drafts" role="tabpanel">
                <div className="d-flex align-items-center gap-2 justify-content-between">
                  <TabMenu
                    pillsTab={pillsTab}
                    setPillsTab={setPillsTab}
                    groupType={groupType}
                    qnaWinnersData={qnaWinnersData}
                    maxRegistrations={maxRegistrations}
                  />
                </div>
              </div>
            )} */}

            {groupType === "qna" && qnaWinnersData.length === 0 && (
              <p className="sub-heading mb-2">{`You have not selected any addresses so far. Add them here.`}</p>
            )}
            {groupType !== "qna" && addressData.length === 0 && (
              <p className="sub-heading mb-2">{`You have no registrations so far. Add them manually here.`}</p>
            )}
            {!state ? (
              <div className="comon-input-div mt-4 mb-5">
                <div className="remove-option-box">
                  <div className="d-flex justify-content-between">
                    {/* <label>Add Address(es)</label> */}
                    {isMobileView && (
                      <label style={{ textDecoration: "underline" }} onClick={() => bulkUploadModalShow()}>
                        + bulk upload
                      </label>
                    )}
                  </div>
                  <CreatableSelect
                    isClearable={false}
                    isMulti
                    onChange={(val) => onChange(val)}
                    options={[]}
                    value={address}
                    classNamePrefix={`form-select-custom`}
                    placeholder={
                      <>
                        {isMobileView ? (
                          <p className="desktop-size bulk-upload-text">Paste addresses here</p>
                        ) : (
                          <p className="desktop-size bulk-upload-text">
                            Paste addresses here or{" "}
                            <button className="bulk-upload" onClick={() => bulkUploadModalShow()}>
                              bulk upload.
                            </button>
                          </p>
                        )}
                      </>
                    }
                    styles={colorStyles}
                    components={{
                      Input: (props) => (
                        <components.Input
                          {...props}
                          onPaste={(e) => {
                            const walletVal = e.clipboardData.getData("text").trim();
                            const isExit = address?.find((item) => item.value === walletVal);
                            if (isExit) {
                              toast.error(
                                "The wallet address has already been added. Please add a different wallet address."
                              );
                            } else {
                              onChange(
                                walletVal
                                  .split(",")
                                  .map((item) => ({ label: item, value: item }))
                                  .concat(address)
                              );
                            }
                          }}
                        />
                      ),
                    }}
                  />
                  {isAddressExits && (
                    <div className="d-flex align-items-center gap-2">
                      <FaInfoCircle color="#ff0000" />
                      <p>
                        {groupAddressData?.length > 0
                          ? "Wallets marked by red already exists."
                          : `The wallet ${
                              isAddressExisting?.length === 1 ? "address has" : "addresses have"
                            } already been used.`}
                      </p>
                    </div>
                  )}
                  {address.length > 0 && (
                    <>
                      <button
                        className="address-length"
                        onClick={() => (isAddressExits ? null : addAddress(groupType === "qna" ? true : false))}
                      >
                        Add {address.length} Address(es)
                      </button>
                      <span className="clear-address" onClick={() => setAddress([])}>
                        {/* <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="11"
                          height="23"
                          viewBox="0 0 11 23"
                          className="me-1"
                        >
                          <text
                            id="_"
                            data-name="•"
                            transform="translate(0 18)"
                            fill="#651fc0"
                            fontSize="18"
                            fontFamily="KarlaMedium, Karla"
                            fontWeight="500"
                          >
                            <tspan x="0" y="0">
                              •
                            </tspan>
                          </text>
                        </svg> */}
                        Clear
                      </span>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="search-address-result">
                <div className="search-field">
                  <div className="input-field">
                    <input
                      type="text"
                      placeholder="Search wallet address"
                      value={searchAdd}
                      onChange={(e) => setSearchAdd(e.target.value)}
                    />
                    <button className="remove-text-btn" onClick={() => setSearchAdd("")}>
                      <GrClose />
                    </button>
                  </div>

                  {/* {groupType === "qna" && pillsTab === "all_addresses" ? (
                    <div className="address-right">
                      <ul>
                        <li>{addressData.length} Addresses</li>
                      </ul>
                    </div>
                  ) : ( */}
                  <div className="address-right">
                    <ul>
                      <li>
                        {groupType === "qna" && pillsTab === "selected_addreses"
                          ? qnaWinnersData?.length
                          : addressData.length}{" "}
                        Addresses
                      </li>
                      <li>
                        {/* {(groupType !== "qna" || qnaWinnersData?.length < maxRegistrations) && ( */}
                        <button disabled={filterData?.length === 0} onClick={() => handleClear()}>
                          • Clear All
                        </button>
                        {/* )} */}
                      </li>
                    </ul>
                    {/* {(groupType !== "qna" || qnaWinnersData?.length < maxRegistrations) && ( */}
                    <button className="plus-address" onClick={() => setState(false)}>
                      + Add Address(es)
                    </button>
                    {/* )} */}
                  </div>
                  {/* )} */}
                </div>
                {searchAdd && (
                  <div className="search-result-area">
                    <p>{searchAdd && (filterData.length ? "Search Result" : "This address is not in the list!")}</p>
                    {searchAdd && (
                      <div className="searched-result">
                        <p>{searchAdd}</p>
                        <button onClick={() => setSearchAdd("")}>
                          <img src={RemovePurple} alt="remove" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
                <div className="common-search-result">
                  <ul>
                    {groupType === "qna" && pillsTab === "selected_addreses"
                      ? filterData?.map((item, index) =>
                          index === 14 ? (
                            <li key={index} className="border-0 p-0">
                              + {qnaWinnersData?.length - index} more
                            </li>
                          ) : (
                            index < 14 && (
                              <li key={index}>
                                <div className="custom-tooltip">
                                  <p
                                    onMouseEnter={() => setStopCopy(false)}
                                    onClick={() => {
                                      setStopCopy(true);
                                      copyTextToClipboard(item);
                                    }}
                                  >
                                    {cutAddress(item)}
                                  </p>

                                  <span className="tooltip-text custom-tooltip-top">
                                    {" "}
                                    {!stopCopy ? "Copy address" : "Wallet address copied"}
                                  </span>
                                </div>
                                <button onClick={() => removeQnAWinner([item])}>
                                  <BsX color="#fff" size={24} />
                                </button>
                              </li>
                            )
                          )
                        )
                      : filterData?.map((item, index) =>
                          index === 14 ? (
                            <li key={index} className="border-0 p-0">
                              + {addressData?.length - index} more
                            </li>
                          ) : (
                            index < 14 && (
                              <li key={index}>
                                <div className="custom-tooltip">
                                  <p
                                    onMouseEnter={() => setStopCopy(false)}
                                    onClick={() => {
                                      setStopCopy(true);
                                      copyTextToClipboard(item?.walletAddress);
                                    }}
                                  >
                                    {cutAddress(item?.walletAddress)}
                                  </p>
                                  <span className="tooltip-text custom-tooltip-top">
                                    {!stopCopy ? "Copy address" : "Wallet address copied"}
                                  </span>
                                </div>
                                <button
                                  onClick={() => {
                                    deleteAddress(item?.walletAddress);
                                  }}
                                >
                                  <BsX color="#fff" size={24} />
                                </button>
                              </li>
                            )
                          )
                        )}
                  </ul>
                </div>
              </div>
            )}
          </Modal.Body>
          {state && (
            <Modal.Footer className="justify-content-end border-0 pb-5">
              <button
                onClick={() => {
                  setState(false);
                  addressModalClose();
                  accessCodesLength !== filterData.length && onDoneClick();
                }}
                className="btn next-btn m-0"
              >
                Done
                <span className="d-flex">
                  <img src={ArrowRight} alt="Icon" />
                </span>
              </button>
            </Modal.Footer>
          )}
        </Modal>
      )}
      <BulkUpload
        getNoOfReg={getNoOfReg}
        bulkUpload={bulkUpload}
        bulkUploadModalClose={bulkUploadModalClose}
        allowlistId={item?.id}
        groupType={groupType}
        groupId={groupId}
        setState={setState}
        setAddressModal={setAddressModal}
        getAddress={getAddress}
        fetchData={fetchData}
        getQAWinners={getQAWinners}
      />
    </>
  );
};

const TabMenu = ({ pillsTab, setPillsTab, groupType, qnaWinnersData, maxRegistrations }) => (
  <div className="tabs-section my-2">
    <ul className="nav nav-pills align-items-center mx-0" id="pills-tab" role="tablist">
      {/* <li className="nav-item" role="presentation">
        <button
          onClick={() => setPillsTab("all_addresses")}
          className={`nav-link fs-5 ${pillsTab === "all_addresses" ? "active" : ""}`}
          id="pills-home-tab"
          data-bs-toggle="pill"
          data-bs-target="#pills-launched"
          type="button"
          role="tab"
        >
          All Addresses
        </button>
      </li> */}
      <li className="nav-item" role="presentation">
        <button
          onClick={() => setPillsTab("selected_addreses")}
          className={`nav-link fs-5 ${
            pillsTab === "selected_addreses" && (groupType !== "qna" || qnaWinnersData?.length < maxRegistrations)
              ? "active"
              : ""
          }`}
          id="pills-profile-tab"
          data-bs-toggle="pill"
          data-bs-target="#pills-drafts"
          type="button"
          role="tab"
        >
          Selected Addresses
        </button>
      </li>
    </ul>
  </div>
);

export default AddAddress;
