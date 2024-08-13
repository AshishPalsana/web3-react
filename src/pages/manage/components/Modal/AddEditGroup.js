import { yupResolver } from "@hookform/resolvers/yup";
import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import moment from "moment";

import { checkUniqueCriteria, secondStepValidation } from "../../../register/validationSchema";
import { setLoader } from "../../../../store/reducer";
import { ApiCall, ApiGetFile, getlikeRTTweet } from "../../../../utils/ApiUtils";
import CloseModalConfirmation from "./CloseModalConfirmation";
import { initialFormValues } from "../../../register/components/GroupsForm";
import GroupItem from "../../../register/components/GroupItem";

import ArrowRight from "../../../../assets/images/arrow.svg";

const AddEditGroup = ({
  addGroupModal,
  dataItem,
  fetchData,
  setAddGroupModal,
  editModal,
  editModalClose,
  groupItem,
  activeGrp,
}) => {
  const dispatch = useDispatch();
  const [showToast, setShowToast] = useState(true);
  const [addressError, setAddressError] = useState("");
  const [closeModalConfirmation, setCloseModalConfirmation] = useState(false);
  const [addressLoader, setAddressLoader] = useState(false);

  const methods = useForm({
    resolver: yupResolver(secondStepValidation),
    defaultValues: {
      groupList: [initialFormValues],
    },
    // mode: "all",
  });

  const {
    handleSubmit,
    setValue,
    control,
    getValues,
    reset,
    setError,
    formState: { touchedFields },
  } = methods;
  const { fields } = useFieldArray({
    control,
    name: "groupList",
  });

  // Handle the edit modal by setting a timeout to call handleEdit after 100 milliseconds
  useEffect(() => {
    const timer = setTimeout(() => {
      handleEdit();
    }, 100);

    return () => clearTimeout(timer);
  }, [groupItem, editModal]);

  // Function to handle the editing of group data
  const handleEdit = async () => {
    if (groupItem && editModal) {
      Object.keys(groupItem).map(async (item) => {
        if (item === "twitterActivity") {
          const twitterActivityObjects = groupItem[item].map((val) => {
            if (typeof val == "object") {
              return val;
            }
            return { label: val, value: val };
          });
          setValue(`groupList.${0}.twitterActivity`, twitterActivityObjects);
          return;
        }
        if (item === "tweets") {
          const likeRTTweetObjects = groupItem[item].map((val) => ({
            label: getlikeRTTweet(val?.tweetUrl),
            value: val?.tweetUrl,
          }));
          setValue(`groupList.${0}.tweets`, likeRTTweetObjects);
          return;
        }
        if (item === "discordServerRoles") {
          const selectedRole = groupItem[item]?.map((item) => {
            return {
              ...item,
              roles: item?.roles?.map((val) => ({
                label: val?.roleName,
                value: val?.roleId,
              })),
            };
          });
          setValue(`groupList.${0}.discordServerRoles`, selectedRole);
          return;
        }
        if (item in initialFormValues) {
          setValue(`groupList.${0}.${item}`, groupItem[item]);
        }
      });
      const iconInfo = await ApiGetFile(groupItem?.groupIcon);
      setValue(`groupList.${0}.groupIconName`, iconInfo?.originalFilename || "");
      setValue(`groupList.${0}.groupIcon`, groupItem?.groupIcon);
      setValue(`groupList.${0}.questions`, groupItem?.questionnaire?.questions);
      setValue(`groupList.${0}.referralCodeIsOn`, groupItem?.numberOfCodes > 0 ? false : true);
      setValue(`groupList.${0}.minToken`, groupItem?.token?.minToken || 0);
      setValue(`groupList.${0}.address`, groupItem?.token?.address);
    }
  };

  // Function to handle closing of the add group modal
  const handleAddGroupClose = () => {
    const allVal = getValues();
    if (
      allVal?.groupList[0]?.groupName === "" &&
      allVal?.groupList[0]?.groupIcon === "" &&
      allVal?.groupList[0]?.description === "" &&
      allVal?.groupList[0]?.minBalance === 0 &&
      allVal?.groupList[0]?.maxRegistrations === null &&
      allVal?.groupList[0]?.noOfWinners === null &&
      allVal?.groupList[0]?.twitterActivity.length === 0 &&
      allVal?.groupList[0]?.tweets.length === 0
    ) {
      setAddGroupModal(false);
    } else {
      setAddGroupModal(false);
      setCloseModalConfirmation(true);
    }
  };

  // Function to handle closing of the confirmation modal
  const handleClose = () => {
    reset();
    setCloseModalConfirmation(false);
  };

  // Function to handle form submission
  const onSubmit = async (formData) => {
    try {
      let data = formData.groupList[0];
      const compareOldGroups = editModal
        ? dataItem.allowlistGroup.filter((item) => item.id !== groupItem.id)
        : dataItem.allowlistGroup;
      const errorMsg = checkUniqueCriteria(compareOldGroups, data);
      if (errorMsg) {
        if (showToast) {
          toast.error(errorMsg);
          setShowToast(false);
          setTimeout(() => {
            setShowToast(true);
          }, 3000);
        }
        return;
      }

      if (addressError) {
        return;
      }

      data = {
        ...data,
        minBalance: data.minBalance,
        groupIcon: data.groupIcon,
        groupType: data.isPrivate ? data.groupType : "",
        maxRegistrations: data.maxRegistrations ? data.maxRegistrations : null,
        scheduleStartDate: moment(data.scheduleStartDate).toDate().getTime(),
        scheduleEndDate: moment(data.scheduleEndDate).toDate().getTime(),
        referralCodesRequired: data.referralCodeIsOn ? false : data.referralCodesRequired,
        twitterActivity: data.twitterActivity.map((item) => item.label),
        tweets: data.tweets.map((item) => ({
          author_id: item.author_id,
          created_at: item.created_at,
          tweetUrl: item.value,
          tweetId: item.value?.split("?")[0].split("/").pop(),
        })),

        ...(data.isPrivate && {
          discordServerRoles: data.discordServerRoles.map((item) => ({
            guildId: item.guildId,
            roles: item.roles.map((role) => ({
              roleId: role.value,
              roleName: role.label,
            })),
          })),
          assignDiscordRoleOnSelection: data.assignDiscordRoleOnSelection
            ? data.assignDiscordRoleOnSelection.guildId
              ? data.assignDiscordRoleOnSelection
              : {}
            : {},
          ...(data.address && {
            token: {
              address: data.address,
              minToken: data.minToken,
            },
          }),
          ...(data.groupType === "qna" && {
            questionnaire: {
              questions: data.questions,
            },
          }),
        }),
      };

      if (!data.isPrivate) {
        delete data["twitterActivity"];
        delete data["token"];
        delete data["tweets"];
        delete data["questionnaire"];
        delete data["assignDiscordRoleOnSelection"];
        delete data["discordServerRoles"];
        delete data["assignDiscordRoleOnSelectionFlag"];
        delete data["questions"];
      }

      dispatch(setLoader(true));
      if (editModal) {
        await ApiCall("PUT", `/rest/allowlist/${dataItem.id}/${groupItem?.id}/edit`, { groupConfig: data });
        editModalClose();
      } else {
        if (!data.noOfWinners) delete data["noOfWinners"];
        await ApiCall("POST", `/rest/allowlist/addGroup/${dataItem?.id}`, {
          groupConfig: {
            ...data,
            isActive: false,
          },
        });
        setAddGroupModal(false);
      }
      dispatch(setLoader(false));

      fetchData();
      reset();
      toast.success(editModal ? Object.keys(touchedFields).length > 0 && "Changes saved!" : "New collab added!");
    } catch (error) {
      dispatch(setLoader(false));
      console.log(error);
      toast.error(error?.response?.data?.message || "Something went wrong.");
    }
  };

  // Function to get the required error in form validation
  const getRequiredError = (err) => {
    for (let [key, value] of Object.entries(Array.isArray(err) ? err[0] || {} : {})) {
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
      } else {
        if (Array.isArray(value)) {
          getRequiredError(value);
        }
      }
    }
  };

  // Function to handle form submission and display required error messages
  const handleFormSubmit = async () => {
    await handleSubmit(onSubmit)();
    getRequiredError(methods.formState.errors?.groupList);
  };

  return (
    <>
      <Modal
        className="add-group-modal edit-modal add-edit-modal"
        size="lg"
        centered
        show={editModal ? editModal : addGroupModal}
        onHide={editModal ? editModalClose : handleAddGroupClose}
      >
        <FormProvider {...methods}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleFormSubmit();
            }}
            onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
          >
            {!editModal && (
              <Modal.Header closeButton className="border-0">
                <h2 className="mb-0">
                  <b>Add New Collab</b>
                </h2>
              </Modal.Header>
            )}
            {editModal && <Modal.Header closeButton className="border-0 pb-0 edit-modal-header"></Modal.Header>}
            <Modal.Body>
              {!editModal && (
                <p className="sub-text">
                  Configure the criteria that a user must meet in order to submit their address for this allowlist.
                </p>
              )}
              <GroupItem
                addressError={addressError}
                setAddressError={setAddressError}
                setError={setError}
                editModal={editModal}
                groupItem={groupItem}
                dataItem={dataItem}
                fetchData={fetchData}
                fields={fields}
                isFromModel={true}
                activeGrp={activeGrp}
                setAddressLoader={setAddressLoader}
              />
            </Modal.Body>
            <Modal.Footer className="justify-content-end border-0">
              <button disabled={!showToast || addressLoader} type="submit" className="btn next-btn m-0">
                Done
                <span className="d-flex">
                  <img src={ArrowRight} alt="Icon" />
                </span>
              </button>
            </Modal.Footer>
          </form>
        </FormProvider>
      </Modal>
      {closeModalConfirmation && (
        <CloseModalConfirmation
          show={closeModalConfirmation}
          setCloseModalConfirmation={setCloseModalConfirmation}
          setAddGroupModal={setAddGroupModal}
          handleClose={handleClose}
        />
      )}
    </>
  );
};

export default AddEditGroup;
