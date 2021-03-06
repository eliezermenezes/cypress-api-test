// tslint:disable
/*
 * A JavaScript implementation of the Secure Hash Algorithm, SHA-512, as defined
 * in FIPS 180-2
 * Version 2.2 Copyright Anonymous Contributor, Paul Johnston 2000 - 2009.
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for details.
 */

/*
 * Configurable variables. You may need to tweak these to be compatible with
 * the server-side, but the defaults work in most cases.
 */
var hexcase = 0;  /* hex output format. 0 - lowercase; 1 - uppercase        */
var b64pad = ""; /* base-64 pad character. "=" for strict RFC compliance   */

/*
 * These are the functions you'll usually want to call
 * They take string arguments and return either hex or base-64 encoded strings
 */
export function sha512(s: string) { return rstr2hex(rstr_sha512(str2rstr_utf8(s))); }
export function hex_sha512(s: string) { return rstr2hex(rstr_sha512(str2rstr_utf8(s))); }
export function b64_sha512(s: string) { return rstr2b64(rstr_sha512(str2rstr_utf8(s))); }
export function any_sha512(s: string, e: string) { return rstr2any(rstr_sha512(str2rstr_utf8(s)), e); }
export function hex_hmac_sha512(k: string, d: string) { return rstr2hex(rstr_hmac_sha512(str2rstr_utf8(k), str2rstr_utf8(d))); }
export function b64_hmac_sha512(k: string, d: string) { return rstr2b64(rstr_hmac_sha512(str2rstr_utf8(k), str2rstr_utf8(d))); }
export function any_hmac_sha512(k: string, d: string, e: string) { return rstr2any(rstr_hmac_sha512(str2rstr_utf8(k), str2rstr_utf8(d)), e); }

/*
 * Perform a simple self-test to see if the VM is working
 */
export function sha512_vm_test() {
    return hex_sha512("abc").toLowerCase() ==
        "ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a" +
        "2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f";
}

/*
 * Calculate the SHA-512 of a raw string
 */
export function rstr_sha512(s: string) {
    return binb2rstr(binb_sha512(rstr2binb(s), s.length * 8));
}

/*
 * Calculate the HMAC-SHA-512 of a key and some data (raw strings)
 */
export function rstr_hmac_sha512(key: string, data: string) {
    var bkey = rstr2binb(key);
    if (bkey.length > 32) bkey = binb_sha512(bkey, key.length * 8);

    var ipad = Array(32), opad = Array(32);
    for (var i = 0; i < 32; i++) {
        ipad[i] = bkey[i] ^ 0x36363636;
        opad[i] = bkey[i] ^ 0x5C5C5C5C;
    }

    var hash = binb_sha512(ipad.concat(rstr2binb(data)), 1024 + data.length * 8);
    return binb2rstr(binb_sha512(opad.concat(hash), 1024 + 512));
}

/*
 * Convert a raw string to a hex string
 */
export function rstr2hex(input: string) {
    if (typeof hexcase == 'undefined') {
        hexcase = 0;
    }
    var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
    var output = "";
    var x: number;
    for (var i = 0; i < input.length; i++) {
        x = input.charCodeAt(i);
        output += hex_tab.charAt((x >>> 4) & 0x0F)
            + hex_tab.charAt(x & 0x0F);
    }
    return output;
}

/*
 * Convert a raw string to a base-64 string
 */
export function rstr2b64(input: string) {
    if (typeof b64pad == 'undefined') {
        b64pad = '';
    }
    var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    var output = "";
    var len = input.length;
    for (var i = 0; i < len; i += 3) {
        var triplet = (input.charCodeAt(i) << 16)
            | (i + 1 < len ? input.charCodeAt(i + 1) << 8 : 0)
            | (i + 2 < len ? input.charCodeAt(i + 2) : 0);
        for (var j = 0; j < 4; j++) {
            if (i * 8 + j * 6 > input.length * 8) output += b64pad;
            else output += tab.charAt((triplet >>> 6 * (3 - j)) & 0x3F);
        }
    }
    return output;
}

/*
 * Convert a raw string to an arbitrary string encoding
 */
