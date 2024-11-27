const { defineConfig } = require("cypress");
const { spawn } = require("child_process");

let server;
let baseUrl;

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // Enable Cypress Code Coverage
      require('@cypress/code-coverage/task')(on, config);

      // Custom tasks for controlling server
      on("task", {
        startServer() {
          return new Promise((resolve, reject) => {
            if (server) {
              resolve(baseUrl);
            }
            server = spawn("node", ["-r", "nyc", "index-test.js"]); // Start server with nyc instrumentation
            server.stdout.on("data", (data) => {
              console.log(data.toString());
              if (data.toString().includes("BookTrack app running at: ")) {
                const baseUrlPrefix = "BookTrack app running at: ";
                const startIndex = data.toString().indexOf(baseUrlPrefix);
                if (startIndex !== -1) {
                  baseUrl = data.toString().substring(startIndex + baseUrlPrefix.length).trim();
                  resolve(baseUrl);
                }
              }
            });
            server.stderr.on("data", (data) => {
              reject(data);
            });
          });
        },
        stopServer() {
          if (server) {
            server.kill();
          }
          return null;
        }
      });
      return config;
    }
  }
});
