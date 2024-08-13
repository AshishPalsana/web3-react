import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { PersistGate } from "redux-persist/integration/react";
import { persistStore } from "redux-persist";
import { Provider } from "react-redux";
import { EthereumClient, w3mConnectors, w3mProvider } from "@web3modal/ethereum";
import { Web3Modal } from "@web3modal/react";
import { WagmiConfig, configureChains, createClient } from "wagmi";
import { goerli, mainnet, polygon, fantom } from "wagmi/chains";
import { SkeletonTheme } from "react-loading-skeleton";

import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { AuthProvider } from "./hooks/useAuth";
import { store } from "./store";
import config from "../src/utils/config.json";

import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "react-datepicker/dist/react-datepicker.css";
import "react-loading-skeleton/dist/skeleton.css";
import "./index.css";

// Create persistor
let persistor = persistStore(store);

const root = ReactDOM.createRoot(document.getElementById("root"));

// Configure wagmi and web3modal
const projectId = config.WALLETCONNECT_PROJECT_ID;

const chains = [goerli, mainnet, polygon, fantom];
const { provider } = configureChains(chains, [w3mProvider({ projectId })]);
const wagmiClient = createClient({
  autoConnect: true,
  connectors: w3mConnectors({ version: 1, projectId, chains }),
  provider,
});
const ethereumClient = new EthereumClient(wagmiClient, chains);

root.render(
  // <React.StrictMode>
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <BrowserRouter>
        <AuthProvider>
          <SkeletonTheme baseColor="transparent" highlightColor="#ffffff">
            <WagmiConfig client={wagmiClient}>
              <App />
            </WagmiConfig>
            <Web3Modal
              ethereumClient={ethereumClient}
              projectId={projectId}
              themeVariables={{
                "--w3m-font-family": "KarlaMedium",
                "--w3m-accent-color": "#cd46f4",
                "--w3m-background-border-radius": "12px",
                "--w3m-accent-fill-color": "#ffffff",
                "--w3m-background-color": "#cd46f4",
                "--w3m-container-border-radius": "12px",
                "--w3m-text-big-bold-font-family": "KarlaMedium",
                "--w3m-z-index": "9999",
                "--w3m-text-medium-regular-font-family": "KarlaMedium",
              }}
              themeMode={"dark"}
            />
          </SkeletonTheme>
        </AuthProvider>
      </BrowserRouter>
    </PersistGate>
  </Provider>
  // {/* </React.StrictMode> */}
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
