import React, { useEffect, useState } from "react";
import { BsX } from "react-icons/bs";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { Dropdown } from "react-bootstrap";
import { AiOutlineSearch } from "react-icons/ai";
import { useFieldArray, get, useFormContext } from "react-hook-form";

import { discordRoleVal } from "./GroupsForm";
import { ApiCall } from "../../../utils/ApiUtils";
import FormInput from "../../../components/FormInput";
import DropdownIcon from "../../../assets/images/dropdown.png";

const DiscordRoles = ({ editModal, groupItem, namePrefix }) => {
  const [showToast, setShowToast] = useState(false);
  const allowListMaxDiscordServers = useSelector(({ noLimit }) => noLimit?.allowListMaxDiscordServers);

  const { watch } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    name: namePrefix,
  });

  const discordData = watch(namePrefix);

  useEffect(() => {
    if (showToast) {
      setTimeout(() => {
        setShowToast(false);
      }, 4000);
    }
  }, [showToast]);

  return (
    <>
      <div className="qc comon-input-div mb-0">
        <div className="d-flex align-items-center mb-2 gap-3">
          <span className="red-num-box">1</span> <h5>Discord Role(s) </h5>
        </div>
        {/* <p style={{opacity: 0.75, fontSize: "1rem"}}>Sorry, the HYP3R Bot is currently unavailable or not installed in this server. Please contact the server administrator for assistance.</p> */}
        {fields?.map((items, i) => (
          <div className="row mt-2 position-relative" key={items.id}>
            {fields?.length > 1 && (
              <div className="custom-tooltip set-x-position">
                <button type="button" className="button btn sp-remove p-1" onClick={() => remove(i)}>
                  <BsX />
                </button>
                <span
                  style={{ maxWidth: "100px", left: "calc(100% - 16px)", top: "40px" }}
                  className="tooltip-text custom-tooltip-bottom"
                >
                  Delete Role
                </span>
              </div>
            )}
            <DiscordRolesField
              i={i}
              editModal={editModal}
              groupItem={groupItem}
              namePrefix={namePrefix}
              discordData={discordData}
            />
          </div>
        ))}
      </div>
      <div className="mb-4 mb-md-5">
        <button
          type="button"
          style={{ maxWidth: "90%" }}
          className="btn btn-opt-add mx-auto mt-2"
          onClick={() => {
            if (fields?.length > allowListMaxDiscordServers - 1) {
              setShowToast(true);
              if (!showToast) {
                // toast.error(`Max limit: ${allowListMaxDiscordServers} Discord Role.`);
                toast.error(`Server limit reached.`);
              }
            } else {
              append(discordRoleVal);
            }
          }}
        >
          + Add Discord
        </button>
      </div>
    </>
  );
};

export default DiscordRoles;

const DiscordRolesField = ({ namePrefix, editModal, groupItem, discordData, i }) => {
  const { setValue } = useFormContext();
  const [allDiscordRole, setAllDiscordRole] = useState([]);
  const allowListMaxDiscordRolesInServer = useSelector(({ noLimit }) => noLimit?.allowListMaxDiscordRolesInServer);

  return (
    <>
      <div className="col-lg-4">
        <RenderDashboardMenu
          i={i}
          groupItem={groupItem}
          editModal={editModal}
          namePrefix={namePrefix}
          allDiscordRole={allDiscordRole}
          setAllDiscordRole={setAllDiscordRole}
        />
      </div>
      <div className="col-lg-8 discord-role-select">
        <FormInput
          className="mb-0"
          isSearchable={false}
          type="creatableSelect"
          name={`${namePrefix}.${i}.roles`}
          placeholder="Roles (Must have at least 1)"
          disabled={discordData[i].guildId === ""}
          options={allDiscordRole?.map((item) => ({
            label: item.roleName,
            value: item.roleId,
          }))}
          onChange={(e) => {
            if (e.target.value.length > allowListMaxDiscordRolesInServer) {
              // toast.error(`Max limit: ${allowListMaxDiscordRolesInServer} Roles.`);
              toast.error(`Server roles limit reached.`);
              setValue(`${namePrefix}.${i}.roles`, e.target.value.slice(0, -1));
            }
          }}
        />
      </div>
    </>
  );
};

