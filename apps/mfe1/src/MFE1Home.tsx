import React from "react";
import { DI } from "@portal/di";
import { DefaultComponentRegistry } from "@portal/registry";

export default function MFE1Home() {
  return <div>MFE1 Home Page</div>;
}

// Register component in DI
DI.resolve(DefaultComponentRegistry).register("MFE1Home", () => import("./MFE1Home"));
