import { exec } from "child_process";

export default function wol(remoteMacAddr) {
  exec(`wol ${remoteMacAddr}`, (error, stdout, stderr) => {
    if (error || stderr) {
      console.log(error);
      console.log(stderr);
      return;
    }
    console.log(stdout);
  });
}
