import * as React from "react";
import * as ReactDOM from "react-dom";

import { Provider } from "react-redux";
import { persistStore } from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";

import { App } from "./components/controllers/App";
import { _catch_ } from "./components/views/ErrorBoundary";
import { onLoad } from "./lib/util/onLoad";
import { configureStore } from "./store/configureStore";

import "./styles/index.scss";

export const store = configureStore();

onLoad("RenXCS");

ReactDOM.render(
    _catch_(<Provider store={store}>
        <PersistGate loading={null} persistor={persistStore(store)}>
            <App />
        </PersistGate>
    </Provider>),
    document.getElementById("root") as HTMLElement
);
