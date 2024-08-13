import React, { useState, useEffect } from "react";
import { Dropdown } from "react-bootstrap";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { GiInfinity } from "react-icons/gi";
import { MdClose } from "react-icons/md";
import moment from "moment";
import InfiniteScroll from "react-infinite-scroll-component";

import { ApiCall, ApiGetFile } from "../../utils/ApiUtils";
import { setDashboardData, setLoader } from "../../store/reducer";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

import searchIcon from "../../assets/images/discoverSearchIcon.svg";
import ArrowRight from "../../assets/images/arrowRightDiscover.png";
import websiteDiscover from "../../assets/images/websiteDiscover.svg";
import chevronDown from "../../assets/images/chevron-down.svg";

// Filter Options
const filterOptions = [
  { value: "Raffle", label: "Raffle" },
  { value: "FCFS", label: "FCFS" },
  { value: "QnA", label: "QnA" },
  // { value: "Active", label: "Active" },
  // { value: "Paused", label: "Paused" },
  // { value: "Over", label: "Over" },
];

// Sort By Options
const sortByOptions = [
  // { value: "winners", label: "No. of Winners: High to Low", orderBy: -1 },
  // { value: "winners", label: "No. of Winners: Low to High", orderBy: 1 },
  // { value: "maxRegistrations", label: "Max. Registrations: High to Low", orderBy: -1 },
  // { value: "maxRegistrations", label: "Max. Registrations: Low to High", orderBy: 1 },
  { value: "launch", label: "Launch Date: Latest", orderBy: -1 },
  { value: "launch", label: "Launch Date: Oldest", orderBy: 1 },
];

