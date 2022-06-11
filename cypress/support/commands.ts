beforeEach(() => {
    Cypress.Cookies.preserveOnce("salt", "nonce", "conid");
});

Cypress.Commands.add("fetch", (url: string, options?: Partial<Cypress.RequestOptions>) => {
    cy.request({
        method: "GET",
        url,
        failOnStatusCode: options?.failOnStatusCode,
    });
});

Cypress.Commands.add("post", (url: string, options?: Partial<Cypress.RequestOptions>) => {
    cy.request({
        method: "POST",
        url,
        body: options?.body,
        failOnStatusCode: options?.failOnStatusCode,
    });
});

Cypress.Commands.add("put", (url: string, options?: Partial<Cypress.RequestOptions>) => {
    cy.request({
        method: "PUT",
        url,
        body: options?.body,
        failOnStatusCode: options?.failOnStatusCode,
    });
});

Cypress.Commands.add("delete", (url: string, options?: Partial<Cypress.RequestOptions>) => {
    cy.request({
        method: "DELETE",
        url,
        body: options?.body,
        failOnStatusCode: options?.failOnStatusCode,
    });
});