export function rstr2any(input: string, encoding: string) {
    var divisor = encoding.length;
    var i: number, j: number, q: number, x: number, quotient: any[];

    /* Convert to an array of 16-bit big-endian values, forming the dividend */
    var dividend = Array(Math.ceil(input.length / 2));
    for (i = 0; i < dividend.length; i++) {
        dividend[i] = (input.charCodeAt(i * 2) << 8) | input.charCodeAt(i * 2 + 1);
    }

    /*
     * Repeatedly perform a long division. The binary array forms the dividend,
     * the length of the encoding is the divisor. Once computed, the quotient
     * forms the dividend for the next step. All remainders are stored for later
     * use.
     */
    var full_length = Math.ceil(input.length * 8 /
        (Math.log(encoding.length) / Math.log(2)));
    var remainders = Array(full_length);
    for (j = 0; j < full_length; j++) {
        quotient = Array();
        x = 0;
        for (i = 0; i < dividend.length; i++) {
            x = (x << 16) + dividend[i];
            q = Math.floor(x / divisor);
            x -= q * divisor;
            if (quotient.length > 0 || q > 0)
                quotient[quotient.length] = q;
        }
        remainders[j] = x;
        dividend = quotient;
    }

    /* Convert the remainders to the output string */
    var output = "";
    for (i = remainders.length - 1; i >= 0; i--)
        output += encoding.charAt(remainders[i]);

    return output;
}

/*
 * Encode a string as utf-8.
 * For efficiency, this assumes the input is valid utf-16.
 */
export function str2rstr_utf8(input: string) {
    var output = "";
    var i = -1;
    var x: number, y: number;

    while (++i < input.length) {
        /* Decode utf-16 surrogate pairs */
        x = input.charCodeAt(i);
        y = i + 1 < input.length ? input.charCodeAt(i + 1) : 0;
        if (0xD800 <= x && x <= 0xDBFF && 0xDC00 <= y && y <= 0xDFFF) {
            x = 0x10000 + ((x & 0x03FF) << 10) + (y & 0x03FF);
            i++;
        }

        /* Encode output as utf-8 */
        if (x <= 0x7F)
            output += String.fromCharCode(x);
        else if (x <= 0x7FF)
            output += String.fromCharCode(0xC0 | ((x >>> 6) & 0x1F),
                0x80 | (x & 0x3F));
        else if (x <= 0xFFFF)
            output += String.fromCharCode(0xE0 | ((x >>> 12) & 0x0F),
                0x80 | ((x >>> 6) & 0x3F),
                0x80 | (x & 0x3F));
        else if (x <= 0x1FFFFF)
            output += String.fromCharCode(0xF0 | ((x >>> 18) & 0x07),
                0x80 | ((x >>> 12) & 0x3F),
                0x80 | ((x >>> 6) & 0x3F),
                0x80 | (x & 0x3F));
    }
    return output;
}

/*
 * Encode a string as utf-16
 */
export function str2rstr_utf16le(input: string) {
    var output = "";
    for (var i = 0; i < input.length; i++)
        output += String.fromCharCode(input.charCodeAt(i) & 0xFF,
            (input.charCodeAt(i) >>> 8) & 0xFF);
    return output;
}

export function str2rstr_utf16be(input: string) {
    var output = "";
    for (var i = 0; i < input.length; i++)
        output += String.fromCharCode((input.charCodeAt(i) >>> 8) & 0xFF,
            input.charCodeAt(i) & 0xFF);
    return output;
}

/*
 * Convert a raw string to an array of big-endian words
 * Characters >255 have their high-byte silently ignored.
 */
export function rstr2binb(input: string) {
    var output = Array(input.length >> 2);
    for (var i = 0; i < output.length; i++)
        output[i] = 0;
    for (var j = 0; j < input.length * 8; j += 8)
        output[j >> 5] |= (input.charCodeAt(j / 8) & 0xFF) << (24 - j % 32);
    return output;
}

/*
 * Convert an array of big-endian words to a string
 */
export function binb2rstr(input: any[]) {
    var output = "";
    for (var i = 0; i < input.length * 32; i += 8)
        output += String.fromCharCode((input[i >> 5] >>> (24 - i % 32)) & 0xFF);
    return output;
}

/*
 * Calculate the SHA-512 of an array of big-endian dwords, and a bit length
 */
