import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./Header";
import Home from "./Home.js";
import Instructions from "./Instructions";
import Confirmation from "./Confirmation";
import Wall from "./Wall";
import Footer from "./Footer";
import Join from "./Join.js";
import Host from "./Host";
import RoleSelect from "./RoleSelect.js";
import AdminLogin from "./adminLogin";
import FindRelative from "./find_relative/FindRelative";
import SetExpireDate from "./setExpireDate";
import AddPerson from "./AddPerson";

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(
    <React.StrictMode>
      <Router>
        <Header />
        <Routes>
          <Route path="/" Component={Home} />
          <Route path="/instructions" Component={Instructions} />
          <Route path="/wall" Component={Wall} />
          <Route path="/find-relative" Component={FindRelative} />
          <Route path="/join" element={<Join />} />
          <Route path="/host" element={<Host />} />
          <Route path="/roleSelect" Component={RoleSelect}></Route>
          <Route path="/admin" Component={AdminLogin}></Route>
          <Route path="/setExpirationDate" Component={SetExpireDate}></Route>
          <Route path="/addPerson" Component={AddPerson} />
          <Route path="*" Component={Home} />
        </Routes>
        <Footer />
      </Router>
    </React.StrictMode>
  );
} else {
  console.error("Root element not found");
}
