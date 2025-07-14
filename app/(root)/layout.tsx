import Header2 from "@/components/mvpblocks/header-2";
import React from "react";

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main>
      <Header2 />
      <div className="pt-16">{children}</div>
    </main>
  );
};

export default RootLayout;