var sha512_k: any[];
export function binb_sha512(x: any[], len: number) {
    if (sha512_k == undefined) {
        //SHA512 constants
        sha512_k = new Array(
            new int64(0x428a2f98, -685199838), new int64(0x71374491, 0x23ef65cd),
            new int64(-1245643825, -330482897), new int64(-373957723, -2121671748),
            new int64(0x3956c25b, -213338824), new int64(0x59f111f1, -1241133031),
            new int64(-1841331548, -1357295717), new int64(-1424204075, -630357736),
            new int64(-670586216, -1560083902), new int64(0x12835b01, 0x45706fbe),
            new int64(0x243185be, 0x4ee4b28c), new int64(0x550c7dc3, -704662302),
            new int64(0x72be5d74, -226784913), new int64(-2132889090, 0x3b1696b1),
            new int64(-1680079193, 0x25c71235), new int64(-1046744716, -815192428),
            new int64(-459576895, -1628353838), new int64(-272742522, 0x384f25e3),
            new int64(0xfc19dc6, -1953704523), new int64(0x240ca1cc, 0x77ac9c65),
            new int64(0x2de92c6f, 0x592b0275), new int64(0x4a7484aa, 0x6ea6e483),
            new int64(0x5cb0a9dc, -1119749164), new int64(0x76f988da, -2096016459),
            new int64(-1740746414, -295247957), new int64(-1473132947, 0x2db43210),
            new int64(-1341970488, -1728372417), new int64(-1084653625, -1091629340),
            new int64(-958395405, 0x3da88fc2), new int64(-710438585, -1828018395),
            new int64(0x6ca6351, -536640913), new int64(0x14292967, 0xa0e6e70),
            new int64(0x27b70a85, 0x46d22ffc), new int64(0x2e1b2138, 0x5c26c926),
            new int64(0x4d2c6dfc, 0x5ac42aed), new int64(0x53380d13, -1651133473),
            new int64(0x650a7354, -1951439906), new int64(0x766a0abb, 0x3c77b2a8),
            new int64(-2117940946, 0x47edaee6), new int64(-1838011259, 0x1482353b),
            new int64(-1564481375, 0x4cf10364), new int64(-1474664885, -1136513023),
            new int64(-1035236496, -789014639), new int64(-949202525, 0x654be30),
            new int64(-778901479, -688958952), new int64(-694614492, 0x5565a910),
            new int64(-200395387, 0x5771202a), new int64(0x106aa070, 0x32bbd1b8),
            new int64(0x19a4c116, -1194143544), new int64(0x1e376c08, 0x5141ab53),
            new int64(0x2748774c, -544281703), new int64(0x34b0bcb5, -509917016),
            new int64(0x391c0cb3, -976659869), new int64(0x4ed8aa4a, -482243893),
            new int64(0x5b9cca4f, 0x7763e373), new int64(0x682e6ff3, -692930397),
            new int64(0x748f82ee, 0x5defb2fc), new int64(0x78a5636f, 0x43172f60),
            new int64(-2067236844, -1578062990), new int64(-1933114872, 0x1a6439ec),
            new int64(-1866530822, 0x23631e28), new int64(-1538233109, -561857047),
            new int64(-1090935817, -1295615723), new int64(-965641998, -479046869),
            new int64(-903397682, -366583396), new int64(-779700025, 0x21c0c207),
            new int64(-354779690, -840897762), new int64(-176337025, -294727304),
            new int64(0x6f067aa, 0x72176fba), new int64(0xa637dc5, -1563912026),
            new int64(0x113f9804, -1090974290), new int64(0x1b710b35, 0x131c471b),
            new int64(0x28db77f5, 0x23047d84), new int64(0x32caab7b, 0x40c72493),
            new int64(0x3c9ebe0a, 0x15c9bebc), new int64(0x431d67c4, -1676669620),
            new int64(0x4cc5d4be, -885112138), new int64(0x597f299c, -60457430),
            new int64(0x5fcb6fab, 0x3ad6faec), new int64(0x6c44198c, 0x4a475817));
    }

    //Initial hash values
    var H = new Array(
        new int64(0x6a09e667, -205731576),
        new int64(-1150833019, -2067093701),
        new int64(0x3c6ef372, -23791573),
        new int64(-1521486534, 0x5f1d36f1),
        new int64(0x510e527f, -1377402159),
        new int64(-1694144372, 0x2b3e6c1f),
        new int64(0x1f83d9ab, -79577749),
        new int64(0x5be0cd19, 0x137e2179));

    var T1 = new int64(0, 0),
        T2 = new int64(0, 0),
        a = new int64(0, 0),
        b = new int64(0, 0),
        c = new int64(0, 0),
        d = new int64(0, 0),
        e = new int64(0, 0),
        f = new int64(0, 0),
        g = new int64(0, 0),
        h = new int64(0, 0),
        //Temporary variables not specified by the document
        s0 = new int64(0, 0),
        s1 = new int64(0, 0),
        Ch = new int64(0, 0),
        Maj = new int64(0, 0),
        r1 = new int64(0, 0),
        r2 = new int64(0, 0),
        r3 = new int64(0, 0);
    var j: number, i: number;
    var W = new Array(80);
    for (i = 0; i < 80; i++)
        W[i] = new int64(0, 0);

    // append padding to the source string. The format is described in the FIPS.
    x[len >> 5] |= 0x80 << (24 - (len & 0x1f));
    x[((len + 128 >> 10) << 5) + 31] = len;

    for (i = 0; i < x.length; i += 32) //32 dwords is the block size
    {
        int64copy(a, H[0]);
        int64copy(b, H[1]);
        int64copy(c, H[2]);
        int64copy(d, H[3]);
        int64copy(e, H[4]);
        int64copy(f, H[5]);
        int64copy(g, H[6]);
        int64copy(h, H[7]);

        for (j = 0; j < 16; j++) {
            W[j].h = x[i + 2 * j];
            W[j].l = x[i + 2 * j + 1];
        }

        for (j = 16; j < 80; j++) {
            //sigma1
            int64rrot(r1, W[j - 2], 19);
            int64revrrot(r2, W[j - 2], 29);
            int64shr(r3, W[j - 2], 6);
            s1.l = r1.l ^ r2.l ^ r3.l;
            s1.h = r1.h ^ r2.h ^ r3.h;
            //sigma0
            int64rrot(r1, W[j - 15], 1);
            int64rrot(r2, W[j - 15], 8);
            int64shr(r3, W[j - 15], 7);
            s0.l = r1.l ^ r2.l ^ r3.l;
            s0.h = r1.h ^ r2.h ^ r3.h;

            int64add4(W[j], s1, W[j - 7], s0, W[j - 16]);
        }

        for (j = 0; j < 80; j++) {
            //Ch
            Ch.l = (e.l & f.l) ^ (~e.l & g.l);
            Ch.h = (e.h & f.h) ^ (~e.h & g.h);

            //Sigma1
            int64rrot(r1, e, 14);
            int64rrot(r2, e, 18);
            int64revrrot(r3, e, 9);
            s1.l = r1.l ^ r2.l ^ r3.l;
            s1.h = r1.h ^ r2.h ^ r3.h;

            //Sigma0
            int64rrot(r1, a, 28);
            int64revrrot(r2, a, 2);
            int64revrrot(r3, a, 7);
            s0.l = r1.l ^ r2.l ^ r3.l;
            s0.h = r1.h ^ r2.h ^ r3.h;

            //Maj
            Maj.l = (a.l & b.l) ^ (a.l & c.l) ^ (b.l & c.l);
            Maj.h = (a.h & b.h) ^ (a.h & c.h) ^ (b.h & c.h);

            int64add5(T1, h, s1, Ch, sha512_k[j], W[j]);
            int64add(T2, s0, Maj);

            int64copy(h, g);
            int64copy(g, f);
            int64copy(f, e);
            int64add(e, d, T1);
            int64copy(d, c);
            int64copy(c, b);
            int64copy(b, a);
            int64add(a, T1, T2);
        }
        int64add(H[0], H[0], a);
        int64add(H[1], H[1], b);
        int64add(H[2], H[2], c);
        int64add(H[3], H[3], d);
        int64add(H[4], H[4], e);
        int64add(H[5], H[5], f);
        int64add(H[6], H[6], g);
        int64add(H[7], H[7], h);
    }

    //represent the hash as an array of 32-bit dwords
    var hash = new Array(16);
    for (i = 0; i < 8; i++) {
        hash[2 * i] = H[i].h;
        hash[2 * i + 1] = H[i].l;
    }
    return hash;
}

