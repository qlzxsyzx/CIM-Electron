import emojis from './emoji'
const emojiList = emojis
const emojiMap = emojiList.reduce((acc, emoji) => {
  acc.set(emoji.name, emoji.url)
  return acc
}, new Map())
const emojiRegex = /\[(.*?)\]/g

// 输入框复制文本事件回调
export const handlePaste = (e,fileUploadCallback) => {
  let clp = (e.originalEvent || e).clipboardData
  // 处理items的文件类型资源
  const isImage = handleFileItems(clp.items,fileUploadCallback)
  if(isImage){
    return
  }
  const html = clp.getData('text/html')
  const html2 = html.substring(html.indexOf('-->') + 3, html.lastIndexOf('<!--'))
  const message = decodeMessageToHtml(encodeHtmlToMessage(html2))
  if(!message){
    document.execCommand('insertText', false, clp.getData('text/plain'))
  }else {
    console.log(isImage)
    document.execCommand('insertHtml', false, message)
  }
}

const handleFileItems = (items,fileUploadCallback) => {
  let isImage = false
  // 是文件不是图片就回调fileUploadCallback
  for (let i = 0; i < items.length; i++) {
    if (items[i].kind !== 'file') {
      continue
    }
    if(items[i].type === ''){
      continue
    }
    if (items[i].type.indexOf('image') === -1) {
      fileUploadCallback(items[i].getAsFile())
    }
    // 是图片就document insertHtml
    if (items[i].type.indexOf('image') !== -1) {
      isImage = true
      const reader = new FileReader()
      reader.readAsDataURL(items[i].getAsFile())
      reader.onload = function (e) {
        const base64 = e.target.result
        const img = `<img src="${base64}" style="max-width: 300px; max-height: 300px;" />`
        document.execCommand('insertHtml', false, img)
      }
    }
  }
  return isImage
}

export const decodeMessageToHtml = (message) => {
  // 解码消息格式 text[图片 src='']text[表情]
  const decodedMessage1 = message.replace(/\[图片 src="(.*?)"]/g, `<img src="$1" class="cim-image" style="max-width: 300px; max-height: 300px;" />`)
  // 将消息中的[笑]等格式的字符替换为emoji image
  const decodedMessage2 = decodedMessage1.replace(emojiRegex, (match, name) => {
    const emojiUrl = emojiMap.get(name)
    if (emojiUrl) {
      return `<img src="${emojiUrl}" title="${name}" class="cim-emoji" width="25" height="25" style="vertical-align: middle;">`
    }
    return match
  })
  // 处理\n 为 <br>
  const decodedMessage3 = decodedMessage2.replace(/\n/g, '<br>')
  return decodedMessage3
}

export const encodeHtmlToMessage = (html) => {
  // 将消息中的<br>替换为\n;
  const encodedHtml1 = html.replace(/<br.*?>/g, '\n')
  // 将消息中的<img src="xxx" title="name" class="cim-emoji"...>替换为[name]
  const encodedHtml2 = encodedHtml1.replace(
    /<img src=".*?" title="(.*?)" class="cim-emoji" width="25" height="25" style=".*?">/g,
    '[$1]'
  )
  // 将消息中的<img .* src="xxx" .* /?>替换为[图片 src='xxx']
  const encodedHtml3 = encodedHtml2.replace(
    /<img .*?src="(.*?)".*?\/?>/g,
    '[图片 src="' + '$1' + '"]'
  )
  // 将 <.*>...<.*>text</.*>...</.*> 替换为text
  const encodedHtml4 = removeHtmlTags(encodedHtml3)
  return encodedHtml4
}

function removeHtmlTags(input) {
  return input.replace(/<[^>]+>/g, '') // 移除所有 HTML 标签
  // var tempElement = document.createElement('div');
  // tempElement.innerHTML = input;
  // return tempElement.textContent || tempElement.innerText || ''; // 获取纯文本内容
}
