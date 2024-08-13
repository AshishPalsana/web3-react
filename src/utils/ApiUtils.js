import axios from "axios";
import { toast } from "react-toastify";

// API endpoints
export const API_AUTH_URL = process.env.REACT_APP_API_AUTH_URL;
export const API_FILES_URL = process.env.REACT_APP_API_FILES_URL;
export const API_ALLOWLIST_URL = process.env.REACT_APP_API_ALLOWLIST_URL;

// Function to make API calls
export const ApiCall = async (method = "GET", path, data = {}) => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios({
      method,
      url: API_ALLOWLIST_URL + path,
      data,
      headers: {
        Authorization: "Bearer " + token,
      },
    });
    return res.data;
  } catch (error) {
    if (error?.response?.data?.status === 401) {
      toast.error("Session expired! Please authenticate again.");
      localStorage.clear();
      window.location.replace("/");
    } else {
      throw error;
    }
  }
};

// Function to authenticate user
export const ApiAuth = async (data) => {
  try {
    let resp = null;
    const token = localStorage.getItem("token");
    const res = await axios.post(API_AUTH_URL + "/rest/auth/login", data, {
      headers: {
        Authorization: "Bearer " + token,
      },
    });
    if (res.data && res.status === 200) {
      resp = res.data;
    } else {
      throw new Error(res?.data?.message || "Auth api Error");
    }
    return resp;
  } catch (error) {
    if (error?.response?.data?.status === 500) {
      toast.error(
        <p>
          Sorry! You don't have access to this product yet.{" "}
          <a
            target="_blank"
            href={`${process.env.REACT_APP_DISCORD_JOIN_LINK}`}
          >
            Join Discord
          </a>
        </p>
      );
    } else {
      toast.error(error?.response?.data?.status?.message || "Something went wrong.");
    }
  }
};

// Function to upload a file
export const ApiFileUpload = async (file, id) => {
  try {
    const fileFormData = new FormData();
    fileFormData.append("file", file, file.name);
    const token = localStorage.getItem("token");
    const res = await axios.post(`${API_FILES_URL}/rest/files/upload${id ? "/" + id : ""}`, fileFormData, {
      headers: {
        Authorization: "Bearer " + token,
      },
    });
    return res.data;
  } catch (error) {
    if (error?.response?.data?.status === 401) {
      toast.error("Session expired! Please authenticate again.");
      localStorage.clear();
      window.location.replace("/");
    } else {
      throw error;
    }
  }
};

// Function to get file by ID
export const ApiGetFile = async (fileId) => {
  try {
    if (!fileId) return;
    const res = await axios.get(`${API_FILES_URL}/rest/files/getFileById/${fileId}`);
    return res.data;
  } catch (error) {
    if (error?.response?.data?.status === 401) {
      toast.error("Session expired! Please authenticate again.");
      localStorage.clear();
      window.location.replace("/");
    } else {
      throw error;
    }
  }
};

// Function to extract Twitter username from a URL
export const getTwitterUserName = (val) => {
  let parsedVal = val;
  if (parsedVal.startsWith("https://")) {
    parsedVal = parsedVal.match(/https?:\/\/(www\.)?twitter\.com\/(#!\/)?@?([^\/]*)/)[3];
  }
  parsedVal = parsedVal.replace(/[^a-zA-Z0-9_]/g, "");
  return parsedVal;
};

// Function to display a shortened version of a Twitter tweet
export const getlikeRTTweet = (val) => {
  let parsedVal = val;
  if (parsedVal.startsWith("https://twitter.com/")) {
    parsedVal = parsedVal?.substring(0, 5) + "...." + parsedVal?.substring(parsedVal.length - 9);
    return parsedVal;
  } else return false;
};
