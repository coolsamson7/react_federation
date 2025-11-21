import { DI } from "@portal/di";
import { DefaultComponentRegistry } from "@portal/registry";
import "./MFE1Home";


DI.resolve(DefaultComponentRegistry).register("MFE1Home", () =>
  import("./MFE1Home")
);