const Discover = () => {
  document.title = "H3Y - Discover dashboard";

  const dispatch = useDispatch();

  const dashboardData = useSelector(({ dashboardData }) => dashboardData);

  const [searchTxt, setSearchTxt] = useState("");
  const [sortBy, setSortBy] = useState("launch"); // This contains the key/field of the sort column
  const [orderBy, setOrderBy] = useState(-1); // This contains the asc or desc order for the sort
  const [sortByLabel, setSortByLabel] = useState("Sort By"); // This contains the label of current sort to show in the sort dropdown title
  const [filter, setFilter] = useState([]); // This contains an array of the applied filters
  const [hasMoreValue, setHasMoreValue] = useState(true); // This contains the bool value for the infinite scroll to determine the page has more data to show or not.
  const [logoFiles, setLogoFiles] = useState([]); // This contains an array of project logo file url
  const [iconFiles, setIconFiles] = useState([]); // This contains an array of partner icon file url
  const [selectedFil, setSelectedFil] = useState([]); // This contains an array of the selected  filters regardless if they are applied or not.

  // Function to fetch dashboard data
  const getDashboardData = async (limit = 8) => {
    try {
      dispatch(setLoader(true));
      const dashData = await ApiCall(
        "GET",
        `/rest/allowlist-registrants/getDashboardData?page=${1}&limit=${limit}&sortBy=${sortBy}&orderBy=${orderBy}&search=${searchTxt}&filter=${filter.join(
          "&filter="
        )}`
      );
      dispatch(setDashboardData(dashData?.data));
      dispatch(setLoader(false));
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong.");
      dispatch(setLoader(false));
    }
  };

  // Effect to reset the discover dashboard data if search, sort, or filter applies.
  useEffect(() => {
    dispatch(setDashboardData({ data: [], metadata: {} }));
    getDashboardData();
  }, [searchTxt, orderBy, sortBy, filter]);

  useEffect(() => {
    // Function to fetch images in a loop
    fetchImageInLoop();
  }, [dashboardData]);

  // Logic to inactive the collab based on criteria mentioned in the ticket https://0xytocin.atlassian.net/browse/WL-14
  // const isDisabled = (item) => {
  //   return (
  //     !item.isActive ||
  //     (item?.allowlistGroup[0]?.isSchedule && moment(item?.allowlistGroup[0]?.scheduleStartDate) > moment()) ||
  //     item?.allowlistGroup[0]?.noOfWinners > 0 ||
  //     (item?.allowlistGroup[0]?.isSchedule && moment(item?.allowlistGroup[0]?.scheduleEndDate) <= moment()) ||
  //     (!!item?.allowlistGroup[0]?.maxRegistrations &&
  //       item?.allowlistGroup[0]?.registrants?.length >= item?.allowlistGroup[0]?.maxRegistrations)
  //   );
  // };

  // Function to take the image id from the array of collabs and get the url from another api response and store them into an state array
  const fetchImageInLoop = async () => {
    try {
      const logoPromises = dashboardData?.data?.map(async (item) => {
        const response = await ApiGetFile(item.projectLogo);
        return response;
      });

      const logoResults = await Promise.all(logoPromises);
      setLogoFiles(logoResults);

      const iconPromises = dashboardData?.data?.map(async (item) => {
        const response = await ApiGetFile(item.projectIcon);
        return response;
      });

      const iconResults = await Promise.all(iconPromises);
      setIconFiles(iconResults);
    } catch (error) {
      console.log(error);
    }
  };

  // Function to handle the scroll end event on rows
  const handleOnRowsScrollEnd = () => {
    if (dashboardData?.data?.length < dashboardData?.metadata?.total) {
      setHasMoreValue(true);
      getDashboardData(dashboardData?.metadata?.limit + 8);
    } else {
      setHasMoreValue(false);
    }
  };

  // Function to get the remaining time
  const getEndTime = (endDate) => {
    const diffInMin = moment.duration(moment(endDate).diff(moment())).asMinutes();
    if (diffInMin > 1440) return `${Math.round(moment.duration(moment(endDate).diff(moment())).asDays())} days`;
    if (diffInMin > 60) return `${Math.round(moment.duration(moment(endDate).diff(moment())).asHours())} hours`;
    else return `${Math.round(diffInMin)} minutes`;
  };

  return (
    <>
      <Header />
      <div className="comon-all-body float-start w-100 mt-3">
        <div className="comon-div">
          <div className="discover container">
            <h1 className="main-haeding text-center text-white"> Discover Collabs </h1>
            <div className="discover-section">
              <div className="top-section">
                <li className="search-bar">
                  <input
                    type="text"
                    value={searchTxt}
                    onChange={(e) => setSearchTxt(e.target.value)}
                    placeholder="Search"
                  />
                  <img src={searchIcon} className="right-icon" />
                </li>
                {filter.length > 0 && (
                  <div className="filter-options">
                    {filter.map((item, index) => (
                      <span>
                        {item}{" "}
                        <MdClose
                          onClick={() => {
                            const fil = [...filter];
                            fil.splice(index, 1);
                            setFilter(fil);
                            const fill = [...selectedFil];
                            fill.splice(index, 1);
                            setSelectedFil(fill);
                          }}
                        />
                      </span>
                    ))}
                    <p
                      onClick={() => {
                        setSelectedFil([]);
                        setFilter([]);
                      }}
                    >
                      |&nbsp;&nbsp;Clear All
                    </p>
                  </div>
                )}
              </div>
              <div className="top-sec-filter">
                <Dropdown className="sortby-dropdown">
                  <Dropdown.Toggle id="dropdown-autoclose-true">
                    {sortByLabel}
                    <img src={chevronDown} width="10" height="10" alt="chevron-right" className="sortby-icon" />
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    {sortByOptions?.map((item) => (
                      <Dropdown.Item>
                        <label
                          onClick={() => {
                            setSortBy(item.value);
                            setOrderBy(item.orderBy);
                            setSortByLabel(item.label);
                          }}
                        >
                          {item.label}
                        </label>
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
                <Dropdown className="filter-dropdown" autoClose="outside">
                  <Dropdown.Toggle id="dropdown-autoclose-outside">
                    {`Filter${filter.length > 0 ? ` (${filter.length})` : ""}`}
                    <img src={chevronDown} width="10" height="10" alt="chevron-right" className="filter-icon" />
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <div
                      className={`${selectedFil.length === 0 && filter.length === 0 ? "disabled" : ""}`}
                      onClick={() => {
                        setSelectedFil([]);
                        setFilter([]);
                      }}
                    >
                      Clear all
                    </div>
                    {filterOptions?.map((item) => (
                      <p>
                        <input
                          type="checkbox"
                          name="filter"
                          value={item.value}
                          checked={selectedFil.includes(item.value)}
                          onChange={(e) => {
                            const fil = [...selectedFil];
                            const index = fil.indexOf(e.target.value);
                            if (index !== -1) fil.splice(index, 1);
                            else fil.push(e.target.value);
                            setSelectedFil(fil);
                          }}
                        />
                        <label>{item.label}</label>
                      </p>
                    ))}
                    <button
                      className="filter-apply-btn"
                      disabled={selectedFil.length === 0}
                      onClick={() => {
                        setFilter(selectedFil);
                      }}
                    >
                      Apply
                    </button>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            </div>
            <label className="search-result mt-2">{`${dashboardData?.metadata?.total === 1
                ? `${dashboardData?.metadata?.total} Collab found`
                : `${dashboardData?.metadata?.total || 0} Collabs found`
              }`}</label>
            {dashboardData && dashboardData?.data?.length > 0 ? (
              <InfiniteScroll
                className="mt-3"
                dataLength={dashboardData?.data?.length}
                next={handleOnRowsScrollEnd}
                hasMore={hasMoreValue}
                height={"105vh"}
              >
                <div className="row">
                  {dashboardData?.data?.map((item, index) => (
                    <div className="col-lg-6 col-md-12 col-sm-12 mb-4" key={index}>
                      {/* <div className="collab-card blur-box" style={{ opacity: isDisabled(item) ? 0.75 : 1 }}> */}
                      <div className="collab-card blur-box">
                        <div className="collab-head-sec blur-box">
                          <span
                            className="status-dot"
                          // className={`status-dot
                          //     ${!item.isActive ||
                          //     (item?.allowlistGroup[0]?.isSchedule &&
                          //       moment(item?.allowlistGroup[0]?.scheduleStartDate) > moment())
                          //     ? "paused"
                          //     : ""
                          //   }
                          //     ${item?.allowlistGroup[0]?.noOfWinners > 0 ||
                          //     (item?.allowlistGroup[0]?.isSchedule &&
                          //       moment(item?.allowlistGroup[0]?.scheduleEndDate) <= moment()) ||
                          //     (!!item?.allowlistGroup[0]?.maxRegistrations &&
                          //       item?.allowlistGroup[0]?.registrants?.length >=
                          //       item?.allowlistGroup[0]?.maxRegistrations)
                          //     ? "inactive"
                          //     : ""
                          //   }
                          // `}
                          />
                          <div className="collab-title">
                            <div className="logo">
                              <img
                                src={logoFiles.find((item1) => item1?._id === item?.projectLogo)?.path}
                                loading="lazy"
                              />
                            </div>
                            <div className="icon">
                              {iconFiles.find((item1) => item1?._id === item?.projectIcon)?.path ? (
                                <img
                                  src={iconFiles.find((item1) => item1?._id === item?.projectIcon)?.path}
                                  loading="lazy"
                                  className="partner-logo"
                                />
                              ) : (
                                <div>
                                  <span>{item.projectName?.substring(0, 1)}</span>
                                </div>
                              )}
                            </div>
                            <div className="title-names">
                              <p className="d-flex">
                                {" "}
                                <div className="text-ellipsis">
                                  <img src="images/discord-white.png" alt="discord" />
                                  <span className="text-ellipsis">{item.allowListName}</span>
                                </div>
                                &nbsp;<label className="d-flex align-items-center"> x </label>
                              </p>
                              <span className="text-ellipsis">{item.projectName}</span>
                            </div>
                          </div>
                          <div className="collab-status">
                            {item.twitter && item.twitter?.user && (
                              <a href={`https://twitter.com/${item.twitter?.user?.username}`} target="_blank">
                                <img src="images/twitter-white.png" alt="twitter" />
                              </a>
                            )}
                            <a href={item.projectWebsite} target="_blank">
                              <img src={websiteDiscover} alt="websiteDiscover" />
                            </a>
                          </div>
                        </div>
                        <div className="collab-info-sec">
                          <div className="collab-group">
                            <p className="text-ellipsis">{item?.allowlistGroup[0]?.groupName || "-"}</p>
                            <div>
                              <span>
                                {item?.allowlistGroup[0]?.groupType === "first-come" && "FCFS"}
                                {item?.allowlistGroup[0]?.groupType === "raffle" && "RAFFLE"}
                                {item?.allowlistGroup[0]?.groupType === "qna" && "QnA"}
                                {item?.allowlistGroup[0]?.groupType === "public" ||
                                  (!item?.allowlistGroup[0]?.groupType && "PUBLIC")}
                              </span>
                            </div>
                          </div>
                          <div
                            className="collab-group-detail"
                            // style={{
                            //   marginTop:
                            //     (!item?.allowlistGroup[0]?.isSchedule &&
                            //       item?.allowlistGroup[0]?.groupType !== "raffle" &&
                            //       "48px") ||
                            //     ((!item?.allowlistGroup[0]?.isSchedule ||
                            //       item?.allowlistGroup[0]?.groupType !== "raffle") &&
                            //       "36px"),
                            // }}
                            style={{
                              marginTop: item?.allowlistGroup[0]?.groupType !== "raffle" && "28px",
                            }}
                          >
                            <div>
                              {item?.allowlistGroup[0]?.groupType === "raffle" && (
                                <p>
                                  Winners: <span>{Math.floor(item?.allowlistGroup[0]?.noOfWinners) || 0}</span>
                                </p>
                              )}
                              <p>
                                Max Registrations:{" "}
                                <span>
                                  {item?.allowlistGroup[0]?.maxRegistrations ? (
                                    item?.allowlistGroup[0]?.maxRegistrations
                                  ) : (
                                    <GiInfinity />
                                  )}{" "}
                                </span>
                              </p>
                              {item?.allowlistGroup[0]?.isSchedule &&
                                (moment
                                  .duration(moment(item?.allowlistGroup[0]?.scheduleEndDate).diff(moment()))
                                  .asHours() <= 0 ? (
                                  <p>Registration over</p>
                                ) : (
                                  <p>
                                    Ends in: <span>{getEndTime(item?.allowlistGroup[0]?.scheduleEndDate)}</span>
                                  </p>
                                ))}
                            </div>
                            <div className="custom-tooltip">
                              <a
                                // className={`reg-btn ${isDisabled(item) ? "disable" : ""}`}
                                className={`reg-btn`}
                                // href={
                                //   !isDisabled(item) &&
                                //   `${window.location.protocol}//${process.env.REACT_APP_REGISTER_REDIRECT_URL}/${item?.urlSlug}`
                                // }
                                href={`${window.location.protocol}//${process.env.REACT_APP_REGISTER_REDIRECT_URL}/${item?.urlSlug}`}
                                target="_blank"
                              >
                                Register
                                <img src={ArrowRight} />
                              </a>
                              {/* {isDisabled(item) && (
                                <span className={`tooltip-text custom-tooltip-bottom`}>
                                  {!item.isActive
                                    ? "Registration paused."
                                    : item.allowlistGroup[0].isSchedule
                                      ? moment(item.allowlistGroup[0].scheduleStartDate) > moment()
                                        ? "Registration not started."
                                        : moment(item.allowlistGroup[0].scheduleEndDate) <= moment()
                                          ? "Registrations over."
                                          : item.allowlistGroup[0].noOfWinners > 0
                                            ? "Registration over."
                                            : !!item.allowlistGroup[0].maxRegistrations &&
                                            item.allowlistGroup[0].registrants.length >=
                                            item.allowlistGroup[0].maxRegistrations &&
                                            "Registration over."
                                      : item.allowlistGroup[0].noOfWinners > 0
                                        ? "Registration over."
                                        : !!item.allowlistGroup[0].maxRegistrations &&
                                        item.allowlistGroup[0].registrants.length >=
                                        item.allowlistGroup[0].maxRegistrations &&
                                        "Registration over."}
                                </span>
                              )} */}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </InfiniteScroll>
            ) : (
              <div className="px-2">
                <div className="manage-gen-mints-tab launch-sec no-data">
                  <h1 className="mb-0">
                    <i>No data found.</i>
                  </h1>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Discover;