//A constructor for 64-bit numbers
export function int64(h: number, l: number) {
    this.h = h;
    this.l = l;
}

//Copies src into dst, assuming both are 64-bit numbers
export function int64copy(dst: { h: any; l: any; }, src: { h: any; l: any; }) {
    dst.h = src.h;
    dst.l = src.l;
}

//Right-rotates a 64-bit number by shift
//Won't handle cases of shift>=32
//The export function revrrot() is for that
export function int64rrot(dst: { l: number; h: number; }, x: { l: number; h: number; }, shift: number) {
    dst.l = (x.l >>> shift) | (x.h << (32 - shift));
    dst.h = (x.h >>> shift) | (x.l << (32 - shift));
}

//Reverses the dwords of the source and then rotates right by shift.
//This is equivalent to rotation by 32+shift
export function int64revrrot(dst: { l: number; h: number; }, x: { h: number; l: number; }, shift: number) {
    dst.l = (x.h >>> shift) | (x.l << (32 - shift));
    dst.h = (x.l >>> shift) | (x.h << (32 - shift));
}

//Bitwise-shifts right a 64-bit number by shift
//Won't handle shift>=32, but it's never needed in SHA512
export function int64shr(dst: { l: number; h: number; }, x: { l: number; h: number; }, shift: number) {
    dst.l = (x.l >>> shift) | (x.h << (32 - shift));
    dst.h = (x.h >>> shift);
}

