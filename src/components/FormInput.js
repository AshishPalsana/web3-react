import React, { forwardRef, useEffect, useRef, useState } from "react";
import { BiUpload } from "react-icons/bi";
import { MdDeleteOutline } from "react-icons/md";
import { useDispatch } from "react-redux";
import Select, { components } from "react-select";
import { Form, InputGroup } from "react-bootstrap";
import CreatableSelect from "react-select/creatable";
import { Controller, useFormContext, get } from "react-hook-form";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import moment from "moment";

import ColorButton from "./ColorButton";
import { setLoader } from "../store/reducer";
import { ApiFileUpload, getlikeRTTweet, getTwitterUserName } from "../utils/ApiUtils";

import Dropdown from "../assets/images/dropdown.png";

function FormInput({
  name,
  defaultValue,
  selected,
  onChange,
  placeholder,
  type = "text",
  label,
  disabled,
  options = [],
  className = "",
  value,
  suffix,
  prefix,
  mask,
  fileUploadName,
  inputClassName,
  isMulti,
  selectedValue,
  onKeyPress,
  rows,
  allowListId,
  minDateTime,
  accept,
  onBlur,
  isSearchable,
  tooltipText,
  ...rest
}) {
  const methods = useFormContext();
  const dispatch = useDispatch();
  const [stopToast, setStopToast] = useState(false);
  const [isShowPassword, setIsShowPassword] = useState(false);
  const uploadIcon = useRef(null);

  const error = get(methods.formState.errors, name);

  const fieldRegister = methods.register(name, {
    onChange: onChange ? onChange : () => {},
    onBlur: onBlur ? onBlur : () => {},
  });

  useEffect(() => {
    if (stopToast) {
      setTimeout(() => {
        setStopToast(false);
      }, 4000);
    }
  }, [stopToast]);

  const handelCreatableOnChange = async (field, value, dd) => {
    value = value.filter((v, i, a) => a.findIndex((v2) => v2.value === v.value) === i);
    if (field.name.includes("twitterActivity")) {
      value = value.map((item) => {
        const parsedVal = getTwitterUserName(item.value);
        return { ...item, label: parsedVal, value: parsedVal };
      });

      const newArray = [];
      value.map((i) => {
        if (!newArray.some((item) => item.value == i.value)) {
          newArray.push(i);
        }
      });
      value = newArray;
    }
    if (field.name.includes("tweets") && dd?.action === "create-option") {
      const [val, ...rest] = value;
      if (val) {
        try {
          const parsedVal = getlikeRTTweet(val.value);
          if (!parsedVal) {
            setStopToast(true);
            !stopToast && toast.error("Invalid link");
            return;
          }
          dispatch(setLoader(true));
          value = [
            ...rest,
            {
              label: parsedVal,
              value: val.value,
            },
          ];
          dispatch(setLoader(false));
        } catch (error) {
          setStopToast(true);
          !stopToast && toast.error(error?.response?.data?.message || "Invalid link");
          dispatch(setLoader(false));
          return;
        }
      }
    }

    field.onChange(value);
  };

  return (
    <>
      {type !== "checkbox" && type !== "file" && label && <Form.Label>{label} </Form.Label>}
      <Form.Group
        className={`form-group ${error ? "form-error" : ""} ${error?.type === "required" ? "dot " : ""}` + className}
      >
        {(() => {
          switch (type) {
            case "password":
              return (
                <InputGroup className="input_group">
                  <Form.Control
                    type={isShowPassword ? "text" : "password"}
                    placeholder={placeholder}
                    onWheelCapture={(e) => {
                      e.target.blur();
                    }}
                    disabled={disabled}
                    {...fieldRegister}
                    autoComplete="off"
                  />
                  <InputGroup.Text onClick={() => setIsShowPassword(!isShowPassword)} id="create-password">
                    <BiUpload />
                  </InputGroup.Text>
                </InputGroup>
              );

            case "select":
              return (
                <Controller
                  control={methods.control}
                  name={name}
                  render={({ field }) => (
                    <Select
                      {...field}
                      classNamePrefix="select form-select-custom"
                      options={options}
                      isMulti={isMulti}
                      onChange={(data) => {
                        if (isMulti) field.onChange(data);
                        else field.onChange(data?.value ? String(data?.value) : "");
                      }}
                      value={
                        isMulti
                          ? field.value
                          : options.find((item) => item.value === field.value)
                          ? options.find((item) => item.value === field.value)
                          : options[0]
                      }
                      isClearable={false}
                      hideSelectedOptions
                      defaultValue={selectedValue}
                      isDisabled={disabled}
                      components={{
                        IndicatorSeparator: null,
                        DropdownIndicator: (props) => (
                          <components.DropdownIndicator {...props}>
                            <img src={Dropdown} alt="icon" className="icon" />
                          </components.DropdownIndicator>
                        ),
                        NoOptionsMessage: (props) => (
                          <components.NoOptionsMessage {...props}>
                            <span>No Further Options</span>
                          </components.NoOptionsMessage>
                        ),
                      }}
                    />
                  )}
                />
              );

            case "checkbox":
              return (
                <Form.Check
                  type={type}
                  placeholder={placeholder}
                  label={label}
                  disabled={disabled}
                  {...fieldRegister}
                />
              );

            case "file":
              return (
                <div className={tooltipText && `file custom-tooltip`}>
                  <div className="box" style={{ height: 40 }}>
                    <Controller
                      name={name}
                      control={methods.control}
                      render={({ field }) => {
                        const fileName = field.value?.name || methods.getValues(fileUploadName) || placeholder;
                        return (
                          <>
                            <section
                              className="outputName"
                              style={{
                                color: methods.getValues(fileUploadName) ? "rgba(255, 255, 255, 0.8)" : "",
                                fontFamily: methods.getValues(fileUploadName) ? "KarlaBold" : "KarlaItalic",
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
                                if (fileUploadName) {
                                  try {
                                    field.onChange(e.target.files[0] || "");
                                    methods.setValue(fileUploadName, "");
                                    const isVaild = await methods.trigger(name);
                                    if (isVaild) {
                                      dispatch(setLoader(true));
                                      const responseData = await ApiFileUpload(
                                        e.target.files[0],
                                        // typeof field.value === "string" ? field.value : ""
                                        ""
                                      );
                                      field.onChange(responseData.id);
                                      methods.setValue(fileUploadName, responseData.originalFilename, {
                                        shouldTouch: true,
                                      });
                                      dispatch(setLoader(false));
                                    }
                                  } catch (error) {
                                    console.log(error);
                                    dispatch(setLoader(false));
                                    toast.error("An error occurred while attempting to upload the file.");
                                  }
                                } else {
                                  field.onChange(e.target.files[0]);
                                }
                              }}
                            />

                            <div style={{ cursor: "pointer", zIndex: 1 }}>
                              {methods.getValues(fileUploadName) && (
                                <MdDeleteOutline
                                  onClick={() => {
                                    field.onChange("");
                                    methods.setValue(fileUploadName, undefined, {
                                      shouldTouch: true,
                                    });
                                    methods.setValue(name, undefined, {
                                      shouldTouch: true,
                                    });
                                    methods.trigger(name);
                                  }}
                                />
                              )}
                              <BiUpload onClick={() => uploadIcon.current.click()} />
                            </div>
                          </>
                        );
                      }}
                    />
                  </div>
                  <span className={tooltipText && `tooltip-text custom-tooltip-top`}>{tooltipText}</span>
                  {label}
                </div>
              );

            case "creatableSelect":
              return (
                <Controller
                  name={name}
                  control={methods.control}
                  render={({ field }) => {
                    return (
                      <CreatableSelect
                        isClearable
                        isDisabled={disabled}
                        isMulti
                        closeMenuOnSelect={false}
                        isSearchable={isSearchable}
                        hideSelectedOptions={false}
                        placeholder={placeholder || ""}
                        classNamePrefix="form-select-custom"
                        options={options.length > 0 ? options : []}
                        components={{
                          IndicatorSeparator: null,
                          DropdownIndicator: (props) =>
                            field.name.includes("roles") && (
                              <components.DropdownIndicator {...props}>
                                <img src={Dropdown} alt="icon" className="icon" />
                              </components.DropdownIndicator>
                            ),
                          Input: (props) => (
                            <components.Input
                              {...props}
                              onPaste={async (e) => {
                                const dd = e.clipboardData.getData("text");
                                if (field.name.includes("tweets")) {
                                  const parsedVal = getlikeRTTweet(dd);
                                  if (parsedVal === false) {
                                    setStopToast(true);
                                    !stopToast && toast.error("Invalid link");
                                  } else {
                                    handelCreatableOnChange(
                                      field,
                                      dd
                                        .split(",")
                                        .map((item) => ({ label: item, value: item }))
                                        .concat(field.value),
                                      {
                                        action: "create-option",
                                      }
                                    );
                                  }
                                } else {
                                  handelCreatableOnChange(
                                    field,
                                    dd
                                      .split(",")
                                      .map((item) => ({ label: item, value: item }))
                                      .concat(field.value),
                                    {
                                      action: "create-option",
                                    }
                                  );
                                }
                              }}
                            />
                          ),
                          Option: (props) => {
                            return (
                              <div>
                                <components.Option {...props}>
                                  <input type="checkbox" checked={props.isSelected} onChange={() => null} />
                                  <label>{props.label}</label>
                                </components.Option>
                              </div>
                            );
                          },
                        }}
                        {...field}
                        onChange={(value, dd) => handelCreatableOnChange(field, value, dd)}
                      />
                    );
                  }}
                />
              );

            case "groupCheckbox":
              return (
                <div>
                  {options.map((item) => (
                    <Form.Check
                      inline
                      type="radio"
                      key={item.value}
                      label={item.label}
                      value={item.value}
                      {...fieldRegister}
                    />
                  ))}
                </div>
              );

            case "textarea":
              return (
                <div className={tooltipText && `file custom-tooltip`}>
                  <textarea
                    onKeyPress={onKeyPress}
                    placeholder={placeholder}
                    disabled={disabled}
                    {...rest}
                    {...fieldRegister}
                    className={`form-control ${inputClassName ? inputClassName : ""} ${
                      type === "date" && "select-date"
                    }`}
                    onFocus={(e) => (e.target.placeholder = "")}
                    onBlur={(e) => {
                      e.target.placeholder = placeholder;
                      fieldRegister.onBlur(e);
                    }}
                  />
                  <span className={tooltipText && `tooltip-text custom-tooltip-top`}>{tooltipText}</span>
                </div>
              );

            case "color":
              return <ColorButton name={name} disabled={disabled} placeholder={placeholder || ""} />;

            case "datepicker":
              return (
                <Controller
                  name={name}
                  control={methods.control}
                  render={({ field }) => {
                    const ExampleCustomInput = forwardRef(({ value, onClick, className }, ref) => (
                      <input
                        disabled={disabled}
                        type="text"
                        onClick={onClick}
                        ref={ref}
                        className={className}
                        value={value}
                        style={{ cursor: "pointer" }}
                        // value={`${value} ${moment().tz(moment.tz.guess()).format("z")}`}
                        readOnly
                      />
                    ));

                    return (
                      <DatePicker
                        selected={new Date(field.value)}
                        minDate={minDateTime}
                        minTime={minDateTime}
                        onChange={(date) => {
                          field.onChange(date.toISOString());
                        }}
                        timeInputLabel="Time:"
                        dateFormat="do MMM, yyyy h:mm aa"
                        customInput={<ExampleCustomInput className="datePicker-custom-input" />}
                        maxTime={moment().endOf("day").toDate()}
                        showTimeSelect
                        timeIntervals={1}
                      />
                    );
                  }}
                />
              );

            default:
              return (
                <div className={tooltipText && `file custom-tooltip`}>
                  <input
                    type={type}
                    onKeyPress={onKeyPress}
                    placeholder={placeholder}
                    disabled={disabled}
                    rows={rows}
                    {...rest}
                    {...fieldRegister}
                    className={`form-control ${inputClassName ? inputClassName : ""} ${
                      type === "date" && "select-date"
                    }`}
                    autoComplete="off"
                  />
                  <span className={tooltipText && `tooltip-text custom-tooltip-top`}>{tooltipText}</span>
                </div>
              );
          }
        })()}

        {error && error?.type !== "required" && (
          <div className="error-text mt-1">
            <span className="info">i</span>
            <span>{error?.message}</span>
          </div>
        )}
      </Form.Group>
    </>
  );
}

export default FormInput;
