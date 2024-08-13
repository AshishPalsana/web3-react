import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { AiOutlineSearch } from "react-icons/ai";
import { Dropdown, Modal } from "react-bootstrap";
import { yupResolver } from "@hookform/resolvers/yup";
import { FormProvider, get, useForm } from "react-hook-form";

import { ApiCall } from "../../../../utils/ApiUtils";
import { setLoader } from "../../../../store/reducer";
import FormInput from "../../../../components/FormInput";
import ArrowRight from "../../../../assets/images/arrow.svg";
import { createRoleValidation } from "../../validationSchema";

import DropdownIcon from "../../../../assets/images/dropdown.png";

const CreateNewRole = ({ index, show, setShow, dataItem, serveData, setGuildId, guildId }) => {
  const dispatch = useDispatch();
  const methods = useForm({
    resolver: yupResolver(createRoleValidation),
    mode: "all",
  });
  const {
    reset,
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = methods;

  const selection = watch("createServer");
  const error = get(errors, "createServer");
  const [showToast, setShowToast] = useState(false);
  const [serverOption, setServerOption] = useState([]);

  useEffect(() => {
    if (showToast) {
      setTimeout(() => {
        setShowToast(false);
      }, 4000);
    }
  }, [showToast]);

  const onSubmit = async (formData) => {
    try {
      dispatch(setLoader(true));
      await ApiCall("POST", `/http/discord/createRole`, {
        guildId: formData?.createServer,
        access_token: dataItem?.discord?.access_token,
        roleData: {
          name: formData?.createRoleName,
          color: formData?.createRoleColor,
        },
      });
      setGuildId(`${formData?.createServer}`);
      dispatch(setLoader(false));
      setShow(!show);
      reset();
      toast.success("New role created successfully.");
    } catch (error) {
      console.log(error);
      dispatch(setLoader(false));
      setShowToast(true);
      if (!showToast) {
        toast.error("Please install HYP3R bot on server to create/assign roles.");
      }
    }
  };

  const handleFormSubmit = async () => {
    await handleSubmit(onSubmit)();
    if (methods.formState.errors.createRoleName !== undefined) {
      setShowToast(true);
      if (!showToast) {
        toast.error("Fields with a red dot are mandatory.");
      }
    }
  };

  const handleSelect = (id) => {
    setValue("createServer", id, { shouldValidate: true });
  };

  useEffect(() => {
    if (guildId) {
      setValue("createServer", guildId, { shouldTouch: true, shouldValidate: true }); // do not remove this
    }
  }, [guildId]);

  useEffect(() => {
    setServerOption([serveData.guildData]);
  }, [dataItem]);

  return (
    <Modal
      className="add-group-modal edit-modal"
      size="lg"
      centered
      show={show}
      onHide={() => {
        setShow(!show);
        reset();
      }}
    >
      <FormProvider {...methods}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleFormSubmit();
          }}
        >
          <Modal.Header closeButton className="border-0">
            <h2 className="mb-0">
              <b>Create New Role</b>
            </h2>
          </Modal.Header>
          <Modal.Body className="comon-input-div">
            <div className="row mb-3">
              <div className="col-md-4">
                <Dropdown className="custom-search-select form-group form-error">
                  <Dropdown.Toggle id={`select-server-${index}`}>
                    {selection === ""
                      ? "Server"
                      : serverOption?.length > 0 && serverOption.find((item) => item.id === selection)?.name}
                    <img src={DropdownIcon} alt="icon" />
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    {serverOption?.length > 0 ? (
                      serverOption?.map((item, index) => {
                        return (
                          <Dropdown.Item onClick={() => handleSelect(item.id)} key={index}>
                            {item.name}
                          </Dropdown.Item>
                        );
                      })
                    ) : (
                      <Dropdown.Item style={{ cursor: "default" }}>No results found</Dropdown.Item>
                    )}
                  </Dropdown.Menu>
                  {error && (
                    <div className="error-text mt-1">
                      <span className="info">i</span>
                      <span>{error?.message}</span>
                    </div>
                  )}
                </Dropdown>
              </div>
            </div>
            <div className="row inside-div-cm d-flex mb-0">
              <div className="col-md-8 discord-role-select">
                <FormInput type="text" name={`createRoleName`} placeholder="Enter Role Name" />
              </div>
              <div className="col-md-4 mb-0">
                <FormInput
                  type="color"
                  placeholder="Select Role Color"
                  name={`createRoleColor`}
                  className="common-role-color position-relative"
                />
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer className="justify-content-end border-0">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                handleFormSubmit();
              }}
              className="btn next-btn m-0"
            >
              Create
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

export default CreateNewRole;
