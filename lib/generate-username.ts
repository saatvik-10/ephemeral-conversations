import { nanoid } from "nanoid";
import { USERNAME } from "../constants/username";

export const generateUsername = () => {
  const username = USERNAME[Math.floor(Math.random() * USERNAME.length)];
  return `unknown-${username}-${nanoid(5)}`;
};