//Adds two 64-bit numbers
//Like the original implementation, does not rely on 32-bit operations
export function int64add(dst: { l: number; h: number; }, x: { l: number; h: number; }, y: { l: number; h: number; }) {
    var w0 = (x.l & 0xffff) + (y.l & 0xffff);
    var w1 = (x.l >>> 16) + (y.l >>> 16) + (w0 >>> 16);
    var w2 = (x.h & 0xffff) + (y.h & 0xffff) + (w1 >>> 16);
    var w3 = (x.h >>> 16) + (y.h >>> 16) + (w2 >>> 16);
    dst.l = (w0 & 0xffff) | (w1 << 16);
    dst.h = (w2 & 0xffff) | (w3 << 16);
}

//Same, except with 4 addends. Works faster than adding them one by one.
export function int64add4(dst: { l: number; h: number; }, a: { l: number; h: number; }, b: { l: number; h: number; }, c: { l: number; h: number; }, d: { l: number; h: number; }) {
    var w0 = (a.l & 0xffff) + (b.l & 0xffff) + (c.l & 0xffff) + (d.l & 0xffff);
    var w1 = (a.l >>> 16) + (b.l >>> 16) + (c.l >>> 16) + (d.l >>> 16) + (w0 >>> 16);
    var w2 = (a.h & 0xffff) + (b.h & 0xffff) + (c.h & 0xffff) + (d.h & 0xffff) + (w1 >>> 16);
    var w3 = (a.h >>> 16) + (b.h >>> 16) + (c.h >>> 16) + (d.h >>> 16) + (w2 >>> 16);
    dst.l = (w0 & 0xffff) | (w1 << 16);
    dst.h = (w2 & 0xffff) | (w3 << 16);
}

//Same, except with 5 addends
export function int64add5(dst: { l: number; h: number; }, a: { l: number; h: number; }, b: { l: number; h: number; }, c: { l: number; h: number; }, d: { l: number; h: number; }, e: { l: number; h: number; }) {
    var w0 = (a.l & 0xffff) + (b.l & 0xffff) + (c.l & 0xffff) + (d.l & 0xffff) + (e.l & 0xffff);
    var w1 = (a.l >>> 16) + (b.l >>> 16) + (c.l >>> 16) + (d.l >>> 16) + (e.l >>> 16) + (w0 >>> 16);
    var w2 = (a.h & 0xffff) + (b.h & 0xffff) + (c.h & 0xffff) + (d.h & 0xffff) + (e.h & 0xffff) + (w1 >>> 16);
    var w3 = (a.h >>> 16) + (b.h >>> 16) + (c.h >>> 16) + (d.h >>> 16) + (e.h >>> 16) + (w2 >>> 16);
    dst.l = (w0 & 0xffff) | (w1 << 16);
    dst.h = (w2 & 0xffff) | (w3 << 16);
}

export function _extend(source: string, size_ref: number) {
    var extended = "";
    for (var i = 0; i < Math.floor(size_ref / 64); i++) {
        extended += source;
    }
    extended += source.substr(0, size_ref % 64);
    return extended;
}

export function _sha512crypt_intermediate(password: string, salt: any) {
    var digest_b = rstr_sha512(password + salt + password);
    var key_len = password.length;

    // extend digest b so that it has the same size as password
    var digest_b_extended = _extend(digest_b, password.length);

    var intermediate_input = password + salt + digest_b_extended;
    for (var cnt = key_len; cnt > 0; cnt >>= 1) {
        if ((cnt & 1) != 0)
            intermediate_input += digest_b
        else
            intermediate_input += password;
    }
    return rstr_sha512(intermediate_input);
}

