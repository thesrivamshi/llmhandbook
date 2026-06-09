import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import Legend from "./routes/Legend";
import Chapter from "./routes/Chapter";
import Page from "./routes/Page";
import Read from "./routes/Read";
import Search from "./routes/Search";
import MapView from "./routes/Map";
import Tasks from "./routes/Tasks";
import Quiz from "./routes/Quiz";
import Glossary from "./routes/Glossary";
import Marks from "./routes/Marks";
import "./index.css";

// Resume where you left off: land on the last page read (default 30).
function Resume() {
  let last = 30;
  try {
    const v = Number(localStorage.getItem("vb-last-page"));
    if (v >= 1 && v <= 523) last = v;
  } catch {
    /* ignore */
  }
  return <Navigate to={`/read/${last}`} replace />;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<Resume />} />
        <Route path="/read/:page" element={<Read />} />
        <Route path="/search" element={<Search />} />
        <Route path="/glossary" element={<Glossary />} />
        <Route path="/marks" element={<Marks />} />
        <Route path="/map" element={<MapView />} />
        <Route path="/build" element={<Tasks />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/chapter/:n" element={<Chapter />} />
        <Route path="/page/:n" element={<Page />} />
        <Route path="/legend" element={<Legend />} />
        <Route path="*" element={<Resume />} />
      </Routes>
    </HashRouter>
  </React.StrictMode>
);
