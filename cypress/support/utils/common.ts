export class Utils {
    static lpad(str: number, fill: string, len?: number): string {
        len = len || 2;
        let strReturn = str.toString();
        while (strReturn.length < len) {
            strReturn = fill + strReturn;
        }
        return strReturn;
    }

    static getCookieValue(headers: { [key: string]: string | string[] }, key: string): string {
        let cookieValue = "";

        for (const cookie of headers["set-cookie"]) {
            const firstPart = cookie.split(";")[0];
            const separator = firstPart.indexOf("=");
            const name = firstPart.substring(0, separator);
            const value = firstPart.substring(separator + 1);

            if (key === name) {
                cookieValue = value;
                break;
            }
        }

        return cookieValue;
    }
}
