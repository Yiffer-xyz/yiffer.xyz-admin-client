export async function urlToFile(url, filename, mimeType){
  let res = await fetch(url)
  let buffer = await res.arrayBuffer()
  return new File([buffer], filename, {type: mimeType})
}