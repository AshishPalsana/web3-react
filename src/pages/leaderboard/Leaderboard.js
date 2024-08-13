import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { MdStars } from "react-icons/md";
import { AiOutlineInfoCircle } from "react-icons/ai";
import Select from "react-select";
import ReactPaginate from "react-paginate";
import moment from "moment";
import InfiniteScroll from "react-infinite-scroll-component";
import debounce from "lodash.debounce";

import Footer from "../../components/Footer";
import Header from "../../components/Header";
import Blinker from "../../components/Blinker";
import { numFormatter } from "../../utils/common";
import { ApiCall } from "../../utils/ApiUtils";
import { setLeaderboardData, setLoader } from "../../store/reducer";

import { ReactComponent as RedirectIcon } from "../../assets/images/redirect-icon.svg";
import { ReactComponent as Timeclock } from "../../assets/images/timeclock.svg";
import arrowTooltip from "../../assets/images/arrowTooltip.svg";
import firstRank from "../../assets/images/firstRank.svg";
import secondRank from "../../assets/images/secondRank.svg";
import thirdRank from "../../assets/images/thirdRank.svg";
import searchIcon from "../../assets/images/searchIcon.svg";

// Pagination show page options
const options = [
  { value: 10, label: 10 },
  { value: 15, label: 15 },
  { value: 20, label: 20 },
];

// Show record dropdown custom styling
const customStyle = {
  control: (baseStyles) => ({
    ...baseStyles,
    height: "40px",
    backgroundColor: "rgba(255, 255, 255, 12%)",
    border: "none",
    minWidth: "50px",
  }),
  selectContainer: (baseStyles) => ({
    ...baseStyles,
    padding: "0px",
    color: "#fff",
  }),
  indicatorSeparator: (baseStyles) => ({
    ...baseStyles,
    display: "none",
  }),
  menuList: (baseStyles) => ({
    ...baseStyles,
    color: "#fff",
  }),
  option: (baseStyles) => ({
    ...baseStyles,
    backgroundColor: "#af5e96",
    color: "#fff",
  }),
  dropdownIndicator: (baseStyles) => ({
    ...baseStyles,
    padding: "2px",
    boxSizing: "border-box",
    position: "relative",
    right: "1px",
    top: "1px",
    width: "20px",
    color: "#fff",
  }),
  menu: (baseStyles) => ({
    ...baseStyles,
    backgroundColor: "#af5e96",
    margin: "0px",
  }),
  valueContainer: (baseStyles) => ({
    ...baseStyles,
    padding: "0px",
  }),
  singleValue: (baseStyles) => ({
    ...baseStyles,
    color: "#fff",
    paddingLeft: "5px",
  }),
};

// Function to generate the string having weekely contest end date time formatted tooltip.
const getWeekIntervalString = (st, et) => {
  return `from ${moment.unix(st).format("Do MMM")} to ${moment.unix(et).format("Do MMM")}`;
};

