import React, { useEffect, useState, useRef } from "react";
import Slider from "react-slick";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FiChevronRight, FiChevronLeft } from "react-icons/fi";

import Header from "../../components/Header";
import Launched from "./components/Launched";
import Draft from "./components/Draft";
import Footer from "../../components/Footer";

import { ApiCall } from "../../utils/ApiUtils";
import {
  setCurrentFormStep,
  setDiscordServerData,
  setIsEditUserId,
  setIsNextFetch,
  setLoader,
  setNoLimit,
  setSavedFirstStep,
  setSaveDraftData,
} from "../../store/reducer";

import searchIcon from "../../assets/images/searchIcon.svg";
import ArrowRight from "../../assets/images/arrow.svg";

const Manage = () => {
  document.title = "H3Y - Manage";

  const { state, pathname } = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const customSlider = useRef();

  const isNextFetch = useSelector(({ isNextFetch }) => isNextFetch);
  const numberOfAllowlist = useSelector(({ noLimit }) => noLimit?.numberOfAllowlist);

  const [draftData, setDraftData] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [deployedData, setDeployedData] = useState([]);
  const [filterData, setFilterData] = useState([]);
  const [sliderIndex, setSliderIndex] = useState(0);
  const [searchTxt, setSearchTxt] = useState("");
  const [pillsTab, setPillsTab] = useState("Launched");

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchData();
  }, []);

  useEffect(() => {
    if (customSlider.current && state?.index) {
      customSlider.current.slickGoTo(state.index);
      navigate(pathname, {});
    }
  });

  useEffect(() => {
    if (showToast) {
      setTimeout(() => {
        setShowToast(false);
      }, 2000);
    }
  }, [showToast]);

  const fetchData = async () => {
    try {
      dispatch(setLoader(true));
      const result = await ApiCall("GET", `/rest/allowlist`);
      const LimitsResult = await ApiCall("GET", `/rest/allowlist/getAllowListLimits`);
      const botGuildsResponse = await ApiCall("GET", `/http/discord/getBotGuilds`);

      dispatch(setDiscordServerData(botGuildsResponse?.data));
      dispatch(
        setNoLimit({
          numberOfGroups: LimitsResult?.data?.maxAllowListGroups,
          numberOfAllowlist: LimitsResult?.data?.maxAllowLists,
          allowListMaxDiscordRolesInServer: LimitsResult?.data?.allowListMaxDiscordRolesInServer,
          allowListMaxDiscordServers: LimitsResult?.data?.allowListMaxDiscordServers,
        })
      );
      const deployedDataRes = result.data
        ?.filter((item) => item.status === "deployed")
        .sort((a, b) => {
          return new Date(b.launchedAt) - new Date(a.launchedAt);
        });
      setDeployedData(deployedDataRes);
      const deployedDraftRes = result.data
        ?.filter((item) => item.status === "draft")
        .sort((a, b) => {
          return new Date(b.launchedAt) - new Date(a.launchedAt);
        });
      setDraftData(deployedDraftRes);
      dispatch(setLoader(false));

      dispatch(
        setIsNextFetch({
          ...isNextFetch,
          [deployedDataRes[0]?.id]: true,
        })
      );
    } catch (error) {
      dispatch(setLoader(false));
      toast.error("Failed to load. Please try again later.");
      console.log(error);
    }
  };

  // This will filter the data based on search texts.
  useEffect(() => {
    const filteredData = deployedData.filter((item) => {
      return (
        (item?.projectName).toLocaleLowerCase().search(searchTxt.toLocaleLowerCase()) >= 0 ||
        (item?.allowListName).toLocaleLowerCase().search(searchTxt.toLocaleLowerCase()) >= 0
      );
    });
    setFilterData(filteredData);

    if (filteredData.length !== deployedData.length) {
      customSlider?.current?.slickGoTo(0);
    }
  }, [deployedData, searchTxt]);

  useEffect(() => {
    if (filterData?.length === 0) {
      setSliderIndex(0);
    }
  }, [filterData]);

  const gotoNext = () => {
    customSlider.current.slickNext();
    dispatch(
      setIsNextFetch({
        ...isNextFetch,
        [filterData[sliderIndex + 1]?.id]: true,
      })
    );
  };

  const gotoPrev = () => {
    customSlider.current.slickPrev();
  };

  const handlePause = async (id) => {
    try {
      dispatch(setLoader(true));
      await ApiCall("PATCH", `/rest/allowlist/${id}/pause/${false}`);
      fetchData();
      dispatch(setLoader(false));
      toast.success("Registrations have been paused.");
    } catch (error) {
      console.log(error);
      dispatch(setLoader(false));
      toast.error("Failed to pause. Please try again later.");
    }
  };

  const handleResume = async (id) => {
    try {
      dispatch(setLoader(true));
      await ApiCall("PATCH", `/rest/allowlist/${id}/pause/${true}`);
      fetchData();
      dispatch(setLoader(false));
      toast.success("Registrations are now resumed.");
    } catch (error) {
      console.log(error);
      dispatch(setLoader(false));
      toast.error(
        "You have reached the maximum limit to launch a collab. Please pause an existing collab to launch a new one."
      );
    }
  };

  const gotoBasicForm = () => {
    const resumeData = deployedData?.filter((item) => item?.isActive);
    if (numberOfAllowlist > resumeData?.length) {
      localStorage.removeItem("groupForm");
      localStorage.removeItem("basicForm");

      dispatch(setSaveDraftData(null));
      dispatch(setSavedFirstStep(null));
      dispatch(setIsEditUserId(false));
      dispatch(setCurrentFormStep(1));
      navigate("/launch");
    } else {
      setShowToast(true);
      !showToast &&
        toast.error(
          "You have reached the maximum limit to launch a collab. Please pause an existing collab to launch a new one."
        );
    }
  };

  const settings = {
    className: "center",
    centerMode: true,
    Infinity: false,
    infinite: false,
    arrows: false,
    centerPadding: "400px",
    slidesToShow: 1,
    draggable: false,
    beforeChange: (current, next) => setSliderIndex(next),
    afterChange: (current) => setSliderIndex(current),
    speed: 500,
    centerMode: true,
    accessibility: false,
    responsive: [
      {
        breakpoint: 1800,
        settings: {
          centerPadding: "300px",
        },
      },
      {
        breakpoint: 1600,
        settings: {
          centerPadding: "200px",
        },
      },
      {
        breakpoint: 1400,
        settings: {
          centerPadding: "150px",
        },
      },
      {
        breakpoint: 1280,
        settings: {
          centerPadding: "100px",
        },
      },
      {
        breakpoint: 1024,
        settings: {
          centerPadding: "50px",
        },
      },
      {
        breakpoint: 767,
        settings: {
          centerPadding: "30px",
        },
      },
    ],
  };

  return (
    <>
      <Header />
      <div className="comon-all-body float-start w-100 mt-3">
        <div className="comon-div">
          <div className="container">
            <h1 className="main-haeding text-center text-white">Manage Collabs</h1>
          </div>
          <div className="my-md-5 my-4 allowlists-carusal">
            <div className="tabs-section">
              <div className="tab-content mb-md-5 mb-4" id="pills-tabContent">
                <div
                  className={`tab-pane fade ${pillsTab === "Launched" ? "active show" : ""}`}
                  id="pills-launched"
                  role="tabpanel"
                >
                  {(deployedData?.length === 0 || deployedData?.length === undefined) && pillsTab === "Launched" ? (
                    <>
                      <div className="container px-0">
                        <div className="allowlists-right-part draft-wrapper">
                          <div className="d-flex align-items-center gap-2 justify-content-between">
                            <TabMenu pillsTab={pillsTab} setPillsTab={setPillsTab} />
                          </div>
                        </div>
                      </div>
                      <div className="container">
                        <div className="manage-gen-mints-tab launch-sec d-block text-center no-data">
                          <div>
                            <p className="mb-4">Go ahead and launch your first collab</p>
                            <button
                              onClick={gotoBasicForm}
                              className="btn next-btn mx-auto"
                              style={{ minWidth: "200px" }}
                            >
                              <span>Launch</span>
                              <span className="d-flex">
                                <img src={ArrowRight} alt="Icon" />
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="container px-0">
                        <div className="allowlists-right-part draft-wrapper">
                          <div className="d-flex align-items-center gap-2 justify-content-between">
                            <TabMenu pillsTab={pillsTab} setPillsTab={setPillsTab} />
                            <ul className="d-flex align-items-center gap-2" style={{ height: 28 }}>
                              <div className="btn new-collab-btn" onClick={gotoBasicForm}>
                                <span className="icon">+</span>
                                <span className="text">New Collab</span>
                              </div>
                              <li className="search-bar">
                                <input
                                  type="text"
                                  value={searchTxt}
                                  onChange={(e) => setSearchTxt(e.target.value)}
                                  placeholder="Search Collab"
                                />
                                <img src={searchIcon} className="right-icon" />
                              </li>
                              <li className="slick-arrow-btn">
                                <button
                                  disabled={sliderIndex === 0 || filterData?.length === 0}
                                  onClick={() => {
                                    gotoPrev();
                                  }}
                                >
                                  <FiChevronLeft />
                                </button>
                              </li>
                              <li className="slick-arrow-btn">
                                <button
                                  disabled={
                                    filterData?.length - `${filterData?.length === 0 ? 0 : 1}` === sliderIndex ||
                                    filterData?.length === 0
                                  }
                                  onClick={() => {
                                    gotoNext();
                                  }}
                                >
                                  <FiChevronRight />
                                </button>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      <Slider {...settings} ref={customSlider}>
                        {filterData?.length !== 0 ? (
                          filterData?.map((item, index) => (
                            <div key={index} className="px-2">
                              <div className="manage-gen-mints-tab">
                                <Launched
                                  dataItem={item}
                                  handlePause={handlePause}
                                  handleResume={handleResume}
                                  fetchData={fetchData}
                                  isSearchFetch={searchTxt ? index === 0 : false}
                                  // isFound={filterData.length === 1}
                                  index={index}
                                  activeAllowlistId={filterData[sliderIndex]?.id}
                                />
                              </div>
                              <div className="manage-gen-mints-tab launch-sec launch-new">
                                <p>Looking to launch another collab?</p>
                                <button onClick={gotoBasicForm} className="btn next-btn m-0">
                                  <span>Launch Now</span>
                                  <span className="d-flex">
                                    <img src={ArrowRight} alt="Icon" />
                                  </span>
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="px-2">
                            <div className="manage-gen-mints-tab launch-sec no-data">
                              <h1 className="mb-0">
                                <i>No data found.</i>
                              </h1>
                            </div>
                          </div>
                        )}
                      </Slider>
                    </>
                  )}
                </div>
                <div
                  className={`tab-pane fade ${pillsTab === "Darft" ? "active show" : ""}`}
                  id="pills-drafts"
                  role="tabpanel"
                >
                  <>
                    <div className="container px-0">
                      <div className="allowlists-right-part draft-wrapper">
                        <div className="d-flex align-items-center gap-2 justify-content-between">
                          <TabMenu pillsTab={pillsTab} setPillsTab={setPillsTab} />
                        </div>
                      </div>
                    </div>
                    <div className="container">
                      {draftData?.length === 0 ? (
                        <div className="manage-gen-mints-tab launch-sec d-block text-center no-data">
                          <div>
                            <p className="mb-4">No drafts so far</p>
                            <button
                              onClick={gotoBasicForm}
                              className="btn next-btn mx-auto"
                              style={{ minWidth: "200px" }}
                            >
                              <span>Launch</span>
                              <span className="d-flex">
                                <img src={ArrowRight} alt="Icon" />
                              </span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <Draft draftData={draftData} fetchData={fetchData} deployedData={deployedData} />
                      )}
                    </div>
                  </>
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

const TabMenu = ({ pillsTab, setPillsTab }) => (
  <ul className="nav nav-pills align-items-center mx-0" id="pills-tab" role="tablist">
    <li className="nav-item" role="presentation">
      <button
        onClick={() => setPillsTab("Launched")}
        className={`nav-link ${pillsTab === "Launched" ? "active" : "inactive"}`}
        id="pills-home-tab"
        data-bs-toggle="pill"
        data-bs-target="#pills-launched"
        type="button"
        role="tab"
      >
        Launched
      </button>
    </li>
    <li className="nav-item" role="presentation">
      <button
        onClick={() => setPillsTab("Darft")}
        className={`nav-link  ${pillsTab === "Darft" ? "active" : "inactive"}`}
        id="pills-profile-tab"
        data-bs-toggle="pill"
        data-bs-target="#pills-drafts"
        type="button"
        role="tab"
      >
        Drafts
      </button>
    </li>
  </ul>
);

export default Manage;
