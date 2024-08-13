import React, { useRef, useState, useCallback } from "react";
import { useFormContext, Controller, get } from "react-hook-form";
import { BiUpload } from "react-icons/bi";
import { Modal } from "react-bootstrap";
import Cropper from "react-easy-crop";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";

import { setLoader } from "../store/reducer";
import { ApiFileUpload } from "../utils/ApiUtils";
import { getCroppedImg } from "../utils/common";

import ArrowRight from "../../src/assets/images/arrow.svg";

const FileUploadCrop = ({ fileUploadName, accept, placeholder, name, index, setIsEditCropImg, isEdit, editMode }) => {
  const {
    control,
    getValues,
    getFieldState,
    trigger,
    formState: { errors },
  } = useFormContext();

  const uploadIcon = useRef(null);
  const [isCropImg, setIsCropImg] = useState(null);
  const [isUploadedId, setIsUploadedId] = useState(null);
  const error = get(errors, name);

  const readFile = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.addEventListener("load", () => resolve(reader.result), false);
      reader.readAsDataURL(file);
    });
  };

  return (
    <>
      <div className="box" style={{ height: 52, pointerEvents: editMode ? "none" : "initial" }}>
        <Controller
          name={name}
          control={control}
          render={({ field }) => {
            const fileName = field.value?.name || getValues(fileUploadName) || placeholder;
            return (
              <>
                <section
                  className="outputName"
                  style={{
                    color: getValues(fileUploadName) ? "rgba(255, 255, 255, 0.8)" : "",
                    fontFamily: getValues(fileUploadName) ? "KarlaBold" : "KarlaItalic",
                  }}
                >
                  {fileName}
                </section>
                <input
                  type="file"
                  accept={accept ? accept : ".png, .jpg, .jpeg"}
                  className="inputFile inputFile-1"
                  ref={uploadIcon}
                  title={fileName}
                  onChange={async (e) => {
                    if (e.target.files.length === 0) return;
                    field.onChange(e.target.files[0]);
                    await trigger(name);
                    const { invalid } = getFieldState(name);
                    if (invalid) return;

                    const imageDataUrl = await readFile(e.target.files[0]);
                    isEdit ? setIsEditCropImg(imageDataUrl) : setIsCropImg(imageDataUrl);
                  }}
                />
              </>
            );
          }}
        />

        <BiUpload onClick={() => uploadIcon.current.click()} style={{ cursor: "pointer", zIndex: 1 }} />
        {isCropImg && (
          <ImgCropModal
            isCropImg={isCropImg}
            setIsCropImg={setIsCropImg}
            fileUploadName={`groupList.${index}.groupIconName`}
            name={`groupList.${index}.groupIcon`}
            isUploadedId={isUploadedId}
            setIsUploadedId={setIsUploadedId}
          />
        )}
      </div>
      {error && (
        <div className="form-error">
          <div className="error-text mt-1">
            <span className="info">i</span>
            <span>{error?.message}</span>
          </div>
        </div>
      )}
    </>
  );
};

export default FileUploadCrop;

const ImgCropModal = ({ isCropImg, setIsCropImg, fileUploadName, name, isUploadedId, setIsUploadedId }) => {
  const dispatch = useDispatch();
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const { setValue, getValues } = useFormContext();

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const fileUploadFN = async () => {
    try {
      dispatch(setLoader(true));
      const inputFile = await getCroppedImg(isCropImg, croppedAreaPixels, rotation, getValues(name)?.name);
      const responseData = await ApiFileUpload(inputFile, isUploadedId || "");
      setIsUploadedId(responseData.id);
      setValue(name, responseData.id, { shouldTouch: true });
      setValue(fileUploadName, responseData.originalFilename, { shouldTouch: true });

      dispatch(setLoader(false));
      setIsCropImg(null);
    } catch (error) {
      console.log(error);
      dispatch(setLoader(false));
      toast.error("An error occurred while attempting to upload the file.");
      setIsCropImg(null);
    }
  };

  return (
    <Modal
      className="add-group-modal edit-modal"
      size="lg"
      centered
      show={isCropImg}
      onHide={() => {
        setIsCropImg(null);
        setValue(name, isUploadedId, { shouldTouch: true });
      }}
    >
      <Modal.Header className="border-0" closeButton>
        <h2 className="mb-0">
          <b>Crop Collab Icon</b>
        </h2>
      </Modal.Header>
      <Modal.Body>
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
      </Modal.Body>
      <Modal.Footer className="justify-content-end border-0 pb-4">
        <button onClick={() => fileUploadFN()} type="button" className="btn next-btn m-0">
          Done
          <span className="d-flex">
            <img src={ArrowRight} alt="Icon" />
          </span>
        </button>
      </Modal.Footer>
    </Modal>
  );
};
