import React, { useEffect, useState } from "react";
import { Dropdown } from "react-bootstrap";
import { AiOutlineSearch } from "react-icons/ai";
import { get, useFormContext } from "react-hook-form";

import AssignRole from "./AssignRole";
import CreateNewRole from "./Modal/CreateNewRole";
import { ApiCall } from "../../../utils/ApiUtils";
import FormInput from "../../../components/FormInput";

import DropdownIcon from "../../../assets/images/dropdown.png";

const DiscordRoleSelection = ({ index, dataItem, namePrefix, editModal, serveData }) => {
  const { watch, setValue } = useFormContext();
  const groupList = watch("groupList");
  const guildId = watch(`${namePrefix}.guildId`);

  const [show, setShow] = useState(false);
  const [allDiscordRole, setAllDiscordRole] = useState([]);
  const [selectionRole, setSelectionRole] = useState("");

  return (
    <>
      <div className="row">
        <div className="col-lg-3">
          <RenderDashboardMenu
            i={index}
            show={show}
            dataItem={dataItem}
            serveData={serveData}
            editModal={editModal}
            groupItem={groupList[index]}
            mainNamePrefix={namePrefix}
            setSelectionRole={setSelectionRole}
            namePrefix={`${namePrefix}.guildId`}
            setAllDiscordRole={setAllDiscordRole}
            disabled={!groupList[index].assignDiscordRoleOnSelectionFlag}
          />
        </div>
        <div className="col-lg-6 discord-role-select">
          <AssignRole
            show={show}
            setShow={setShow}
            dataItem={dataItem}
            editModal={editModal}
            groupList={groupList[index]}
            namePrefix={namePrefix}
            selection={selectionRole}
            setSelection={setSelectionRole}
            allDiscordRole={allDiscordRole}
            disabled={
              !groupList[index].assignDiscordRoleOnSelectionFlag ||
              !groupList[index]?.assignDiscordRoleOnSelection?.guildId
            }
          />
        </div>
        <div className="col-lg-3">
          <FormInput
            type="color"
            placeholder="Role Color"
            name={`${namePrefix}.roleColor`}
            className="common-role-color position-relative"
            disabled={
              !groupList[index].assignDiscordRoleOnSelectionFlag ||
              !groupList[index]?.assignDiscordRoleOnSelection?.guildId ||
              groupList[index].assignDiscordRoleOnSelection.roleColor === ""
            }
          />
        </div>
        {show && (
          <CreateNewRole
            show={show}
            index={index}
            setShow={setShow}
            guildId={guildId}
            dataItem={dataItem}
            serveData={serveData}
            setGuildId={(val) => setValue(`${namePrefix}.guildId`, val)}
          />
        )}
      </div>
    </>
  );
};

export default DiscordRoleSelection;

const RenderDashboardMenu = ({
  i,
  show,
  disabled,
  dataItem,
  groupItem,
  editModal,
  serveData,
  namePrefix,
  mainNamePrefix,
  setSelectionRole,
  setAllDiscordRole,
}) => {
  const {
    setValue,
    formState: { errors },
  } = useFormContext();
  const error = get(errors, `${namePrefix}`);

  const [selection, setSelection] = useState("");
  const [serverOption, setServerOption] = useState([]);

  const getRoles = async (selectedServer) => {
    try {
      await ApiCall("GET", `/http/discord/getRoles/${selectedServer[0]?.id}`).then(async (result) => {
        const mappedData = result.data.map((item) => ({ roleName: item.name, roleId: item.id, color: item.color }));
        setAllDiscordRole(mappedData);
      });
    } catch (error) {
      setAllDiscordRole([]);
    }
  };

  const handleClose = async (e, id) => {
    if (e.target.innerText !== selection && !!serveData) {
      const selectedServer = serveData?.guildData.id === id ? serveData.guildData : {};
      setValue(`${namePrefix}`, `${selectedServer.id}`, { shouldValidate: true });
      setValue(`${mainNamePrefix}.roleId`, ``);
      setValue(`${mainNamePrefix}.roleColor`, ``);
      setSelectionRole("");
      setSelection(serveData?.guildData?.name);
      getRoles([serveData?.guildData]);
    }
  };

  useEffect(() => {
    if (
      groupItem.assignDiscordRoleOnSelectionFlag &&
      groupItem.assignDiscordRoleOnSelection.guildId !== undefined &&
      groupItem.assignDiscordRoleOnSelection.guildId !== "" &&
      !!serveData &&
      dataItem
    ) {
      const selectedServer =
        serveData?.guildData?.id === groupItem.assignDiscordRoleOnSelection.guildId ? serveData.guildData.roles : [];
      if (selectedServer) {
        setSelection(serveData?.guildData?.name);
        getRoles([serveData?.guildData]);
      }
    }
  }, [editModal, groupItem, dataItem, show, serveData]);

  useEffect(() => {
    if (serveData) {
      setServerOption([serveData.guildData]);
    }
  }, [dataItem, serveData]);

  return (
    <Dropdown className="custom-search-select form-group form-error">
      <Dropdown.Toggle disabled={disabled} id={`select-server-${i}`}>
        <span className="select-data">{selection === "" ? "Server" : selection}</span>
        <img src={DropdownIcon} alt="icon" />
      </Dropdown.Toggle>
      <Dropdown.Menu style={{ width: "auto" }}>
        {serverOption?.length > 0 ? (
          serverOption?.map((item, index) => {
            return (
              <Dropdown.Item onClick={(e) => handleClose(e, item.id)} key={index}>
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
