import { randomInt } from "node:crypto";
const generateOtp = () => {
  return randomInt(100000, 1000000).toString();
};
export { generateOtp };
