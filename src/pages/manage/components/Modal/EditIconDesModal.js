import React, { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Modal } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { yupResolver } from "@hookform/resolvers/yup";
import { FormProvider, useForm } from "react-hook-form";
import Cropper from "react-easy-crop";

import { setLoader } from "../../../../store/reducer";
import FormInput from "../../../../components/FormInput";
import { ApiCall, ApiFileUpload, ApiGetFile } from "../../../../utils/ApiUtils";
import { groupIconValidation } from "../../../register/validationSchema";
import FileUploadCrop from "../../../../components/FileUploadCrop";
import { getCroppedImg } from "../../../../utils/common";

import ArrowRight from "../../../../assets/images/arrow.svg";

const EditIconDesModal = ({
  dataItem,
  groupIcon,
  groupItem,
  fetchData,
  editIconDes,
  setEditIconDes,
  iconDescription,
  setIconDescription,
}) => {
  const dispatch = useDispatch();

  const [isCropImg, setIsCropImg] = useState(null);

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);

  const methods = useForm({
    resolver: yupResolver(groupIconValidation),
    mode: "all",
  });
  const { handleSubmit, reset, setValue, getValues } = methods;

  useEffect(() => {
    if (groupItem) {
      setValData();
    }
  }, [groupItem, iconDescription]);

  const setValData = async () => {
    const iconInfo = await ApiGetFile(groupItem?.groupIcon);
    setValue("groupIconName", iconInfo ? iconInfo?.originalFilename : "");
    setValue(`description`, groupItem?.description);
    setValue(`groupIcon`, groupItem?.groupIcon);
  };

  const onSubmit = async (formData) => {
    try {
      if (iconDescription === "Icon" && isCropImg) {
        await fileUploadFN(formData);
      }
      if (iconDescription === "Icon" && !isCropImg) {
        await fileUploadedCrop();
      }
      if (iconDescription === "Description") {
        dispatch(setLoader(true));
        await ApiCall("PUT", `/rest/allowlist/${dataItem.id}/${groupItem?.id}/edit`, {
          groupConfig: {
            ...groupItem,
            description: formData.description,
            groupIcon: formData.groupIcon,
          },
        });

        dispatch(setLoader(false));
        setIconDescription("");
      }

      setEditIconDes(!editIconDes);
      fetchData();
      reset();
      toast.success("Changes saved!");
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
        toast.error("Fields with a red dot are mandatory.");
        break;
      } else {
        if (Array.isArray(value)) {
          getRequiredError(value);
        }
      }
    }
  };

  const handleFormSubmit = async () => {
    await handleSubmit(onSubmit)();
    getRequiredError(methods.formState.errors?.groupList);
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const fileUploadFN = async (formData) => {
    try {
      dispatch(setLoader(true));
      const inputFile = await getCroppedImg(isCropImg, croppedAreaPixels, rotation, formData?.groupIcon?.name);
      const responseData = await ApiFileUpload(inputFile, groupItem?.groupIcon);
      setValue("groupIcon", responseData.id, {
        shouldTouch: true,
      });
      setValue("groupIconName", responseData.originalFilename, {
        shouldTouch: true,
      });
      dispatch(setLoader(false));
    } catch (error) {
      console.log(error);
      dispatch(setLoader(false));
      toast.error("An error occurred while attempting to upload the file.");
    }
  };

  const getBase64FromUrl = async (url) => {
    const data = await fetch(url);
    const blob = await data.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        const base64data = reader.result;
        resolve(base64data);
      };
    });
  };

  const fileUploadedCrop = async () => {
    try {
      dispatch(setLoader(true));
      const baseUrl = await getBase64FromUrl(groupIcon?.path).then();
      const inputFile = await getCroppedImg(baseUrl, croppedAreaPixels, rotation, getValues("groupIconName"));
      const responseData = await ApiFileUpload(inputFile, groupIcon?._id);
      setValue("groupIcon", responseData.id, {
        shouldTouch: true,
      });
      setValue("groupIconName", responseData.originalFilename, {
        shouldTouch: true,
      });
      dispatch(setLoader(false));
    } catch (error) {
      console.log(error);
      dispatch(setLoader(false));
      toast.error("An error occurred while attempting to upload the file.");
    }
  };

  return (
    <Modal
      className="add-group-modal edit-modal"
      size="lg"
      centered
      show={editIconDes}
      onHide={() => {
        setIconDescription("");
        setEditIconDes(!editIconDes);
      }}
    >
      <FormProvider {...methods}>
        <form onSubmit={(e) => e.preventDefault()}>
          <Modal.Header closeButton className="border-0">
            <h2 className="mb-0">
              <b>Edit Collab {iconDescription}</b>
            </h2>
          </Modal.Header>
          <Modal.Body>
            {iconDescription === "Icon" &&
              (isCropImg ? (
                <div className="position-relative w-100" style={{ height: "400px" }}>
                  <Cropper
                    image={isCropImg}
                    crop={crop}
                    cropShape="round"
                    rotation={rotation}
                    zoom={zoom}
                    aspect={1 / 1}
                    onCropChange={setCrop}
                    onRotationChange={setRotation}
                    onCropComplete={onCropComplete}
                    onZoomChange={setZoom}
                  />
                </div>
              ) : (
                <>
                  <FileUploadCrop
                    name="groupIcon"
                    type="file"
                    placeholder="Collab Icon (.jpg, .png, .jpeg, 1:1)"
                    fileUploadName="groupIconName"
                    setIsEditCropImg={setIsCropImg}
                    isEdit={true}
                  />
                  <div className="position-relative w-100 mt-4" style={{ height: "400px" }}>
                    <Cropper
                      image={groupIcon?.path}
                      crop={crop}
                      cropShape="round"
                      rotation={rotation}
                      zoom={zoom}
                      aspect={1 / 1}
                      onCropChange={setCrop}
                      onRotationChange={setRotation}
                      onCropComplete={onCropComplete}
                      onZoomChange={setZoom}
                    />
                  </div>
                </>
              ))}
            {iconDescription === "Description" && (
              <FormInput name="description" type="textarea" placeholder="Collab Description" />
            )}
          </Modal.Body>
          <Modal.Footer className="justify-content-end border-0 pb-4">
            <button
              type="button"
              onClick={() => {
                handleFormSubmit();
              }}
              className="btn next-btn m-0"
            >
              Done
              <span className="d-flex">
                <img src={ArrowRight} alt="Icon" />
              </span>
            </button>
          </Modal.Footer>
        </form>
      </FormProvider>
    </Modal>
  );
};

export default EditIconDesModal;
