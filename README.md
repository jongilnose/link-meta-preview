# link-meta-preview

> Get preview data (a title, description, image, domain name) from a url. Library uses puppeteer headless browser to scrape the web site.

## Install

```
$ npm install link-meta-preview
```

## Usage

```js
const LinkMetaPreview = require("link-meta-preview");
const run = async () => {
  const previewData = await LinkMetaPreview(
    "https://www.naver.com"
  );
  console.log(previewData)
}
run().catch(console.error)
/*
{
  title: '네이버',
  description: '네이버 메인에서 다양한 정보와 유용한 컨텐츠를 만나 보세요',
  domain: 'naver.com',
  image: 'https://s.pstatic.net/static/www/mobile/edit/2016/0705/mobile_212852414260.png'
}
*/
```

## API

### LinkMetaPreview(url)

#### url

Type: `string`

Scraped url.

## License

ISC © Bobby Park