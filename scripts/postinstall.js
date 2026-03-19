const { spawnSync } = require("node:child_process");
const path = require("node:path");

function runInstall(projectDir) {
  const npmExecPath = process.env.npm_execpath;

  if (!npmExecPath) {
    console.error("npm_execpath is missing. Cannot run nested npm install.");
    process.exit(1);
  }

  const result = spawnSync(process.execPath, [npmExecPath, "install"], {
    stdio: "inherit",
    env: process.env,
    cwd: path.resolve(__dirname, "..", projectDir),
  });

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

runInstall("backend");
runInstall("frontend");
