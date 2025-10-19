"use client";

import { ReactNode } from "react";
import Layout from "./layout";

interface RootLayoutProps {
  children: ReactNode;
}

function Page() {
  return (
    <main>
      <h1>Garage App</h1>
    </main>
  );
}


export default Page();
