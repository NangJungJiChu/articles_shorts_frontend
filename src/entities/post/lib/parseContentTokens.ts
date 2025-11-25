/**
 * content 내의 특수 토큰들을 HTML 태그로 변환하는 함수
 * [IMAGE: url] -> <img />
 * [VIDEO: url] -> <video><source /></video>
 * [IFRAME: url] -> <iframe />
 */
export function parseContentTokens(content: string): string {
  let parsedContent = content

  // IMAGE 토큰 파싱: [IMAGE: url]
  parsedContent = parsedContent.replace(
    /\[IMAGE:\s*([^\]]+)\]/g,
    (_, url) => `<img src="${url.trim()}" alt="post image" class="content-image" />`
  )

  // VIDEO 토큰 파싱: [VIDEO: url]
  parsedContent = parsedContent.replace(
    /\[VIDEO:\s*([^\]]+)\]/g,
    (_, url) =>
      `<video controls class="content-video"><source src="${url.trim()}" type="video/mp4" /></video>`
  )

  // IFRAME 토큰 파싱: [IFRAME: url]
  parsedContent = parsedContent.replace(
    /\[IFRAME:\s*([^\]]+)\]/g,
    (_, url) =>
      `<iframe src="${url.trim()}" class="content-iframe" frameborder="0" allowfullscreen></iframe>`
  )

  return parsedContent
}
