import { useState } from "react";
import "./App.css";
import { AuthProvider } from "./EvoCodesAdmin/AuthContext";
import EvoCodesAdmin from "./EvoCodesAdmin/EvoCodesAdmin";

function App() {
  return (
    <AuthProvider>
      <EvoCodesAdmin />
    </AuthProvider>
  );
}

export default App;