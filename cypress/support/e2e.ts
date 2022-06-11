import "./commands";
import "./custom-commands";

declare global {
    namespace Cypress {
        interface Chainable {
            /**
             * Custom command to get request
             * @param url url
             *  @param options request options
             */
            fetch<T = any>(url: string, options?: Partial<RequestOptions>): Chainable<Response<T>>;
            /**
             * Custom command to post request
             * @param url url
             * @param options request options
             */
            post<T = any>(url: string, options?: Partial<RequestOptions>): Chainable<Response<T>>;

            /**
             * Custom command to put request
             * @param url url
             * @param options request options
             */
            put<T = any>(url: string, options?: Partial<RequestOptions>): Chainable<Response<T>>;

            /**
             * Custom command to delete request
             * @param url url
             * @param options request options
             */
            delete<T = any>(url: string, options?: Partial<RequestOptions>): Chainable<Response<T>>;

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
