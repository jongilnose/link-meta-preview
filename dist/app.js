"use strict";
const puppeteer = require('puppeteer');
const util = require("util");
const axios = require('axios');
const getUrls = require("get-urls");
const imageAccessible = async (url) => {
    const correctedUrls = getUrls(url);
    if (correctedUrls.size !== 0) {
        const res = await axios(correctedUrls.values().next().value);
        const contentType = res.headers["content-type"];
        return new RegExp("image/*").test(contentType);
    }
};
const getTitle = async (page) => {
    return await page.evaluate(() => {
        var _a, _b, _c;
        const ogTitle = (_a = document.querySelector('meta[property="og:title"]')) === null || _a === void 0 ? void 0 : _a.getAttribute('content');
        if (ogTitle != null && ogTitle.length > 0) {
            return ogTitle;
        }
        const docTitle = document.title;
        if (docTitle != null && docTitle.length > 0) {
            return docTitle;
        }
        const h1 = (_c = (_b = document.querySelector("h1")) === null || _b === void 0 ? void 0 : _b.querySelector('.blind')) === null || _c === void 0 ? void 0 : _c.innerHTML;
        if (h1 != null && h1.length > 0) {
            return h1;
        }
        return '';
    });
};
const getDescription = async (page) => {
    return await page.evaluate(() => {
        var _a, _b;
        const ogDescription = (_a = document.querySelector('meta[property="og:description"]')) === null || _a === void 0 ? void 0 : _a.getAttribute('content');
        if (ogDescription != null && ogDescription.length > 0) {
            return ogDescription;
        }
        const metaDescription = (_b = document.querySelector('meta[name="description"]')) === null || _b === void 0 ? void 0 : _b.getAttribute('content');
        if (metaDescription != null && metaDescription.length > 0) {
            return metaDescription;
        }
        return '';
    });
};
const getDomain = async (page, uri) => {
    const domainName = await page.evaluate(() => {
        var _a, _b;
        const canonicalLink = (_a = document.querySelector("link[rel=canonical]")) === null || _a === void 0 ? void 0 : _a.getAttribute('href');
        if (canonicalLink != null && canonicalLink.length > 0) {
            return canonicalLink;
        }
        const ogUrlMeta = (_b = document.querySelector('meta[property="og:url"]')) === null || _b === void 0 ? void 0 : _b.getAttribute('content');
        if (ogUrlMeta != null && ogUrlMeta.length > 0) {
            return ogUrlMeta;
        }
        return null;
    });
    return domainName != null
        ? new URL(domainName).hostname.replace("www.", "")
        : new URL(uri).hostname.replace("www.", "");
};
const getImage = async (page) => {
    const ogImage = await page.evaluate(() => {
        var _a;
        const ogImage = (_a = document.querySelector('meta[property="og:image"]')) === null || _a === void 0 ? void 0 : _a.getAttribute('content');
        if (ogImage != null && ogImage.length > 0) {
            return ogImage;
        }
        return '';
    });
    const valid = await imageAccessible(ogImage);
    if (valid) {
        return ogImage;
    }
    return '';
};
module.exports = async (uri) => {
    const obj = {
        title: '',
        description: '',
        domain: '',
        image: ''
    };
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(uri);
    await page.exposeFunction("imageAccessible", imageAccessible);
    obj.title = await getTitle(page);
    obj.description = await getDescription(page);
    obj.domain = await getDomain(page, uri);
    obj.image = await getImage(page);
    await browser.close();
    return obj;
};
