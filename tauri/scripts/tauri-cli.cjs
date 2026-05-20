const { spawn } = require("node:child_process");
const http = require("node:http");
const path = require("node:path");

const args = process.argv.slice(2);
const isWindows = process.platform === "win32";
const root = path.resolve(__dirname, "..");

function run(command, commandArgs, options = {}) {
  return spawn(command, commandArgs, {
    cwd: root,
    stdio: "inherit",
    shell: isWindows,
    ...options,
  });
}

function tauriBin() {
  return path.join(root, "node_modules", ".bin", isWindows ? "tauri.cmd" : "tauri");
}

function waitForDevServer(url, timeoutMs = 30000) {
  const startedAt = Date.now();

  return new Promise((resolve, reject) => {
    const check = () => {
      const req = http.get(url, (res) => {
        res.resume();
        resolve();
      });

      req.on("error", (error) => {
        if (Date.now() - startedAt >= timeoutMs) {
          reject(error);
        } else {
          setTimeout(check, 300);
        }
      });

      req.setTimeout(1000, () => {
        req.destroy();
      });
    };

    check();
  });
}

async function dev() {
  const vite = run(isWindows ? "npm.cmd" : "npm", ["run", "dev"]);
  let shuttingDown = false;
  let viteExited = false;

  const stopVite = () => {
    if (!shuttingDown && !vite.killed) {
      shuttingDown = true;
      vite.kill("SIGTERM");
    }
  };

  process.on("SIGINT", () => {
    stopVite();
    process.exit(130);
  });
  process.on("SIGTERM", () => {
    stopVite();
    process.exit(143);
  });
  process.on("exit", stopVite);

  const viteExit = new Promise((_, reject) => {
    vite.on("exit", (code) => {
      viteExited = true;
      if (!shuttingDown) {
        reject(new Error(`Vite dev server exited with code ${code ?? 1}`));
      }
    });
  });

  try {
    await Promise.race([
      waitForDevServer("http://127.0.0.1:1420/boot.html"),
      viteExit,
    ]);
  } catch (error) {
    if (!viteExited) {
      stopVite();
    }
    console.error(`Failed to start Vite dev server: ${error.message}`);
    process.exit(1);
  }

  const cargo = run("cargo", ["run", ...args.slice(1)], {
    cwd: path.join(root, "src-tauri"),
  });

  cargo.on("exit", (code, signal) => {
    stopVite();
    if (signal) {
      process.kill(process.pid, signal);
    } else {
      process.exit(code ?? 0);
    }
  });
}

if (args[0] === "dev") {
  dev();
} else {
  const child = run(tauriBin(), args);
  child.on("exit", (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
    } else {
      process.exit(code ?? 0);
    }
  });
}
