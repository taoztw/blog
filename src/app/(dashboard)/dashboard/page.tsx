import AdminDashboard from "@/components/dashboard/dashboard";
import { auth } from "@/server/auth";
import React from "react";

const page = async () => {
  return <AdminDashboard />;
};

export default page;