const RenderDashboardMenu = ({ i, setAllDiscordRole, namePrefix, groupItem, editModal }) => {
  const serverData = useSelector(({ discordServerData }) => discordServerData);

  const {
    setValue,
    formState: { errors },
    trigger,
    getValues,
  } = useFormContext();
  const error = get(errors, `${namePrefix}.${i}.guildId`);

  const [selection, setSelection] = useState("");
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    if (serverData.length > 0 && groupItem?.discordServerRoles[i].guildId !== "") {
      const selectedServerItem = serverData?.filter((item) => item.id === groupItem?.discordServerRoles[i].guildId);
      if (selectedServerItem) {
        setValue(`${namePrefix}.${i}.guildId`, `${selectedServerItem[0]?.id}`, { shouldValidate: true });
        ApiCall("GET", `/http/discord/getRoles/${selectedServerItem[0]?.id}`)
          .then(async (result) => {
            const mappedData = result.data.map((item) => ({ roleName: item.name, roleId: item.id }));
            setAllDiscordRole(mappedData);
          })
          .catch((e) => {
            const values = getValues(`groupList.${0}.discordServerRoles`);
            setValue(
              `groupList.${0}.discordServerRoles`,
              values.map((value) => {
                if (value.guildId === "undefined") return { ...value, guildId: "", id: "", roles: [] };
                else return value;
              })
            );
            toast.error(
              "Sorry, the HYP3R Bot is currently unavailable or not installed in this server. Please contact the server administrator for assistance.",
              { toastId: "discord error " + e }
            );
          });
        setSelection(selectedServerItem[0]?.name);
      }
    }
  }, [groupItem, editModal, serverData]);

  const handleClose = async (e) => {
    await trigger("discordServerRoles");
    if (e.target.innerText !== selection && serverData.length > 0) {
      const selectedServer = serverData?.filter((item) => item?.name === e.target.innerText);
      setSelection(e.target.innerText);
      setValue(`${namePrefix}.${i}.roles`, []);
      if (selectedServer.length > 0) {
        setValue(`${namePrefix}.${i}.guildId`, `${selectedServer[0]?.id}`, { shouldValidate: true });
        ApiCall("GET", `/http/discord/getRoles/${selectedServer[0]?.id}`).then(async (result) => {
          const mappedData = result.data.map((item) => ({ roleName: item.name, roleId: item.id }));
          setAllDiscordRole(mappedData);
        });
      } else {
        setAllDiscordRole([]);
      }
    }
    setSearchText("");
  };

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };

  const displayOptions =
    serverData.length > 0 &&
    serverData
      ?.map((item) => {
        if (item.name.toLowerCase().includes(searchText.toLowerCase())) {
          return item;
        }
        return undefined;
      })
      .filter((item) => item !== undefined);

  return (
    <Dropdown className={`custom-search-select form-group form-error w-100`}>
      <Dropdown.Toggle id={`select-guildId-${i}`} className="text-ellipsis">
        {selection === "" ? "Server" : selection}
        <img src={DropdownIcon} alt="icon" />
      </Dropdown.Toggle>
      <Dropdown.Menu>
        <li className="dropdown-item d-flex align-items-center">
          <AiOutlineSearch className="me-2" />
          <input placeholder="Search Server" onChange={handleSearchChange} value={searchText} />
        </li>
        {displayOptions.length > 0 ? (
          displayOptions?.map((item, index) => {
            return (
              <Dropdown.Item onClick={(e) => handleClose(e)} key={index} className="text-ellipsis">
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
  );
};
