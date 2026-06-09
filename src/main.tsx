import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import Legend from "./routes/Legend";
import Chapter from "./routes/Chapter";
import Page from "./routes/Page";
import Read from "./routes/Read";
import Search from "./routes/Search";
import MapView from "./routes/Map";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/read/30" replace />} />
        <Route path="/read/:page" element={<Read />} />
        <Route path="/search" element={<Search />} />
        <Route path="/map" element={<MapView />} />
        <Route path="/chapter/:n" element={<Chapter />} />
        <Route path="/page/:n" element={<Page />} />
        <Route path="/legend" element={<Legend />} />
        <Route path="*" element={<Navigate to="/read/30" replace />} />
      </Routes>
    </HashRouter>
  </React.StrictMode>
);
