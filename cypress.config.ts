import { defineConfig } from "cypress";

export default defineConfig({
    video: false,
    screenshotOnRunFailure: false,
    projectId: "4zwujf",
    e2e: {
        setupNodeEvents(on, config) {},
        baseUrl: "http://172.16.219.128:8080/api/",
        specPattern: "cypress/integration/api-tests/**/*.{js,jsx,ts,tsx}",
    },
});
