import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { BsX } from "react-icons/bs";
import { FaDiscord } from "react-icons/fa";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import useFormPersist from "react-hook-form-persist";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";

import FormInput from "../../../components/FormInput";
import { projectConfigValidation } from "../validationSchema";
import { ApiCall, ApiGetFile, API_ALLOWLIST_URL } from "../../../utils/ApiUtils";
import { setIsEditUserId, setLoader, setSavedFirstStep, setSaveDraftData } from "../../../store/reducer/index";
import config from "../../../utils/config.json";
import { shortenText, slugify } from "../../../utils/common";

import ArrowRight from "../../../assets/images/arrow.svg";

const BasicForm = ({ goNext }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { state } = useLocation();

  const [showToast, setShowToast] = useState(true);
  const [allowlistData, setAllowlistData] = useState([]);
  const [discordServerData, setDiscordServerData] = useState([]);

  const saveDraftData = useSelector(({ saveDraftData }) => saveDraftData);
  const savedFirstStep = useSelector(({ savedFirstStep }) => savedFirstStep);
  const isEditUserId = useSelector(({ isEditUserId }) => isEditUserId);
  const currentFormStep = useSelector(({ currentFormStep }) => currentFormStep);

  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");
  const userId = isEditUserId;
  const isEditMode = Boolean(isEditUserId) ? true : false;
  const methods = useForm({
    resolver: yupResolver(projectConfigValidation),
    defaultValues: {
      primaryColour: "#E64242",
      secondaryColour: "#A742E6",
      urlSlug: "",
    },
    mode: "onChange",
  });
  const {
    handleSubmit,
    control,
    watch,
    trigger,
    setValue,
    getValues,
    formState: { errors, touchedFields },
    clearErrors,
    getFieldState,
  } = methods;

  useFormPersist("basicForm", {
    watch,
    setValue,
    storage: window.localStorage,
  });

  const discord = watch("discord");
  const twitter = watch("twitter");
  const projectLogo = watch("projectLogo");
  const projectIcon = watch("projectIcon");
  const projectBackgroundImage = watch("projectBackgroundImage");

  window.onpopstate = () => {
    if (window.location.pathname === "/launch" && currentFormStep === 1) {
      navigate("/manage");
    }
  };

  useEffect(() => {
    if (discord && discordServerData.length === 0 && !isEditMode) getDiscordServerData(discord?.userData?.id);
  }, [discord]);

  useEffect(() => {
    const setData = async () => {
      dispatch(setLoader(true));

      setValue("projectBackgroundImage", config.STATIC_BACKGROUND_IMAGE_ID);

      const result = await ApiCall("GET", `/rest/allowlist`);
      if (result && result.data && result.data.length > 0) {
        const data = result.data;
        setAllowlistData(data);

        const dd2 = await ApiGetFile(data[data.length - 1]?.projectLogo);

        if (
          dd2 &&
          !saveDraftData?.projectLogo &&
          data[data.length - 1]?.projectLogo !== undefined &&
          !watch("projectLogoName")
        ) {
          setValue("projectLogo", data[data.length - 1]?.projectLogo || "");
          setValue("projectLogoName", dd2?.originalFilename || "");
        }

        if (!watch("allowListName")) setValue("allowListName", data[data.length - 1].allowListName);
        if (!watch("projectWebsite")) setValue("projectWebsite", data[data.length - 1]?.projectWebsite);
        if (!watch("discord")) setValue("discord", data[data.length - 1].discord);

        const d = new Date();
        const time = d.getTime();
        if (time < data[data.length - 1].twitter?.token?.expires_at) setValue("twitter", data[data.length - 1].twitter);
      }
      dispatch(setLoader(false));
    };
    if (!isEditMode && !saveDraftData) {
      setData();
    }
  }, []);

  useEffect(() => {
    if (userId) {
      populateEditData();
      return () => {
        dispatch(setIsEditUserId(false));
        localStorage.removeItem("basicForm");
      };
    }
  }, [userId]);

  const populateEditData = async () => {
    try {
      dispatch(setLoader(true));
      const result = await ApiCall("GET", `/rest/allowlist/${userId}`);
      const editUserData = result?.data;
      if (editUserData) {
        setDiscordServerData([
          { label: editUserData?.discord?.guildData?.name, value: editUserData?.discord?.guildData?.id },
        ]);
        setValue("allowListName", editUserData?.allowListName);
        setValue("projectName", editUserData?.projectName);
        setValue("projectDescription", editUserData?.projectDescription);
        setValue("urlSlug", editUserData?.urlSlug);
        setValue("primaryColour", editUserData?.primaryColour);
        setValue("secondaryColour", editUserData?.secondaryColour);
        setValue("projectWebsite", editUserData?.projectWebsite);
        setValue("discord", editUserData?.discord);
        setValue("twitter", editUserData?.twitter);
        setValue("discordInviteLink", editUserData?.discordInviteLink);

        const dd1 = await ApiGetFile(editUserData?.projectBackgroundImage);
        const dd2 = await ApiGetFile(editUserData?.projectLogo);
        const dd3 = await ApiGetFile(editUserData?.projectIcon);

        setValue("projectBackgroundName", dd1 ? dd1?.originalFilename : "");
        setValue("projectBackgroundImage", editUserData?.projectBackgroundImage || "");

        setValue("projectLogoName", dd2 ? dd2?.originalFilename : "");
        setValue("projectLogo", editUserData?.projectLogo || "");

        setValue("projectIconName", dd3 ? dd3?.originalFilename : "");
        setValue("projectIcon", editUserData?.projectIcon || "");
      }
      dispatch(setLoader(false));
    } catch (error) {
      dispatch(setLoader(false));
      toast.error("Failed to load. Please try again later.");
      console.log(error);
    }
  };

  const getGuildData = async (id) => {
    const dis = watch("discord");
    const resp = await axios.get(`${process.env.REACT_APP_HYP3_DISCORD_URL}/get-guild-details?guildId=${id}`);
    if (resp && dis) setValue("discord", { ...dis, guildData: resp?.data }, { shouldTouch: true });
  };

  const getDiscordServerData = (userId) => {
    try {
      axios
        .get(`${process.env.REACT_APP_HYP3_DISCORD_URL}/get-guild?cmId=${userId}`)
        .then((res) => {
          const data = [];
          res.data?.forEach((item) => {
            data.push({ label: item.guildName, value: item.guildId });
          });
          if (savedFirstStep) {
            const index = data.findIndex((item) => item.value === savedFirstStep?.discord?.guildData?.id);
            const foundItem = data.splice(index, 1);
            getGuildData(foundItem[0].value);
            setDiscordServerData([...foundItem, ...data]);
          } else if (watch("discord")) {
            const index = data.findIndex((item) => item.value === watch("discord")?.guildData?.id);
            const foundItem = data.splice(index, 1);
            getGuildData(foundItem[0].value);
            setDiscordServerData([...foundItem, ...data]);
          } else {
            getGuildData(data[0].value);
            setDiscordServerData(data);
          }
        })
        .catch((error) => {
          setDiscordServerData([]);
        });
    } catch (error) {
      setDiscordServerData([]);
      console.log(error);
    }
  };

  useEffect(() => {
    if (code !== null) {
      if (searchParams.get("state")) {
        if (!Object.keys(getValues("twitter") || {}).length) {
          ApiCall("GET", `/http/twitter/getAccessToken?code=${code}&state=${searchParams.get("state")}`).then(
            (result) => {
              setValue("twitter", result.data, { shouldTouch: true });
            }
          );
        }
      } else {
        if (!Object.keys(getValues("discord") || {}).length) {
          ApiCall("GET", `/http/discord/callback?code=${code}`).then((result) => {
            setValue("discord", result.data, { shouldTouch: true });
          });
        }
      }
    }
    window.history.pushState(null, null, window.location.href);
    window.addEventListener("popstate", onBackButtonEvent);
    return () => {
      window.removeEventListener("popstate", onBackButtonEvent);
    };
    // eslint-disable-next-line
  }, [code, searchParams]);

  useEffect(() => {
    if (savedFirstStep) {
      ApiCall("GET", `/rest/allowlist/${savedFirstStep.id}`).then(async ({ data }) => {
        const dd1 = await ApiGetFile(data?.projectBackgroundImage);
        const dd2 = await ApiGetFile(data?.projectLogo);
        const dd3 = await ApiGetFile(data?.projectIcon);

        if (dd1 && data?.projectBackgroundImage !== undefined)
          setValue("projectBackgroundName", dd1?.originalFilename || "");
        if (dd2 && data?.projectLogo !== undefined) setValue("projectLogoName", dd2?.originalFilename || "");
        if (dd3 && data?.projectIcon !== undefined) setValue("projectIconName", dd3?.originalFilename || "");
      });
    }
  }, [savedFirstStep]);

  const onBackButtonEvent = (e) => {
    e.preventDefault();
    const allVal = getValues();
    Object.keys(allVal).forEach((key) => (allVal[key] === undefined || allVal[key] === "") && delete allVal[key]);
    if (Object.keys(allVal).length > 2) {
      if (window.confirm("Sure about leaving this page? All unsaved changes will be lost.")) {
        navigate("/manage");
      }
    }
  };

  const checkURLSlug = async (value, i) => {
    try {
      if (i <= 3) {
        const resp = await ApiCall("GET", `/rest/allowlist/slugAvailabilityCheck/${value}`);
        if (!resp.data) {
          const val = value + Date.now();
          checkURLSlug(val, i + 1);
        }
        return value;
      } else {
        toast.error("Something went wrong! Please try again later.");
        return false;
      }
    } catch (error) {
      const val = value + Date.now();
      checkURLSlug(val, i + 1);
    }
  };

  const onSubmit = async (data) => {
    try {
      if (data["projectIcon"] === undefined) {
        data["projectIcon"] = "";
        data["projectIconName"] = "";
      }
      if (discordServerData.length === 0) {
        toast.dismiss();
        toast.error(
          <p className="text-center">
            Please be added as a CM in <br /> any server.
          </p>
        );
        return;
      }
      if (!data["twitter"]) delete data["twitter"];
      if (Object.keys(touchedFields).length > 0) {
        if (isEditMode) {
          dispatch(setLoader(true));
          delete data["urlSlug"];
          delete data["discord"];
          await ApiCall("PUT", "/rest/allowlist/basicConfig/" + userId, {
            basicConfig: data,
          });
        } else {
          if (savedFirstStep || saveDraftData) {
            dispatch(setLoader(true));
            delete data["urlSlug"];
            const id = savedFirstStep ? savedFirstStep?.id : saveDraftData?.id;
            await ApiCall("PUT", "/rest/allowlist/basicConfig/" + id, {
              basicConfig: data,
            });
            const oldData = savedFirstStep ? savedFirstStep : saveDraftData;
            dispatch(setSavedFirstStep({ ...oldData, ...data }));
          } else {
            dispatch(setLoader(true));
            const str = slugify(data.allowListName + "-" + data.projectName + "-" + allowlistData.length);
            const s = await checkURLSlug(str, 0);
            if (!s) return;
            data["urlSlug"] = s;
            const resp = await ApiCall("POST", "/rest/allowlist/basicConfig", {
              basicConfig: data,
            });
            dispatch(setSavedFirstStep(resp.data));
          }
        }
        dispatch(setLoader(false));
        toast.success(isEditMode ? "Updated successfully!" : "Your progress has been saved as a draft!");
      }

      isEditMode ? navigate("/manage", { state: state }) : goNext();
      const element = document.getElementById("custom-navbar");
      element.scrollIntoView();
    } catch (error) {
      dispatch(setLoader(false));
      toast.error(error?.response?.data?.message || "Something went wrong.");
    }
  };

  const saveDraft = async () => {
    try {
      const allVal = getValues();
      await trigger(["allowListName", "projectName", "urlSlug", allVal.projectWebsite ? "projectWebsite" : ""]);
      // const projectWebsiteState = getFieldState("projectWebsite");
      const allowListName = getFieldState("allowListName");
      const urlSlug = getFieldState("urlSlug");

      if (allowListName.error || !allVal.projectName || urlSlug.error) {
        window.scrollTo(0, 300);
        errors?.allowListName?.ref.focus();
        toast.error(
          <p className="text-center">
            To save draft, fill in the fields <br /> marked by red dots.
          </p>
        );
        clearErrors([
          "primaryColour",
          "secondaryColour",
          "projectDescription",
          "discordInviteLink",
          "projectLogo",
          "projectBackgroundImage",
          "projectWebsite",
          "discord",
        ]);
        return;
      }

      if (discordServerData.length === 0) {
        toast.dismiss();
        toast.error(
          <p className="text-center">
            Please be added as a CM in <br /> any server.
          </p>
        );
        return;
      }

      Object.keys(allVal).forEach((key) => !allVal[key] && delete allVal[key]);

      if (saveDraftData && saveDraftData.urlSlug === allVal.urlSlug) delete allVal["urlSlug"];

      if (typeof errors?.projectLogo === "object" && Object.keys(errors?.projectLogo)?.length !== 0) {
        return;
      }

      if (
        typeof errors?.projectBackgroundImage === "object" &&
        Object.keys(errors?.projectBackgroundImage)?.length !== 0
      ) {
        return;
      }

      const isUpdate = saveDraftData && Object.keys(saveDraftData).length > 0;
      if (!isUpdate) {
        let i = 0;

        const str = slugify(allVal.allowListName + "-" + allVal.projectName + "-" + allowlistData.length);
        const s = await checkURLSlug(str, i);
        if (!s) return;
        allVal["urlSlug"] = s;
      }
      if (!watch("projectIcon") || !watch("projectIconName")) {
        allVal["projectIcon"] = "";
        allVal["projectIconName"] = "";
      }
      dispatch(setLoader(true));
      const resp = await ApiCall(
        isUpdate ? "PUT" : "POST",
        `/rest/allowlist/basicConfig${isUpdate ? "/" + saveDraftData.id : ""}`,
        {
          basicConfig: allVal,
        }
      );

      dispatch(setLoader(false));
      if (resp.data) {
        dispatch(setLoader(false));
        dispatch(setSaveDraftData(resp.data));
        if (saveDraftData) toast.success("Your progress has been saved as a draft!");
        else toast.success("Your progress has been saved as a draft!");
      }
    } catch (error) {
      console.log(error);

      dispatch(setLoader(false));
      toast.error(error?.response?.data?.message || "Something went wrong.");
    }
  };

  const onDiscordClick = async (isRemove) => {
    if (isRemove) {
      setValue("discord", null);
    } else {
      window.open(API_ALLOWLIST_URL + "/http/discord/request/creator", "_self");
    }
  };

  const onTwitterClick = async (isRemove) => {
    if (isRemove) {
      setValue("twitter", null);
    } else {
      window.open(API_ALLOWLIST_URL + `/http/twitter/request?state=${new Date().getTime()}`, "_self");
    }
  };

  useEffect(() => {
    if (
      projectBackgroundImage?.name === undefined &&
      typeof projectBackgroundImage === "object" &&
      Object.keys(projectBackgroundImage)?.length === 0
    ) {
      setValue(`projectBackgroundImage`, undefined);
      setValue(`projectBackgroundName`, "");
    }
    if (projectLogo?.name === undefined && typeof projectLogo === "object" && Object.keys(projectLogo)?.length === 0) {
      setValue(`projectLogo`, undefined);
      setValue(`projectLogoName`, "");
    }
    if (projectIcon?.name === undefined && typeof projectIcon === "object" && Object.keys(projectIcon)?.length === 0) {
      setValue(`projectIcon`, undefined);
      setValue(`projectIconName`, "");
    }
  }, [projectIcon, projectLogo, projectBackgroundImage]);

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          await handleSubmit(onSubmit)();
          // eslint-disable-next-line
          for (let [key, value] of Object.entries(methods.formState.errors)) {
            if (value?.type === "required" || value?.type === "typeError") {
              if (showToast) {
                toast.error(<p className="text-center">Fields with a red dot are mandatory.</p>);
                setShowToast(false);
                setTimeout(() => {
                  setShowToast(true);
                }, 3000);
              }
              break;
            }
          }
        }}
        onKeyDown={(e) => e.code === "Enter" && e.preventDefault()}
      >
        <div className="inside-div-cm col-lg-10 w-90 mx-auto d-block">
          <h3> Info </h3>
          <div className="row">
            <div className="col-lg-6">
              <FormInput name="allowListName" type="text" placeholder="Your Project" tooltipText="Your Project" />
            </div>
            <div className="col-lg-6">
              <FormInput name="projectName" type="text" placeholder="Partner Project" tooltipText="Partner Project" />
            </div>
            <div className="col-lg-12">
              <FormInput
                rows={4}
                name="projectDescription"
                type="textarea"
                placeholder="Partner Project Description (Optional)"
                tooltipText="Partner Project Description (Optional)"
              />
            </div>
            <div className="col-lg-12"></div>
          </div>
        </div>
        <div className="inside-div-cm col-lg-10 w-90 mx-auto d-block">
          <h3> Logos </h3>
          <div className="row">
            <div className="col-lg-6">
              <FormInput
                name="projectLogo"
                type="file"
                placeholder="Logo"
                fileUploadName="projectLogoName"
                tooltipText="Logo (This will edit your project's logo across all collabs linked to this wallet.)"
              // label={"Recommended size: 500x100"}
              />
            </div>
            <div className="col-lg-6">
              <FormInput
                name="projectIcon"
                type="file"
                placeholder="Partner Project Logo (Optional)"
                fileUploadName="projectIconName"
                tooltipText="Partner Project Logo (Optional)"
              // label={"Recommended size: 500x500"}
              />
            </div>
          </div>
        </div>
        <div className="inside-div-cm col-lg-10 w-90 mx-auto d-block mb-2">
          <h3> Socials </h3>
          <div className="comon-opcity-div mt-0">
            <div className="row">
              <div className="col-lg-12">
                <FormInput
                  name="projectWebsite"
                  type="text"
                  placeholder="Project Website Link"
                  className="mb-0"
                  tooltipText="Project Website Link"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="inside-div-cm col-lg-10 w-90 mx-auto d-block">
          <div className="d-flex gap-2">
            <div className="col">
              <div className={`social-div1 ${errors?.discord ? "dot" : ""}`}>
                {!discord?.userData ? (
                  <div className="top-counnect-div-socl">
                    <figure>
                      <img style={{ maxWidth: "110px" }} src="images/discord-white.png" alt="icon2" />
                    </figure>
                    <button type="button" className="btn comon-count1" onClick={() => onDiscordClick(false)}>
                      Connect Discord
                    </button>
                  </div>
                ) : (
                  <div className="div-show-couunt-ts-cord d-block ">
                    <div
                      style={{ opacity: isEditMode ? 0.5 : 1 }}
                      className="d-flex align-items-center mb-2 justify-content-center"
                    >
                      <figure className="m-0">
                        <FaDiscord />
                      </figure>
                      <div className="liks-div d-flex align-items-center">
                        <h5 className="m-0 discord-username">
                          <span className={`${discord?.userData?.username?.length > 13 ? "custom-tooltip" : ""}`}>
                            {shortenText(discord?.userData?.username, 10)}
                            <label
                              className={
                                discord?.userData?.username?.length > 13 ? `tooltip-text custom-tooltip-top` : ""
                              }
                            >
                              {discord?.userData?.username?.length > 13 && discord?.userData?.username}
                            </label>
                          </span>
                        </h5>
                        <button disabled={isEditMode} className="btn" onClick={() => onDiscordClick(true)}>
                          <BsX />
                        </button>
                      </div>
                    </div>
                    {discordServerData.length === 0 ? (
                      <span className="mb-2" style={{ color: "rgba(0, 0, 0, 0.5)" }}>
                        {" "}
                        Sorry, you are not a collab manager.
                      </span>
                    ) : (
                      <>
                        <div className="form-group discord-server-dd customize-select d-flex justify-content-center mb-0">
                          <div className={`comon-input-div mb-0`}>
                            <FormInput
                              name="serverName"
                              type="select"
                              disabled={isEditMode}
                              options={discordServerData}
                              onChange={(e) => {
                                getGuildData(e.target.value);
                              }}
                            />
                          </div>
                        </div>
                        <FormInput
                          onKeyPress={(e) => {
                            e.key === "Enter" && e.preventDefault();
                          }}
                          name="discordInviteLink"
                          type="text"
                          placeholder="Add Invite Link"
                          tooltipText={"Add Invite Link"}
                        />
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="col">
              <div className={`social-div1 ${errors?.twitter ? "dot" : ""}`}>
                {!twitter?.user ? (
                  <div>
                    <figure>
                      <img style={{ maxWidth: "110px" }} src="images/twitter-white.png" alt="icon2" />
                    </figure>

                    <button type="button" className="btn comon-count1" onClick={() => onTwitterClick(false)}>
                      Connect Twitter
                    </button>
                  </div>
                ) : (
                  <div style={{ opacity: isEditMode ? 0.5 : 1 }} className="div-show-couunt-ts">
                    <div className="d-flex align-items-center">
                      <figure>
                        <img style={{ maxWidth: "40px" }} src="images/twitter-white.png" alt="icon2" />
                      </figure>
                      <div className="liks-div d-flex align-items-center">
                        <h5 className="mt-0" style={{ marginLeft: "6px !important" }}>
                          <span>{twitter?.user?.username}</span>
                        </h5>
                        <button disabled={isEditMode} className="btn" onClick={() => onTwitterClick(true)}>
                          <BsX />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="inside-div-cm col-lg-10 w-90 mx-auto d-block mb-sm-4 mb-3 mb-2">
          <div className="d-sm-flex align-items-center justify-content-end">
            <div className="right-pre-div d-flex align-items-center justify-content-between">
              {isEditMode ? (
                <button disabled={!showToast} type="submit" className="btn next-btn">
                  Done
                  <span className="d-flex">
                    <img src={ArrowRight} alt="Icon" />
                  </span>
                </button>
              ) : (
                <>
                  <div className="custom-tooltip">
                    <span className="contact-info">?</span>
                    <span className="tooltip-text custom-tooltip-bottom px-1">
                      Email{" "}
                      <a href="mailto:contact@0xytocin.com" className="theme-colored-font">
                        contact@0xytocin.com
                      </a>{" "}
                      for support.
                    </span>
                  </div>
                  <button type="button" onClick={saveDraft} className="btn pre-btn">
                    Save Draft
                  </button>
                  <button disabled={!showToast} type="submit" className="btn next-btn">
                    Next
                    <span className="d-flex">
                      <img src={ArrowRight} alt="Icon" />
                    </span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};
export default BasicForm;