export function _rstr_sha512crypt(password: string, salt: string, rounds: number) {
    // steps 1-12
    var digest_a = _sha512crypt_intermediate(password, salt);

    // step 13-15
    var dp_input = "";
    for (var i = 0; i < password.length; i++)
        dp_input += password;
    var dp = rstr_sha512(dp_input);
    // step 16
    var p = _extend(dp, password.length);

    // step 17-19
    var ds_input = "";
    for (var j = 0; j < (16 + digest_a.charCodeAt(0)); j++)
        ds_input += salt;
    var ds = rstr_sha512(ds_input);
    // step 20
    var s = _extend(ds, salt.length);

    // step 21
    var digest = digest_a;
    var c_input = "";
    for (var k = 0; k < rounds; k++) {
        c_input = "";

        if (k & 1)
            c_input += p;
        else
            c_input += digest;

        if (k % 3)
            c_input += s;

        if (k % 7)
            c_input += p;

        if (k & 1)
            c_input += digest;
        else
            c_input += p;

        digest = rstr_sha512(c_input);
    }

    return digest;
}

export function sha512crypt(password: any, salt: string) {
    var magic = "$6$";
    var rounds: number;

    // parse the magic "$" stuff
    var magic_array = salt.split("$");
    if (magic_array.length > 1) {
        if (magic_array[1] !== "6") {
            throw new Error('Got \'${salt}\' but only SHA512 ($6$) algorithm supported');
        }
        rounds = parseInt(magic_array[2].split("=")[1]);
        if (rounds) {
            if (rounds < 1000)
                rounds = 1000;
            if (rounds > 999999999)
                rounds = 999999999;
            salt = magic_array[3] || salt;
        } else {
            salt = magic_array[2] || salt;
        }
    }

    // salt is max 16 chars long
    if (salt.length < 8 || salt.length > 16) {
        throw new Error('Wrong salt length: \'${salt.length}\' bytes when 8 <= n <= 16 expected. Got salt \'${salt}\'.');
    }

    var input = _rstr_sha512crypt(password, salt, rounds || 5000);
    var output = "";
    var tab = "./0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

    var order = [42, 21, 0,
        1, 43, 22,
        23, 2, 44,
        45, 24, 3,
        4, 46, 25,
        26, 5, 47,
        48, 27, 6,
        7, 49, 28,
        29, 8, 50,
        51, 30, 9,
        10, 52, 31,
        32, 11, 53,
        54, 33, 12,
        13, 55, 34,
        35, 14, 56,
        57, 36, 15,
        16, 58, 37,
        38, 17, 59,
        60, 39, 18,
        19, 61, 40,
        41, 20, 62,
        63];
    for (var i = 0; i < input.length; i += 3) {
        // special case for the end of the input
        var char_1: number;
        var char_2: number;
        if (order[i + 1] === undefined) {
            char_1 = input.charCodeAt(order[i]) & parseInt("00111111", 2);
            char_2 = (
                input.charCodeAt(order[i]) & parseInt("11000000", 2)) >>> 6;
            output += tab.charAt(char_1) + tab.charAt(char_2);
        } else {
            var char_3: number;
            var char_4: number;
            char_1 = input.charCodeAt(order[i]) & parseInt("00111111", 2);
            char_2 = (
                ((input.charCodeAt(order[i]) & parseInt("11000000", 2)) >>> 6) |
                (input.charCodeAt(order[i + 1]) & parseInt("00001111", 2)) << 2);
            char_3 = (
                ((input.charCodeAt(order[i + 1]) & parseInt("11110000", 2)) >> 4) |
                (input.charCodeAt(order[i + 2]) & parseInt("00000011", 2)) << 4);
            char_4 = (input.charCodeAt(order[i + 2]) & parseInt("11111100", 2)) >>> 2;
            output += (tab.charAt(char_1) + tab.charAt(char_2) +
                tab.charAt(char_3) + tab.charAt(char_4));
        }
    }

    if (magic_array.length > 2) {
        magic = rounds ? "$6$rounds=" + rounds + "$" : "$6$";
    }

    return magic + salt + "$" + output;
}

export function cryptSha512(s: string, salt: any) { return sha512crypt(s, salt); }
// tslint:enable