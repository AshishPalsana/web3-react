import React, { useState } from "react";
import { ChromePicker } from "react-color";
import { Controller, useFormContext } from "react-hook-form";

const popover = {
  position: "absolute",
  zIndex: "2",
  top: "51px",
  right: "0px",
};
const cover = {
  position: "fixed",
  top: "0px",
  right: "0px",
  bottom: "0px",
  left: "0px",
};

const ColorButton = ({ name, disabled, placeholder }) => {
  const methods = useFormContext();

  const [displayColorPicker, setDisplayColorPicker] = useState(false);

  const handleClick = () => {
    setDisplayColorPicker(!displayColorPicker);
  };

  const handleClose = () => {
    setDisplayColorPicker(false);
  };

  return (
    <div className="color-dvm d-flex align-items-center">
      <Controller
        control={methods.control}
        name={name}
        render={({ field }) => (
          <>
            <span
              className="color-preview"
              onClick={disabled ? () => {} : handleClick}
              style={{ backgroundColor: field.value, border: "1.5px solid #631DC3" }}
            />
            {displayColorPicker ? (
              <div style={popover}>
                <div style={cover} onClick={handleClose} />
                <ChromePicker
                  color={field.value}
                  onChangeComplete={(color) => {
                    field.onChange(color.hex);
                    methods.setValue(name, color.hex, { shouldTouch: true, shouldValidate: true });
                  }}
                  disableAlpha={true}
                />
              </div>
            ) : null}
            <input
              type="text"
              placeholder={placeholder}
              disabled={disabled}
              value={field.value}
              className="form-control"
              onClick={handleClick}
              readOnly={true}
            />
          </>
        )}
      />
    </div>
  );
};
export default ColorButton;
