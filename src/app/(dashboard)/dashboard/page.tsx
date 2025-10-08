import AdminDashboard from "./_components/dashboard";
import { auth } from "@/server/auth";
import React from "react";

const page = async () => {
  return <AdminDashboard />;
};

export default page;
