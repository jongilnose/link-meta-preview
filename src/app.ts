"use strict"
const puppeteer = require('puppeteer')
const util = require("util")
const axios = require('axios')
const getUrls = require("get-urls")

const imageAccessible = async (url:any) => {
  const correctedUrls = getUrls(url)
  if (correctedUrls.size !== 0) {
    const res = await axios(correctedUrls.values().next().value)
    const contentType = res.headers["content-type"]
    return new RegExp("image/*").test(contentType)
  }
}

const getTitle = async (page:any) => {
  return await page.evaluate(() => {
    const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content')
    if (ogTitle != null && ogTitle.length > 0) {
      return ogTitle
    }
    const docTitle = document.title
    if (docTitle != null && docTitle.length > 0) {
      return docTitle
    }
    const h1 = document.querySelector("h1")?.querySelector('.blind')?.innerHTML
    if (h1 != null && h1.length > 0) {
      return h1
    }
    return ''
  })
}

const getDescription = async (page:any) => {
  return await page.evaluate(() => {
    const ogDescription = document.querySelector('meta[property="og:description"]')?.getAttribute('content')
    if (ogDescription != null && ogDescription.length > 0) {
      return ogDescription
    }
    const metaDescription = document.querySelector('meta[name="description"]')?.getAttribute('content')
    if (metaDescription != null && metaDescription.length > 0) {
      return metaDescription
    }
    return ''
  })
}

const getDomain = async (page:any, uri:string) => {
  const domainName = await page.evaluate(() => {
    const canonicalLink = document.querySelector("link[rel=canonical]")?.getAttribute('href')
    if (canonicalLink != null && canonicalLink.length > 0) {
      return canonicalLink
    }
    const ogUrlMeta = document.querySelector('meta[property="og:url"]')?.getAttribute('content')
    if (ogUrlMeta != null && ogUrlMeta.length > 0) {
      return ogUrlMeta
    }
    return null
  })
  return domainName != null
    ? new URL(domainName).hostname.replace("www.", "")
    : new URL(uri).hostname.replace("www.", "")
}

const getImage = async (page: any) => {
  const ogImage = await page.evaluate(() => {
    const ogImage = document.querySelector('meta[property="og:image"]')?.getAttribute('content')
    if (ogImage != null && ogImage.length > 0) {
      return ogImage
    }
    return ''
  })
  const valid = await imageAccessible(ogImage)
  if(valid){
    return ogImage
  }
  return ''
}

module.exports = async (
  uri: string
) => {
  const obj : {
    title: string,
    description: string,
    domain: string,
    image: string
  } = {
    title : '',
    description : '',
    domain : '',
    image : ''
  }
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  const response = await page.goto(uri)
  if(response.status() != 200){
    throw new Error('Error:'+response.status())
  }
  await page.exposeFunction("imageAccessible", imageAccessible)
  obj.title = await getTitle(page)
  obj.description = await getDescription(page)
  obj.domain = await getDomain(page, uri)
  obj.image = await getImage(page)
  await browser.close()
  return obj
}