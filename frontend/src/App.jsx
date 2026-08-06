import React from "react";
import Routes from "./Routes";
import { AdminAuthProvider } from "./context/AdminAuthContext";
import { ClientAuthProvider } from "./context/ClientAuthContext";

function App() {
  return (
    <AdminAuthProvider>
      <ClientAuthProvider>
        <Routes />
      </ClientAuthProvider>
    </AdminAuthProvider>
  );
}

export default App;
