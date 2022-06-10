import { cryptSha512, sha512 } from './utils/sha512';
import { Utils } from './utils/common';
import { endpoints } from '../integration/endpoints';
import { CONSTANTS } from '../integration/constants';
import * as login from '../fixtures/login.json';

Cypress.Commands.add('get', (url: string) => {
    // 'cookie': `conid=${conid}; salt=${salt1}; nonce=${nonce1}`
    cy.request('GET', url);
});

Cypress.Commands.add('post', (url: string, body?: Cypress.RequestBody) => {
    // 'cookie': `conid=${conid}; salt=${salt1}; nonce=${nonce1}`
    cy.request('POST', url, body);
});

Cypress.Commands.add('login', (username?: string, password?: string) => {
    // se não informar credenciais, defina as padrões
    if (!username && !password) {
        username = login.username;
        password = login.password;
    }

    cy.post(endpoints.loginParams, `login=${username}`).should((response) => {
        // obtendo os cookies da resposta
        const salt = Utils.getCookieValue(response.headers, 'salt');
        const nonce = Utils.getCookieValue(response.headers, 'nonce');

        // encriptando os dados para anexar à requisição de login
        const encryptedPwd = cryptSha512(password, salt);
        const ha1 = sha512(username + ':' + nonce + ':' + encryptedPwd.substring(3));
        const cnonce = Utils.lpad(Math.random() * CONSTANTS.LOGIN_MAX_CNONCE, '0', 19);
        const authKey = sha512(ha1 + ':0:' + cnonce);

        cy.post(endpoints.login, `login=${username}&auth_key=${authKey}&cnonce=${cnonce}`).then(({ status }) => {
            expect(status).to.be.equal(CONSTANTS.HTTP_STATUS.CREATED);
            
            // pegar cookies
        });

        expect(response.status).to.be.equal(CONSTANTS.HTTP_STATUS.CREATED);
    });
});

Cypress.Commands.add('logout', () => {
    cy.post(endpoints.logout).should(({ status }) => {
        expect(status).to.be.oneOf([CONSTANTS.HTTP_STATUS.OK, CONSTANTS.HTTP_STATUS.CREATED]);
    });
});