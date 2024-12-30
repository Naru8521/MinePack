import { world } from "@minecraft/server";
import DyProp from "./modules/dyProp";

const dyProp = new DyProp(world);

dyProp.set("test", "a");
dyProp.get("test"); // "a"
dyProp.getAllKeys(); // ["test"]
dyProp.getTotalByte();
dyProp.hasKey("test"); // true 
dyProp.remove("test");
dyProp.whileSetArray("test-array", ["a","b"]);
dyProp.whileGetArray("test-array"); // ["a","b"]
dyProp.removeAll();