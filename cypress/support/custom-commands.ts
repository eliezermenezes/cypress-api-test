import { cryptSha512, sha512 } from "./utils/sha512";
import { Utils } from "./utils/common";
import { endpoints } from "../endpoints";
import { CONSTANTS } from "../constants";
import * as login from "../fixtures/login.json";

Cypress.Commands.add("login", (username = login.username, password = login.password) => {
    // first get the login params
    cy.post(endpoints.loginParams, { body: `login=${username}` }).should(({ headers, status }) => {
        const salt = Utils.getCookieValue(headers, "salt");
        const nonce = Utils.getCookieValue(headers, "nonce");

        // encrypting the data to attach to the login request
        const encryptedPwd = cryptSha512(password, salt);
        const ha1 = sha512(username + ":" + nonce + ":" + encryptedPwd.substring(3));
        const cnonce = Utils.lpad(Math.random() * CONSTANTS.LOGIN_MAX_CNONCE, "0", 19);
        const authKey = sha512(ha1 + ":0:" + cnonce);

        cy.post(endpoints.login, { body: `login=${username}&auth_key=${authKey}&cnonce=${cnonce}` }).then(
            ({ status }) => {
                expect(status).to.be.equal(201);
            }
        );
        expect(status).to.be.equal(201);
    });
});

Cypress.Commands.add("logout", () => {
    cy.post(endpoints.logout).should(({ status }) => {
        expect(status).to.be.oneOf([200, 201]);
    });
});
