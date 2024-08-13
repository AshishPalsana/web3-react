import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { useFormContext } from "react-hook-form";
import moment from "moment";

import FormInput from "../../../components/FormInput";
import QuestionsArrayForm from "./QuestionsArrayForm";
import { ApiCall, ApiGetFile } from "../../../utils/ApiUtils";
import ScheduleConfirmation from "./Modal/ScheduleConfirmation";
import EditIconDesModal from "../../manage/components/Modal/EditIconDesModal";
import DiscordRoles from "./DiscordRoles";
import { QAinitialValue } from "./GroupsForm";

const GroupItem = ({
  addressError,
  setAddressError,
  setError,
  fields,
  isFromModel,
  editModal,
  groupItem,
  dataItem,
  fetchData,
  activeGrp,
  setAddressLoader,
}) => {
  const {
    control,
    formState: { errors },
    register,
    watch,
    setValue,
    clearErrors,
  } = useFormContext();
  const dispatch = useDispatch();

  const [groupIcon, setGroupIcon] = useState("");
  const [serveData, setServeData] = useState();
  const [stopToast, setStopToast] = useState(false);
  const [editIconDes, setEditIconDes] = useState(false);
  const [indexSchedule, setIndexSchedule] = useState("");
  const [iconDescription, setIconDescription] = useState("");
  const [changeSchedule, setChangeSchedule] = useState(false);
  const numberOfGroups = useSelector(({ noLimit }) => noLimit?.numberOfGroups);

  const groupList = watch("groupList");

  const getServerData = async () => {
    setServeData(dataItem.discord);
  };

  useEffect(() => {
    if (!serveData) {
      getServerData();
    }
  }, []);

  useEffect(() => {
    if (!editModal) {
      setValue(`groupList.${0}.scheduleStartDate`, moment().add(15, "minutes").toISOString());
      setValue(`groupList.${0}.scheduleEndDate`, moment().add(30, "minutes").toISOString());
    }
  }, []);

  useEffect(() => {
    if (stopToast) {
      setTimeout(() => {
        setStopToast(false);
      }, 4000);
    }
  }, [stopToast]);

  useEffect(() => {
    if (groupItem?.groupIcon) {
      getGroupIcon();
    }
  }, [groupItem]);

  const handleAddress = async (e) => {
    try {
      setAddressError(false);
      clearErrors(["address"]);
      if (!!e.target.value) {
        setAddressLoader(true);
        await ApiCall("GET", `/rest/contract-details/erc721/${e.target.value}`);
        setAddressLoader(false);
      }
    } catch (error) {
      setAddressLoader(false);
      setError(`groupList.${0}.address`, { type: "custom", message: "Invalid Address" });
      setAddressError(error?.response?.data?.data?.message);
    }
  };

  const getGroupIcon = async () => {
    const icon = await ApiGetFile(groupItem?.groupIcon);
    setGroupIcon(icon, editModal);
  };

  const ScheduleToggle = ({ item, index }) => (
    <div className="qc comon-input-div d-flex justify-content-between align-items-center mt-2">
      <h5>Schedule Collab</h5>
      <button
        className="btn tog-btn p-0 border-0"
        type="button"
        onClick={() => {
          if (item?.isSchedule === false && activeGrp?.length !== undefined) {
            if (numberOfGroups > activeGrp?.length) {
            } else {
              if (!groupItem?.isActive) {
                setStopToast(true);
                !stopToast &&
                  toast.error(
                    "You have reached the maximum limit to launch collabs. Please deactivate or deschedule an existing collab in order to proceed."
                  );
              }
            }
          }
        }}
      >
        <div className={`d-flex align-items-center ${item?.isSchedule ? "" : "show-main-up-allowlist"}`}>
          <span className="pb fs-16">Off</span>
          <div className="toggle-bn"></div>
          <span className="pr fs-16"> On </span>
        </div>
        <input
          style={{
            pointerEvents:
              groupList[index]?.isSchedule === false
                ? activeGrp?.length === undefined
                  ? "initial"
                  : numberOfGroups > activeGrp?.length
                  ? "initial"
                  : groupItem?.isActive
                  ? "initial"
                  : "none"
                : "initial",
          }}
          type="checkbox"
          {...register(`groupList.${index}.isSchedule`, {
            onChange: (e) => {
              if (!e.target.checked) {
                setChangeSchedule(true);
                setIndexSchedule(index);
              }
              if (e.target.checked) {
                setValue(`groupList.${0}.scheduleStartDate`, moment().toISOString());
                setValue(`groupList.${0}.scheduleEndDate`, moment().add(15, "minutes").toISOString());
                setTimeout(() => {
                  setInterval(() => {
                    setValue(`groupList.${0}.scheduleStartDate`, moment().toISOString());
                    setValue(`groupList.${0}.scheduleEndDate`, moment().add(15, "minutes").toISOString());
                  }, 60000);
                }, 60000 - (new Date().getTime() % 60000));
              }
            },
          })}
        />
      </button>
    </div>
  );

  return (
    <>
      {fields.map((it, index) => {
        const item = groupList[index];
        const err = errors?.groupList && errors?.groupList[index];

        return (
          <li key={it.id} className={isFromModel ? "modal-form w-100 inside-div-cm mb-0" : ""}>
            <div className="comon-opcity-div">
              {err && err?.message && (
                <p className="text-danger text-center fw-bold text-center mb-0">{err && err?.message}</p>
              )}
              {editModal && <h5 className="gen-modal-text mb-0">Collab Settings</h5>}
              <div className="show-main-register-allowlist">
                <div className="allow-register">
                  <div className="mt-2">
                    <FormInput
                      name={`groupList.${index}.groupName`}
                      type="text"
                      placeholder="Collab Title"
                      tooltipText={"Collab Title"}
                    />
                  </div>
                  {item?.isPrivate ? (
                    <>
                      <div className="comon-input-div mb-0">
                        <FormInput
                          name={`groupList.${index}.groupType`}
                          type="select"
                          disabled={editModal}
                          options={[
                            { label: "Raffle", value: "raffle" },
                            { label: "First Come First Serve", value: "first-come" },
                            { label: "QnA", value: "qna" },
                          ]}
                          onChange={(e) => {
                            setValue(`groupList.${index}.noOfWinners`, null);
                            if (!isFromModel && e.target.value === "qna") {
                              setValue(`groupList.${index}.questions`, [QAinitialValue]);
                            }
                          }}
                        />
                      </div>
                      <div className="row mb-2">
                        <div className={`${item?.groupType === "raffle" ? "col-lg-6" : "col-lg-12"}`}>
                          <FormInput
                            name={`groupList.${index}.maxRegistrations`}
                            type="text"
                            placeholder="Max Allowed Registrations"
                            tooltipText="Max Allowed Registrations"
                          />
                        </div>
                        {item?.groupType === "raffle" && (
                          <div className="col-lg-6">
                            <FormInput
                              name={`groupList.${index}.noOfWinners`}
                              type="text"
                              placeholder="# of Winners to be picked"
                              tooltipText="# of Winners to be picked"
                              onKeyDown={(evt) => {
                                if (evt.key === ".") {
                                  evt.preventDefault();
                                }
                              }}
                            />
                          </div>
                        )}
                      </div>
                      {item?.groupType === "qna" && (
                        <div className="mb-5">
                          <div className="comon-input-div mt-2 mb-0">
                            <h5 className="mb-0">Questionnaire</h5>
                            <label>
                              Use a set of questions to determine whether registrants are eligible to register for this
                              collab.
                            </label>
                          </div>
                          <QuestionsArrayForm editModal={editModal} namePrefix={`groupList.${index}.questions`} />
                        </div>
                      )}
                      <hr />
                      <div className="qualification-criteria">
                        <h2>Qualification Criteria</h2>
                      </div>
                      <DiscordRoles
                        groupItem={item}
                        editModal={editModal}
                        namePrefix={`groupList.${index}.discordServerRoles`}
                      />
                      <div className="qc comon-input-div mb-4">
                        <div className="d-flex align-items-center mb-2 gap-3">
                          <span className="red-num-box">2</span> <h5> Twitter Activity </h5>
                        </div>
                        {/* <div className="from-group remove-option-box">
                          <label> Must follow account(s) </label>
                          <div className="comon-multi sp-value">
                            <FormInput
                              control={control}
                              name={`groupList.${index}.twitterActivity`}
                              type="creatableSelect"
                              options={[]}
                              className="mb-0"
                            />
                          </div>
                        </div> */}
                        <div className="from-group remove-option-box mt-3">
                          <label> Like & RT tweet(s) </label>
                          <div className="comon-multi sp-value">
                            <FormInput
                              control={control}
                              name={`groupList.${index}.tweets`}
                              type="creatableSelect"
                              allowListId={dataItem?.id}
                              options={[]}
                              className="mb-0"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="qc comon-input-div mb-md-5 mb-sm-4 mb-3">
                        <div className="d-flex justify-content-between">
                          <div className="d-flex align-items-center mb-2 gap-3">
                            <span className="red-num-box">3</span> <h5> Wallet Balance</h5>
                          </div>
                          <button className="btn tog-btn p-0 border-0" type="button">
                            <div
                              className={`d-flex align-items-center ${
                                item?.isWalletBalance ? "" : "show-main-up-allowlist"
                              }`}
                            >
                              <span className="pb fs-16">Off</span>
                              <div className="toggle-bn"></div>
                              <span className="pr fs-16"> On </span>
                            </div>
                            <input
                              type="checkbox"
                              {...register(`groupList.${index}.isWalletBalance`, {
                                onChange: () => {
                                  setValue(`groupList.${index}.minBalance`, 0);
                                },
                              })}
                            />
                          </button>
                        </div>

                        {item.isWalletBalance && (
                          <div className="from-group">
                            <label> Must have at least </label>
                            <div className="inpy-div d-flex">
                              <FormInput
                                name={`groupList.${index}.minBalance`}
                                type="text"
                                className="mb-0 w-100"
                                inputClassName="w-100 text-field-height-60"
                                step={0.1}
                                onBlur={(e) => {
                                  if (e.target.value === "") {
                                    setValue(`groupList.${index}.minBalance`, 0, { shouldValidate: true });
                                  }
                                }}
                              />
                              <div className="slp">
                                <span className="form-select text-field-height-60">ETH</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="qc comon-input-div mb-2 generate-referral-codes token-gating position-relative">
                        <div className="d-flex justify-content-between">
                          <div className="d-flex align-items-center mb-2 gap-3">
                            <span className="red-num-box">4</span> <h5> Tokengating </h5>
                          </div>

                          <button className="btn tog-btn p-0 border-0" type="button">
                            <div
                              className={`d-flex align-items-center ${
                                item?.tokengating ? "" : "show-main-up-allowlist"
                              }`}
                            >
                              <span className="pb fs-16">Off</span>
                              <div className="toggle-bn"></div>
                              <span className="pr fs-16"> On </span>
                            </div>
                            <input
                              type="checkbox"
                              {...register(`groupList.${index}.tokengating`, {
                                onChange: () => {
                                  setAddressError(false);
                                  setValue(`groupList.${index}.address`, "");
                                  setValue(`groupList.${index}.minToken`, 0);
                                },
                              })}
                            />
                          </button>
                        </div>
                        {item.tokengating && (
                          <>
                            <div className="referral-from-group">
                              <div>
                                <div className="d-flex" style={{ gap: "10px" }}>
                                  <label style={{ minWidth: "fit-content" }}>Must have at least </label>
                                  <div
                                    className={`form-group form-error ${
                                      errors?.groupList?.[index]?.minToken ? "dot" : ""
                                    }`}
                                  >
                                    <input
                                      type="number"
                                      onWheelCapture={(e) => {
                                        e.target.blur();
                                      }}
                                      onKeyDown={(evt) => {
                                        if (evt.key === ".") {
                                          evt.preventDefault();
                                        }
                                      }}
                                      className="form-control"
                                      {...register(`groupList.${index}.minToken`)}
                                    />
                                  </div>
                                </div>
                                {errors?.groupList?.[index]?.minToken && (
                                  <div className="form-error">
                                    <div className="error-text mt-1">
                                      <span className="info">i</span>
                                      <span>{errors?.groupList?.[index]?.minToken?.message}</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                              <label style={{ minWidth: "fit-content" }}>tokens from</label>
                              <div
                                className={`form-group form-error w-300 ${
                                  errors?.groupList?.[index]?.address || addressError ? "dot" : ""
                                }`}
                              >
                                <input
                                  className="form-control"
                                  {...register(`groupList.${index}.address`, {
                                    onChange: (e) => handleAddress(e),
                                    // onBlur: (e) => handleAddress(e),
                                  })}
                                />
                                {errors?.groupList?.[index]?.address ? (
                                  <div className="error-text mt-1">
                                    <span className="info">i</span>
                                    <span>{errors?.groupList?.[index]?.address?.message}</span>
                                  </div>
                                ) : addressError ? (
                                  <div className="error-text mt-1">
                                    <span className="info">i</span>
                                    <span>Invalid Address</span>
                                  </div>
                                ) : null}
                              </div>
                              <label style={{ minWidth: "fit-content" }}>contract.</label>
                            </div>
                          </>
                        )}
                      </div>
                      <hr />
                      <div className="qc comon-input-div d-flex justify-content-between align-items-center mt-4">
                        <h5 className="mb-0">Referral Codes</h5>
                        <button className="btn tog-btn p-0 border-0" type="button">
                          <div
                            className={`d-flex align-items-center ${
                              !item?.referralCodeIsOn ? "" : "show-main-up-allowlist"
                            }`}
                          >
                            <span className="pb fs-16">Off</span>
                            <div className="toggle-bn"></div>
                            <span className="pr fs-16"> On </span>
                          </div>
                          <input
                            type="checkbox"
                            {...register(`groupList.${index}.referralCodeIsOn`, {
                              onChange: () => {
                                if (item?.referralCodeIsOn) {
                                  setValue(`groupList.${index}.numberOfCodes`, 0);
                                  setValue(`groupList.${index}.numberOfCodesOnSelection`, 0);
                                } else {
                                  setValue(`groupList.${index}.numberOfCodes`, 5);
                                  setValue(`groupList.${index}.numberOfCodesOnSelection`, 5);
                                }
                              },
                            })}
                          />
                        </button>
                      </div>
                      {!item?.referralCodeIsOn && (
                        <>
                          <div
                            className="generate-referral-codes mb-sm-4 mb-3"
                            style={{ opacity: item?.referralCodeIsOn ? "0.5" : "1" }}
                          >
                            <h6>On Registration</h6>
                            <div className="referral-from-group">
                              <label>Automatically generate </label>
                              <div className="form-group form-error ">
                                <input
                                  type="number"
                                  onWheelCapture={(e) => {
                                    e.target.blur();
                                  }}
                                  disabled={item?.referralCodeIsOn}
                                  {...register(`groupList.${index}.numberOfCodes`)}
                                  className="form-control"
                                  style={{ background: item?.referralCodeIsOn ? "#fff" : "" }}
                                />
                              </div>
                              <label>referral codes for registrants on successful registration.</label>
                            </div>
                            {errors?.groupList && errors?.groupList[index]?.numberOfCodes && (
                              <div className="form-group form-error ">
                                <div className="error-text mt-1">
                                  <span className="info">i</span>
                                  <span>{errors?.groupList[index]?.numberOfCodes?.message}</span>
                                </div>
                              </div>
                            )}
                          </div>

                          {item?.groupType === "qna" && (
                            <div
                              className="generate-referral-codes mb-sm-4 mb-3"
                              style={{ opacity: item?.referralCodeIsOn ? "0.5" : "1" }}
                            >
                              <h6>On Selection</h6>
                              <div className="referral-from-group">
                                <label>Automatically generate </label>
                                <div className="form-group form-error ">
                                  <input
                                    type="number"
                                    onWheelCapture={(e) => {
                                      e.target.blur();
                                    }}
                                    disabled={item?.referralCodeIsOn}
                                    {...register(`groupList.${index}.numberOfCodesOnSelection`)}
                                    className="form-control"
                                    style={{ background: item?.referralCodeIsOn ? "#fff" : "" }}
                                  />
                                </div>
                                <label>additional referral codes for registrants on selection.</label>
                              </div>
                              {errors?.groupList && errors?.groupList[index]?.numberOfCodesOnSelection && (
                                <div className="form-group form-error">
                                  <div className="error-text mt-1">
                                    <span className="info">i</span>
                                    <span>{errors?.groupList[index]?.numberOfCodesOnSelection?.message}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                          <div
                            className="referral-code-check d-flex align-items-center mb-sm-4 mb-3"
                            style={{ opacity: item?.referralCodeIsOn ? "0.5" : "1" }}
                          >
                            <FormInput
                              disabled={item?.referralCodeIsOn}
                              name={`groupList.${index}.referralCodesRequired`}
                              type="checkbox"
                            />
                            <label className="ms-2">Referral code required along with qualification criteria</label>
                          </div>
                        </>
                      )}

                      {/* <div className="comon-input-div mt-2">
                        <ScheduleToggle item={item} index={index} />
                        {item?.isSchedule && (
                          <div className="schedule-allowlist" style={{ opacity: !item?.isSchedule ? "0.5" : "1" }}>
                            <div>
                              <label>Starts</label>
                              <div>
                                <FormInput
                                  disabled={!item?.isSchedule}
                                  type="datepicker"
                                  name={`groupList.${index}.scheduleStartDate`}
                                  minDateTime={
                                    moment(item?.scheduleStartDate).isSame(moment(), "day")
                                      ? moment().toDate()
                                      : moment().startOf("day").toDate()
                                  }
                                  onChange={(e) => {
                                    setValue(
                                      `groupList.${index}.scheduleEndDate`,
                                      moment(e.target.value).add(15, "minutes").toISOString()
                                    );
                                  }}
                                />
                              </div>
                            </div>
                            <div>
                              <label>Ends</label>
                              <div>
                                <FormInput
                                  disabled={!item?.isSchedule}
                                  type="datepicker"
                                  name={`groupList.${index}.scheduleEndDate`}
                                  minDateTime={
                                    moment(item?.scheduleEndDate).isSame(moment(item?.scheduleStartDate), "day")
                                      ? moment(item?.scheduleStartDate).add(15, "minutes").toDate()
                                      : moment(item?.scheduleStartDate).startOf("day").toDate()
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div> */}
                    </>
                  ) : (
                    <>
                      <div className="qc comon-input-div mt-3">
                        <h5> Wallet Balance</h5>
                        <div className="from-group">
                          <label>Must have at least</label>
                          <div className="inpy-div d-flex">
                            <FormInput
                              name={`groupList.${index}.minBalance`}
                              type="text"
                              className="mb-0 w-100"
                              inputClassName="w-100 text-field-height-60"
                              step={0.1}
                              onBlur={(e) => {
                                if (e.target.value === "") {
                                  setValue(`groupList.${index}.minBalance`, 0, { shouldValidate: true });
                                }
                              }}
                            />
                            <div className="slp">
                              <span className="form-select text-field-height-60">ETH</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="comon-input-div d-flex justify-content-between align-items-center mt-3">
                        <h5 className="mb-0">Referral Codes</h5>
                        <button className="btn tog-btn p-0 border-0" type="button">
                          <div
                            className={`d-flex align-items-center ${
                              !item?.referralCodeIsOn ? "" : "show-main-up-allowlist"
                            }`}
                          >
                            <span className="pb fs-16">Off</span>
                            <div className="toggle-bn"></div>
                            <span className="pr fs-16"> On </span>
                          </div>
                          <input
                            type="checkbox"
                            {...register(`groupList.${index}.referralCodeIsOn`, {
                              onChange: () => {
                                if (item?.referralCodeIsOn) {
                                  setValue(`groupList.${index}.numberOfCodes`, 0);
                                  setValue(`groupList.${index}.numberOfCodesOnSelection`, 0);
                                } else {
                                  setValue(`groupList.${index}.numberOfCodes`, 5);
                                  setValue(`groupList.${index}.numberOfCodesOnSelection`, 5);
                                }
                              },
                            })}
                          />
                        </button>
                      </div>
                      {!item?.referralCodeIsOn && (
                        <>
                          <div
                            className="generate-referral-codes mb-sm-4 mb-3"
                            style={{ opacity: item?.referralCodeIsOn ? "0.5" : "1" }}
                          >
                            <h6>On Registration</h6>
                            <div className="referral-from-group">
                              <label>Automatically generate </label>
                              <div className="form-group form-error ">
                                <input
                                  type="number"
                                  onWheelCapture={(e) => {
                                    e.target.blur();
                                  }}
                                  disabled={item?.referralCodeIsOn}
                                  {...register(`groupList.${index}.numberOfCodes`)}
                                  className="form-control"
                                  style={{ background: item?.referralCodeIsOn ? "#fff" : "" }}
                                />
                              </div>
                              <label>referral codes for registrants on successful registration.</label>
                            </div>
                            {errors?.groupList && errors?.groupList[index]?.numberOfCodes && (
                              <div className="form-group form-error ">
                                <div className="error-text mt-1">
                                  <span className="info">i</span>
                                  <span>{errors?.groupList[index]?.numberOfCodes?.message}</span>
                                </div>
                              </div>
                            )}
                          </div>

                          <div
                            className="referral-code-check d-flex align-items-center mb-sm-3 mb-2"
                            style={{ opacity: item?.referralCodeIsOn ? "0.5" : "1" }}
                          >
                            <FormInput
                              disabled={item?.referralCodeIsOn}
                              name={`groupList.${index}.referralCodesRequired`}
                              type="checkbox"
                            />
                            <label className="ms-2">Referral code required along with qualification criteria</label>
                          </div>
                        </>
                      )}
                      {/* <div
                        className={`comon-input-div mt-2 mb-0 ${item?.groupType === "qna" ? "mb-md-5 mb-sm-4" : ""}`}
                      >
                        <ScheduleToggle item={item} index={index} />

                        {item?.isSchedule && (
                          <div className="schedule-allowlist" style={{ opacity: !item?.isSchedule ? "0.5" : "1" }}>
                            <div>
                              <label>Starts</label>
                              <div>
                                <FormInput
                                  disabled={!item?.isSchedule}
                                  type="datepicker"
                                  name={`groupList.${index}.scheduleStartDate`}
                                  minDateTime={
                                    moment(item?.scheduleStartDate).isSame(moment(), "day")
                                      ? moment().toDate()
                                      : moment().startOf("day").toDate()
                                  }
                                  onChange={(e) => {
                                    setValue(
                                      `groupList.${index}.scheduleEndDate`,
                                      moment(e.target.value).add(15, "minutes").toISOString()
                                    );
                                  }}
                                />
                              </div>
                            </div>
                            <div>
                              <label>Ends</label>
                              <div>
                                <FormInput
                                  disabled={!item?.isSchedule}
                                  type="datepicker"
                                  name={`groupList.${index}.scheduleEndDate`}
                                  minDateTime={
                                    moment(item?.scheduleEndDate).isSame(moment(item?.scheduleStartDate), "day")
                                      ? moment(item?.scheduleStartDate).add(15, "minutes").toDate()
                                      : moment(item?.scheduleStartDate).startOf("day").toDate()
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div> */}
                    </>
                  )}
                </div>
              </div>
            </div>
            {editIconDes && (
              <EditIconDesModal
                index={index}
                groupIcon={groupIcon}
                dataItem={dataItem}
                groupItem={groupItem}
                fetchData={fetchData}
                editIconDes={editIconDes}
                setEditIconDes={setEditIconDes}
                iconDescription={iconDescription}
                setIconDescription={setIconDescription}
              />
            )}
          </li>
        );
      })}
      {changeSchedule && (
        <ScheduleConfirmation
          changeSchedule={changeSchedule}
          setChangeSchedule={setChangeSchedule}
          setIndexSchedule={setIndexSchedule}
          indexSchedule={indexSchedule}
        />
      )}
    </>
  );
};

export default GroupItem;
