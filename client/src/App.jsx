import { useState } from "react";
import "./App.css";
import EvoCodesAdmin from "./EvoCodesAdmin/EvoCodesAdmin";
import ClientsPage from "./EvoCodesAdmin/Clientspage";
import ServicesPage from "./EvoCodesAdmin/ServicesPage";
import BlogsPage from "./EvoCodesAdmin/BlogsPage";
function App() {
  return (
    <>
      <EvoCodesAdmin />
      <ServicesPage />
    </>
  );
}

export default App;
