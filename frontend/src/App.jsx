import React from "react";
import Routes from "./Routes";
import { AdminAuthProvider } from "./context/AdminAuthContext";
import { ClientAuthProvider } from "./context/ClientAuthContext";
import { PartnerAuthProvider } from "./context/PartnerAuthContext";

function App() {
  return (
    <AdminAuthProvider>
      <ClientAuthProvider>
        <PartnerAuthProvider>
          <Routes />
        </PartnerAuthProvider>
      </ClientAuthProvider>
    </AdminAuthProvider>
  );
}

export default App;
