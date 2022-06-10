import { endpoints } from "../endpoints";

describe('Testando API de Wireless', () => {
    // Antes de tudo, faz login
    before(() => {
        cy.login().then(() => {
            cy.log('login efetuado com sucesso');
        });
    });

    it('Obtendo dados do wireless 2.4GHz - GET', () => {
        // espera por 1 segundo antes de efetuar a requisição
        cy.wait(1000);
        cy.fetch(endpoints.wireless.wifi2g).should(({ status, body }) => {
            expect(status).to.be.equal(200);
            expect(body).is.not.empty;
            expect(body[0]).to.have.property('wireless');
        });
    });

    // it('Obtendo dados do wireless 5GHz - GET', () => {
    //     // espera por 1 segundo antes de efetuar a requisição
    //     cy.wait(1000);
    //     cy.get(endpoints.wireless.wifi5g).should(({ status, body }) => {
    //         expect(status).to.be.equal(200);
    //         expect(body).is.not.empty;
    //         expect(body[0]).to.have.property('wireless');
    //     });
    // });

    after(() => {
        cy.logout().then(() => {
            cy.log('logout efetuado com sucesso');
        });
    });
});