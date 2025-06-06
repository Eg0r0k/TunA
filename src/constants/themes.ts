import { type BasicColorSchema } from "@vueuse/core";
import { Laptop, LucideIcon, Moon, Sun } from "lucide-vue-next";

interface Theme {
  id: BasicColorSchema;
  icon: LucideIcon;
}

export const THEMES: Theme[] = [
  { id: "light", icon: Sun },
  { id: "dark", icon: Moon },
  { id: "auto", icon: Laptop },
];
