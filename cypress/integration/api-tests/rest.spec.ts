import { endpoints } from "../../endpoints";

describe("Testing wireless API", () => {
    before(() => {
        cy.login().then(() => {
            cy.log("login successfully");
        });
    });

    it("Getting data from 2.4GHz wireless", () => {
        cy.fetch(endpoints.wireless.wifi2g).should(({ status, body }) => {
            expect(status).to.be.equal(200);
            expect(body).is.not.empty;
            expect(body[0]).to.have.property("wireless");
        });
    });

    it("Getting data from 5GHz wireless", () => {
        cy.fetch(endpoints.wireless.wifi5g).should(({ status, body }) => {
            expect(status).to.be.equal(200);
            expect(body).is.not.empty;
            expect(body[0]).to.have.property("wireless");
        });
    });

    it("Getting data from guest 2.4GHz wireless", () => {
        cy.fetch(endpoints.wireless.guest2g).should(({ status, body }) => {
            expect(status).to.be.equal(200);
            expect(body).is.not.empty;
            expect(body[0]).to.have.property("guest24");
        });
    });

    it("Getting data from guest 5GHz wireless", () => {
        cy.fetch(endpoints.wireless.guest5g).should(({ status, body }) => {
            expect(status).to.be.equal(200);
            expect(body).is.not.empty;
            expect(body[0]).to.have.property("guest5");
        });
    });

    it("Getting data from bandsteering", () => {
        cy.fetch(endpoints.bandSteering).should(({ status, body }) => {
            expect(status).to.be.equal(200);
            expect(body).is.not.empty;
            expect(body[0]).to.have.property("BandSteeringEnable");
        });
    });

    after(() => {
        cy.logout().then(() => {
            cy.log("logout successfully");
        });
    });
});
