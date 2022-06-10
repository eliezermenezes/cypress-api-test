import './commands'

declare global {
    namespace Cypress {
        interface Chainable {
            /**
             * Custom command to get request
             * @param url url
             */
            get<T = any>(url: string): Chainable<Response<T>>;
            /**
             * Custom command to post request
             * @param url url
             * @param body request data
             */
            post<T = any>(url: string, body?: RequestBody): Chainable<Response<T>>;

            /**
             * Custom command to login request
             * @param username login
             * @param password login password
             */
            login<T = any>(username?: string, password?: string): Chainable<Response<T>>;

            /**
             * Custom command to logout request
             */
            logout<T = any>(): Chainable<Response<T>>;
        }
    }
}