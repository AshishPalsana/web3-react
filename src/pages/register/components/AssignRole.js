import React, { useEffect, useState } from "react";
import { BsX } from "react-icons/bs";
import { Dropdown } from "react-bootstrap";
import { get, useFormContext } from "react-hook-form";

import { ApiCall } from "../../../utils/ApiUtils";

import DropdownIcon from "../../../assets/images/dropdown.png";

const AssignRole = ({
  allDiscordRole,
  disabled,
  namePrefix,
  show,
  setShow,
  editModal,
  groupList,
  dataItem,
  selection,
  setSelection,
}) => {
  const {
    setValue,
    formState: { errors },
  } = useFormContext();

  const error = get(errors, `${namePrefix}.roleId`);
  const [searchSelectMenu, setSearchSelectMenu] = useState(false);

  const filterDiscordRole = allDiscordRole?.filter((item) => item.roleName !== "@everyone");

  const handleClose = (e) => {
    if (e.target.innerText !== selection) {
      const selectedRole = filterDiscordRole?.filter((item) => item?.roleName === e.target.innerText);
      setValue(`${namePrefix}.roleId`, `${selectedRole[0]?.roleId}`, { shouldValidate: true });
      setSelection(e.target.innerText);
      const roleColor = colorToHex(selectedRole[0]?.color);
      roleColor === "00"
        ? setValue(`${namePrefix}.roleColor`, "#000000", { shouldValidate: true })
        : setValue(`${namePrefix}.roleColor`, `#${roleColor}`, { shouldValidate: true });
    }
  };

  useEffect(() => {
    if (
      dataItem &&
      groupList?.assignDiscordRoleOnSelection?.guildId !== "" &&
      groupList?.assignDiscordRoleOnSelection?.guildId !== undefined
    ) {
      ApiCall("GET", `/http/discord/getRoles/${groupList?.assignDiscordRoleOnSelection?.guildId}`).then(
        async (result) => {
          const mappedData = result.data.map((item) => ({ roleName: item.name, roleId: item.id, color: item.color }));
          if (groupList.assignDiscordRoleOnSelection.roleId) {
            const selectedServer = mappedData?.filter(
              (item) => item?.roleId === groupList.assignDiscordRoleOnSelection.roleId
            );
            setSelection(selectedServer[0]?.roleName);
            const roleColor = colorToHex(selectedServer[0]?.color);
            roleColor === "00"
              ? setValue(`${namePrefix}.roleColor`, "#000000", { shouldValidate: true })
              : setValue(`${namePrefix}.roleColor`, `#${roleColor}`, { shouldValidate: true });
          } else {
            setSelection("");
          }
        }
      );
    }
  }, [editModal, groupList, allDiscordRole]);

  const colorToHex = (color) => {
    const hexadecimal = color.toString(16);
    return hexadecimal.length == 1 ? "0" + hexadecimal : hexadecimal;
  };

  const renderOption = (value) => {
    if (selection === value) {
      return <>{value}</>;
    }
    return value;
  };

  return (
    <Dropdown
      className="custom-search-select form-group form-error"
      onToggle={() => setSearchSelectMenu(!searchSelectMenu)}
      disabled
    >
      <Dropdown.Toggle disabled={disabled}>
        {selection === "" ? (
          "Assign Role"
        ) : (
          <span className="selection-chip">
            {selection}
            <BsX
              size="22"
              onClick={() => {
                setSelection("");
                setValue(`${namePrefix}.roleId`, "", { shouldValidate: true });
                setValue(`${namePrefix}.roleColor`, "", { shouldValidate: true });
              }}
            />
          </span>
        )}
        <img src={DropdownIcon} alt="icon" />
      </Dropdown.Toggle>
      {searchSelectMenu && (
        <Dropdown.Menu show={searchSelectMenu}>
          <li className="dropdown-item create-new-role">
            <button type="button" onClick={() => setShow(!show)}>
              + Create New Role
            </button>
          </li>
          {filterDiscordRole?.map((item, index) => {
            return (
              <Dropdown.Item
                className={`checkable-option ${item.roleName === selection ? "checked" : ""}`}
                onClick={(e) => {
                  handleClose(e);
                  setSearchSelectMenu(!searchSelectMenu);
                }}
                key={index}
              >
                <input type="checkbox" />
                <label>{renderOption(item.roleName)}</label>
              </Dropdown.Item>
            );
          })}
        </Dropdown.Menu>
      )}
      {error && (
        <div className="error-text mt-1">
          <span className="info">i</span>
          <span>{error?.message}</span>
        </div>
      )}
    </Dropdown>
  );
};

export default AssignRole;
