import React, { useEffect, useState } from "react";
import { BiPlus } from "react-icons/bi";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "react-toastify";
import { Modal } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import useFormPersist from "react-hook-form-persist";
import { useNavigate } from "react-router-dom";
import moment from "moment";

import GroupItem from "./GroupItem";
import { secondStepValidation } from "../validationSchema";
import { ApiCall, ApiGetFile } from "../../../utils/ApiUtils";
import { setCurrentFormStep, setLoader, setNoLimit, setSavedFirstStep, setSaveDraftData } from "../../../store/reducer";

import ArrowRight from "../../../assets/images/arrow.svg";

export const discordRoleVal = {
  guildId: "",
  roles: [],
};

export const QAinitialValue = {
  questionType: "mcq",
  responseType: "optional",
  question: "",
  textConditionType: "long-type",
  numericType: {
    value: 0,
    comparisonType: "GT",
  },
  mcqOptions: [
    { option: "", isCorrect: false },
    { option: "", isCorrect: false },
  ],
};

export const createRole = {
  guildId: "",
  access_token: "",
  roleData: {
    name: "",
    color: "",
    hoist: true,
    position: 0,
    mentionable: true,
    permissions: {},
    icon: {},
    reason: "",
  },
};

export const initialFormValues = {
  isPrivate: true,
  groupName: "Whitelist Spots",
  groupIcon: "",
  description: "",
  maxRegistrations: null,
  noOfWinners: null,
  discordServerRoles: [discordRoleVal],
  assignDiscordRoleOnSelection: {
    guildId: "",
    roleId: "",
    roleColor: "",
  },
  twitterActivity: [],
  tweets: [],
  minBalance: 0,
  numberOfCodes: 0,
  numberOfCodesOnSelection: 0,
  referralCodeIsOn: true,
  referralCodesRequired: false,
  isSchedule: false,
  tokengating: false,
  isWalletBalance: false,
  scheduleStartDate: moment().toISOString(),
  scheduleEndDate: moment().add(15, "minutes").toISOString(),
  assignDiscordRoleOnSelectionFlag: false,
  groupType: "raffle",
  questions: [QAinitialValue],
  minToken: 0,
  address: "",
};

const GroupsForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [delId, setDelId] = useState();
  const [show, setShow] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [addressError, setAddressError] = useState("");
  const [deployedData, setDeployedData] = useState([]);
  const [addressLoader, setAddressLoader] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const savedFirstStep = useSelector(({ savedFirstStep }) => savedFirstStep);
  const currentFormStep = useSelector(({ currentFormStep }) => currentFormStep);
  const numberOfAllowlist = useSelector(({ noLimit }) => noLimit?.numberOfAllowlist);

  useEffect(() => {
    if (showToast) {
      setTimeout(() => {
        setShowToast(false);
      }, 4000);
    }
  }, [showToast]);

  const methods = useForm({
    resolver: yupResolver(secondStepValidation),
    defaultValues: {
      groupList: [initialFormValues],
    },
    // mode: "all",
  });
  const {
    handleSubmit,
    formState: { errors },
    watch,
    control,
    setValue,
    reset,
    getValues,
    setError,
  } = methods;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "groupList",
  });

  useFormPersist("groupForm", {
    watch,
    setValue,
    storage: window.localStorage,
  });

  const getAndSetGroupsValues = async () => {
    ApiCall("GET", `/rest/allowlist/${savedFirstStep.id}`).then(async ({ data }) => {
      if (data.allowlistGroup.length > 0) {
        setValue(`groupList`, []);
        await Promise.all(
          data.allowlistGroup.map(async (item, i) => {
            setValue(`groupList.${i}.id`, item?.id);
            setValue(`groupList.${i}.groupName`, item?.groupName);
            if (item?.groupIcon) {
              const iconInfo = await ApiGetFile(item?.groupIcon);
              setValue(`groupList.${i}.groupIconName`, iconInfo?.originalFilename || "");
              setValue(`groupList.${i}.groupIcon`, item?.groupIcon);
            }
            setValue(`groupList.${i}.description`, item?.description);
            setValue(`groupList.${i}.groupType`, item?.groupType);
            setValue(`groupList.${i}.isPrivate`, item?.isPrivate);
            setValue(`groupList.${i}.maxRegistrations`, item?.maxRegistrations);
            setValue(`groupList.${i}.noOfWinners`, item?.noOfWinners);
            if (item?.discordServerRoles?.length > 0) {
              const selectedRole = item?.discordServerRoles?.map((item) => {
                return {
                  ...item,
                  roles: item?.roles?.map((val) => ({
                    label: val?.roleName,
                    value: val?.roleId,
                  })),
                };
              });
              setValue(`groupList.${i}.discordServerRoles`, selectedRole);
            }
            setValue(
              `groupList.${i}.twitterActivity`,
              item?.twitterActivity.map((it1) => ({ label: it1, value: it1 }))
            );
            setValue(
              `groupList.${i}.tweets`,
              item?.tweets.map((it1) => ({ label: it1?.tweetUrl, value: it1?.tweetUrl }))
            );
            setValue(`groupList.${i}.minBalance`, item?.minBalance);
            setValue(`groupList.${i}.minToken`, item?.token?.minToken || 0);
            setValue(`groupList.${i}.address`, item?.token?.address);
            setValue(`groupList.${i}.questions`, item?.questionnaire?.questions);
            setValue(`groupList.${i}.referralCodeIsOn`, item?.numberOfCodes > 0 ? false : true);
            setValue(`groupList.${i}.numberOfCodes`, item?.numberOfCodes);
            setValue(`groupList.${i}.numberOfCodesOnSelection`, item?.numberOfCodesOnSelection);
            setValue(`groupList.${i}.referralCodesRequired`, item?.referralCodesRequired);
            setValue(`groupList.${i}.scheduleStartDate`, item?.scheduleStartDate);
            setValue(`groupList.${i}.scheduleEndDate`, item?.scheduleEndDate);
            setValue(`groupList.${i}.isSchedule`, item?.isSchedule);
          })
        );
        reset(getValues());
      } else {
        // setValue(`groupList`, []);
        reset();
      }
    });
  };

  useEffect(() => {
    if (savedFirstStep) {
      getAndSetGroupsValues();
    }
  }, [savedFirstStep]);

  window.onpopstate = () => {
    if (window.location.pathname === "/launch" && currentFormStep === 2) {
      dispatch(setCurrentFormStep(1));
    }
  };

  const fetchData = async () => {
    try {
      dispatch(setLoader(true));
      const result = await ApiCall("GET", `/rest/allowlist`);
      const LimitsResult = await ApiCall("GET", `/rest/allowlist/getAllowListLimits`);
      dispatch(
        setNoLimit({
          numberOfGroups: LimitsResult?.data?.maxAllowListGroups,
          numberOfAllowlist: LimitsResult?.data?.maxAllowLists,
          allowListMaxDiscordRolesInServer: LimitsResult?.data?.allowListMaxDiscordRolesInServer,
          allowListMaxDiscordServers: LimitsResult?.data?.allowListMaxDiscordServers,
        })
      );
      const deployedDataRes = result?.data?.filter((item) => item?.status === "deployed");
      setDeployedData(deployedDataRes);
      dispatch(setLoader(false));
    } catch (error) {
      dispatch(setLoader(false));
      toast.error("Failed to load. Please try again later.");
      console.log(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onSubmit = async (data, isDraft) => {
    try {
      if (addressError) {
        return;
      }

      const payload = data?.groupList?.map((item) => {
        let item1 = {
          ...item,
          isActive: !item.isSchedule,
          minBalance: item?.minBalance,
          twitterActivity: item?.twitterActivity.map((item) => item?.label),
          tweets: item?.tweets.map((item) => ({
            author_id: item?.author_id,
            created_at: item?.created_at,
            tweetUrl: item?.value,
            tweetId: item?.value?.split("?")[0].split("/").pop(),
          })),
          maxRegistrations: item?.maxRegistrations || null,
          scheduleStartDate: moment(item?.scheduleStartDate).toDate().getTime(),
          scheduleEndDate: moment(item?.scheduleEndDate).toDate().getTime(),
          groupType: item?.isPrivate ? item?.groupType : "",

          ...(item?.isPrivate && {
            discordServerRoles: item?.discordServerRoles.map((items) => ({
              guildId: items.guildId,
              roles: items.roles.map((role) => ({
                roleId: role.value,
                roleName: role.label,
              })),
            })),
            assignDiscordRoleOnSelection: item?.assignDiscordRoleOnSelection
              ? item?.assignDiscordRoleOnSelection.guildId
                ? item?.assignDiscordRoleOnSelection
                : {}
              : {},
            ...(item?.address && {
              token: {
                address: item?.address,
                minToken: item?.minToken,
              },
            }),
            ...(item?.groupType === "qna" && {
              questionnaire: {
                questions: item?.questions,
              },
            }),
          }),
        };
        if (!item1.isPrivate) {
          delete item1["twitterActivity"];
          delete item1["token"];
          delete item1["tweets"];
          delete item1["questionnaire"];
          delete item1["assignDiscordRoleOnSelection"];
          delete item1["discordServerRoles"];
          delete item1["assignDiscordRoleOnSelectionFlag"];
          delete item1["questions"];
        }
        return item1;
      });

      dispatch(setLoader(true));
      await ApiCall("PUT", `/rest/allowlist/${isDraft ? "groupConfig" : "launch"}/${savedFirstStep.id}`, {
        groupConfig: payload,
      });
      dispatch(setLoader(false));

      toast.success(`${isDraft ? "Your progress has been saved as a draft!" : "Registration page launched!"}`);
      document.getElementById("root").scrollTo({ top: 0, behavior: "smooth" });

      if (isDraft) {
        getAndSetGroupsValues();
      } else {
        localStorage.removeItem("groupForm");
        localStorage.removeItem("basicForm");

        dispatch(setSaveDraftData(null));
        dispatch(setSavedFirstStep(null));
        dispatch(setCurrentFormStep(1));
        navigate("/manage");
      }
    } catch (error) {
      dispatch(setLoader(false));
      console.log(error);
      toast.error(error?.response?.data?.message || "Something went wrong.");
    }
  };

  const getRequiredError = (err) => {
    for (let [key, value] of Object.entries(Array.isArray(err) ? err[0] || {} : {})) {
      dispatch(setLoader(false));
      if (value?.type === "required") {
        setShowToast(true);
        if (!showToast) {
          toast.error("Fields with a red dot are mandatory.");
        }
        break;
      } else {
        if (Array.isArray(value)) {
          getRequiredError(value);
        }
      }
    }
  };

  const handleFormSubmit = async (isDraft) => {
    await handleSubmit(onSubmit)(isDraft);
    getRequiredError(methods.formState.errors?.groupList);
  };

  const handelRemoveGroup = async () => {
    try {
      remove(delId.index);
      if (delId?.groupId) {
        dispatch(setLoader(true));
        await ApiCall("DELETE", `/rest/allowlist/${savedFirstStep.id}/${delId.groupId}`);
        dispatch(setLoader(false));
      }
      handleClose();
    } catch (error) {
      dispatch(setLoader(false));
      console.log(error);
      toast.error(error?.response?.data?.message || "Something went wrong.");
    }
  };

  return (
    <>
      <div className="comon-all-body float-start w-100">
        <div className="comon-div">
          <FormProvider {...methods}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const resumeData = deployedData?.filter((item) => item?.isActive);
                if (numberOfAllowlist > resumeData?.length) {
                  handleFormSubmit(false);
                } else {
                  setShowToast(true);
                  !showToast &&
                    toast.error(
                      "You have reached the maximum limit to launch a collab. Please pause an existing collab to launch a new one."
                    );
                }
              }}
            >
              <div className="inside-div-cm top-allow-form col-lg-10 w-90 mb-0 mx-auto d-block">
                <h3> Configure Collabs </h3>
              </div>
              <div className="inside-div-cm col-lg-10 w-90 mx-auto d-block mb-3">
                <div className="clone-main-div">
                  <ul>
                    <GroupItem
                      dataItem={savedFirstStep}
                      addressError={addressError}
                      setAddressError={setAddressError}
                      setError={setError}
                      handleShow={(index, groupId) => {
                        setDelId({ index, groupId });
                        handleShow();
                      }}
                      fields={fields}
                      setAddressLoader={setAddressLoader}
                    />
                  </ul>
                </div>
              </div>
              <div className="inside-div-cm col-lg-10 w-90 mx-auto d-block">
                <div className="d-md-flex align-items-center justify-content-between">
                  <div className="next-div"></div>
                  <div className="right-pre-div d-flex align-items-center justify-content-between">
                    <button
                      type="button"
                      disabled={addressLoader}
                      onClick={() => handleFormSubmit(true)}
                      className="btn pre-btn border-0"
                    >
                      Save Draft
                    </button>
                    <button type="submit" disabled={addressLoader} className="btn next-btn">
                      Done
                      <span className="d-flex">
                        <img src={ArrowRight} alt="Icon" />
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </FormProvider>
        </div>
      </div>
      {show && (
        <Modal className="delete-confirmation" centered show={show} onHide={handleClose}>
          <Modal.Header closeButton className="border-0">
            <Modal.Title>Delete Confirmation</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              Are you sure you want to <span>delete</span> this collab?
            </p>
          </Modal.Body>
          <Modal.Footer className="justify-content-start border-0">
            <button onClick={handelRemoveGroup} className="btn next-btn m-0">
              Delete
              <span className="d-flex">
                <img src={ArrowRight} alt="Icon" />
              </span>
            </button>
          </Modal.Footer>
        </Modal>
      )}
    </>
  );
};
export default GroupsForm;