const Leaderboard = () => {
  document.title = "H3Y - Leaderboard";

  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parseInt(searchParams.get("page")) || 1;
  const leaderboardData = useSelector(({ leaderboardData }) => leaderboardData);
  const [totalPage, setTotalPage] = useState(1);
  const [dataLimit, setDataLimit] = useState({
    value: window.innerWidth < 991 ? 30 : 10,
    label: window.innerWidth < 991 ? 30 : 10,
  }); // This sets the total data to be shown based on the screen resolution, if the mobile screen is detected then it will show 30 records otherwise 10
  const [searchTxt, setSearchTxt] = useState("");
  const [isThisWeek, setIsThisWeek] = useState(true); // This contains the boolean value to determine whether this week tab is selected or all time
  const [contestEndTimer, setContestEndTimer] = useState({ d: "0", h: "0", m: "0" });

  // Function to calculate and update the contest end timer
  useEffect(() => {
    const calculateTimer = () => {
      const diff = moment.unix(leaderboardData?.time?.endTime).diff(moment());
      const diffDuration = moment.duration(diff).add(1, "minutes");

      setContestEndTimer({ d: diffDuration.days(), h: diffDuration.hours(), m: diffDuration.minutes() });
    };

    calculateTimer(); // Initial calculation

    const timer = setInterval(() => {
      setContestEndTimer((prevTimer) => {
        if (moment.unix(leaderboardData?.time?.endTime) <= moment()) {
          clearInterval(timer);
          return { d: "0", h: "0", m: "0" };
        } else {
          calculateTimer(); // Recalculate timer
          return { ...prevTimer }; // Return previous timer values to prevent unnecessary re-renders
        }
      });
    }, 60000);

    return () => clearInterval(timer); // Clean up timer on unmount
  }, [leaderboardData]);

  // Function to fetch leaderboard data
  const getLeaderboardData = async () => {
    try {
      dispatch(setLoader(true));
      const leaderData = await ApiCall(
        "GET",
        `/rest/allowlist-registrants/getCMLeaderBoardData?page=${page}&limit=${dataLimit.value}&sortBy=${isThisWeek ? "last_7_days_point" : "points"
        }&orderBy=${-1}&discord=${searchTxt}`
      );
      const totalPages = Math.ceil(leaderData?.data?.metadata.total / dataLimit.value);
      setTotalPage(totalPages);
      dispatch(setLeaderboardData(leaderData?.data));
      dispatch(setLoader(false));
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong.");
      dispatch(setLoader(false));
    }
  };

  useEffect(() => {
    if (page < 1 || page > totalPage) {
      setSearchParams({ page: 1 });
    }
    getLeaderboardData();
  }, [page, dataLimit, totalPage, searchTxt, isThisWeek]);

  // Function to handle page click
  const handlePageClick = (event) => {
    setSearchParams({ page: event.selected + 1 });
  };

  // Function to get sorted data based on the selected week
  const getSortedData = (data) => {
    const sortedData = data?.filter((item) => {
      if (isThisWeek) {
        return moment(item?.createdAt) > moment.unix(leaderboardData?.time?.startTime);
      } else {
        return true;
      }
    });

    return sortedData?.reverse((a, b) => new Date(b?.launchedAt) - new Date(a?.launchedAt));
  };

  // Function to handle tab change
  const handleTabChange = (thisWeek) => {
    setSearchTxt("");
    setIsThisWeek(thisWeek);
    setSearchParams({ page: 1 });
  };

  // Function to get the wings icon based on the rank
  const getWings = (item) => {
    if ((isThisWeek && item?.last_7_days_point > 0) || (!isThisWeek && item?.points > 0)) {
      switch (true) {
        case isThisWeek ? item?.last_7_days_rank === 1 : item?.rank === 1:
          return firstRank;
        case isThisWeek ? item?.last_7_days_rank === 2 : item?.rank === 2:
          return secondRank;
        case isThisWeek ? item?.last_7_days_rank === 3 : item?.rank === 3:
          return thirdRank;
      }
    }
  };

  // Function to handle search
  const handleSearch = (e) => {
    setSearchTxt(e.target.value);
  };

  const debouncedResults = useMemo(() => debounce(handleSearch, 800), []);

  useEffect(() => {
    return () => {
      debouncedResults.cancel();
    };
  }, [debouncedResults]);

  const TableBody = () => {
    return leaderboardData?.data?.map((item, index) => (
      <div className={`table-row`} key={index}>
        <div className={`w-10 rank`}>
          {numFormatter(
            isThisWeek
              ? item?.last_7_days_point > 0
                ? item?.last_7_days_rank
                : "-"
              : item?.points > 0
                ? item?.rank
                : "-"
          )}
          <img className="wings-img" src={getWings(item)} />
        </div>
        <div className="w-30 discord">{item?.discord?.split("#")[0] ?? "-"}</div>
        <div className="w-20 address-data">
          <span>{getSortedData(item?.collabs)?.length} </span>
          {getSortedData(item?.collabs)?.length > 0 && (
            <span className="tooltip-address">
              <button className="tooltip-address-btn text-white arrow-tootilp-btn">
                <img src={arrowTooltip} className="arrow-tootilp-img" />
              </button>
              <span className="tooltip-address-box">
                <ul className="list-link">
                  {getSortedData(item?.collabs)?.map((item1, idx) => (
                    // <li key={idx} className={!item1.isActive ? "disable" : ""}>
                    <li key={idx}>
                      <div className="collab-list-item">
                        <span className="text-ellipsis">{item1.allowlistName + " ✕ " + item1.projectName}</span>
                        <a
                          href={`${window.location.protocol}//${process.env.REACT_APP_REGISTER_REDIRECT_URL}/${item1?.urlSlug}`}
                          target="_blank"
                        >
                          <RedirectIcon height={14} width={14} fill="black" />
                        </a>
                      </div>
                    </li>
                  ))}
                </ul>
              </span>
            </span>
          )}
        </div>
        <div className="w-24">
          {isThisWeek ? item?.last_7_days_registrations_count : item?.total_registrations_count}
        </div>
        <div className="w-20 points">
          <MdStars size={20} />
          <span>{isThisWeek ? item?.last_7_days_point : item?.points}</span>
        </div>
      </div>
    ));
  };

  return (
    <>
      <Header />
      <div className="comon-all-body float-start w-100 mt-3">
        <div className="comon-div">
          <div className="container">
            <h1 className="main-haeding text-center text-white"> CM Leaderboard </h1>
            <div
              className={`d-flex align-items-center ${isThisWeek ? "justify-content-between" : "justify-content-end"}`}
            >
              {isThisWeek && (
                <p className="contest-end-time">
                  <Timeclock />
                  <span>
                    {`${contestEndTimer.d}D`} <Blinker /> {`${contestEndTimer.h}H`} <Blinker />{" "}
                    {`${contestEndTimer.m}M`}
                  </span>
                  <div className="custom-tooltip" style={{ cursor: "pointer", top: "-2px" }}>
                    <AiOutlineInfoCircle />
                    <span className="tooltip-text custom-tooltip-bottom text-start p-2">
                      {`Weekly Contest ${getWeekIntervalString(
                        leaderboardData?.time?.startTime,
                        leaderboardData?.time?.endTime
                      )}.`}{" "}
                    </span>
                  </div>
                </p>
              )}
              <div className="leaderboard-tabs-div">
                <div className="search-bar">
                  <input
                    className={`${!!searchTxt ? "not-null" : ""}`}
                    type="text"
                    value={searchTxt}
                    // onChange={debouncedResults}
                    onChange={(e) => setSearchTxt(e?.target?.value)}
                    placeholder="Search Discord ID"
                  />
                  <img src={searchIcon} className="right-icon" />
                </div>
                <button className={`tab-btn ${isThisWeek ? "active" : ""}`} onClick={() => handleTabChange(true)}>
                  This Week
                </button>
                <button className={`tab-btn ${!isThisWeek ? "active" : ""}`} onClick={() => handleTabChange(false)}>
                  All Time
                </button>
              </div>
            </div>
            <div className="comon-from mb-md-5 mt-md-3 mb-4 mt-3">
              <div className="leaderboard">
                <div className="table-header">
                  <div className="table-row">
                    <div className="w-10">Rank</div>
                    <div className="w-30">Discord ID</div>
                    <div className="w-20">
                      Collabs
                      {isThisWeek && (
                        <div className="custom-tooltip" style={{ position: "relative", top: -1, marginLeft: 6 }}>
                          <AiOutlineInfoCircle />
                          <span className="tooltip-text custom-tooltip-bottom">Collabs launched this week.</span>
                        </div>
                      )}
                    </div>
                    <div className="w-24">
                      Registrations
                      {isThisWeek && (
                        <div className="custom-tooltip" style={{ position: "relative", top: -1, marginLeft: 6 }}>
                          <AiOutlineInfoCircle />
                          <span className="tooltip-text custom-tooltip-bottom">
                            Registration received in this week.
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="w-20">Points</div>
                  </div>
                </div>
                <hr />
                <div className="table-body">
                  {leaderboardData.length === 0 || leaderboardData?.data?.length === 0 ? (
                    <div className="px-2 mb-4">
                      <div className="manage-gen-mints-tab launch-sec no-data">
                        <h1 className="mb-0">
                          <i>{leaderboardData?.data === 0 ? "Fetching..." : "No data found."}</i>
                        </h1>
                      </div>
                    </div>
                  ) : (
                    <InfiniteScroll
                      className="mobile-table"
                      dataLength={leaderboardData?.data?.length}
                      next={() => {
                        setDataLimit({ value: dataLimit.value + 10, label: dataLimit.label + 10 });
                        getLeaderboardData();
                      }}
                      hasMore={true}
                      height={"68vh"}
                    >
                      <TableBody />
                    </InfiniteScroll>
                  )}
                  <div className="desktop-table">
                    <TableBody />
                  </div>
                </div>
                <div className="table-footer">
                  <div className="d-flex align-items-center gap-2 show-records">
                    Show{" "}
                    <Select
                      defaultValue={dataLimit}
                      onChange={setDataLimit}
                      options={options}
                      styles={customStyle}
                      isSearchable={false}
                    />
                  </div>
                  <div className="pagination">
                    <ReactPaginate
                      breakLabel="..."
                      nextLabel={<FiChevronRight />}
                      onPageChange={handlePageClick}
                      pageRangeDisplayed={3}
                      marginPagesDisplayed={1}
                      pageCount={totalPage}
                      previousLabel={<FiChevronLeft />}
                      renderOnZeroPageCount={null}
                      activeClassName="active"
                      className="pages"
                      previousLinkClassName="nav-btn"
                      nextLinkClassName="nav-btn"
                      forcePage={page - 1}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Leaderboard;
