// Concatenates the four scene modules in film order (01-24).
import { scenes as boot } from "./boot.js";
import { scenes as about } from "./about.js";
import { scenes as arsenal } from "./arsenal.js";
import { scenes as projects } from "./projects.js";

export function buildAll(C, P) {
  return [...boot(C, P), ...about(C, P), ...arsenal(C, P), ...projects(C, P)];
}
