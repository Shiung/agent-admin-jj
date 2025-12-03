import { showFailToast } from 'vant'
import { ref } from 'vue'

const _isBase64Image = (s: string) => {
  const reqex = /^data:image\/(png|jpg|jpeg|gif|svg\+xml);base64,[A-Za-z0-9+/=]+$/
  return reqex.test(s)
}

/**
 * 將 Base64 DataURL 轉成 Blob
 * @param base64 - Base64 Data URL，例如 "data:image/png;base64,iVBORw0K..."
 * @returns Blob 物件，若格式錯誤則回傳 null
 */
const _base64ToBlob = (base64: string): Blob | null  => {
  if (typeof base64 !== 'string') return null
  const parts = base64.split(',')
  if (parts.length !== 2) return null

  const [meta, data] = parts
  if (!meta || !data) return null
  const mimeMatch = meta.match(/:(.*?);/)
  if (!mimeMatch) return null

  const mime = mimeMatch[1]
  try {
    const binary = atob(data)
    const array = Uint8Array.from(binary, (char) => char.charCodeAt(0))
    return new Blob([array], { type: mime })
  } catch {
    return null
  }
}

/**
 * 將 Base64 DataURL 轉成 File 物件
 * @param base64 - 例如 data:image/png;base64,iVBORw0K...
 * @param filename - 檔名
 */
function _base64ToFile(base64: string, filename = 'image.png'): File | null {
  const [meta, data] = base64.split(',')
  if (!meta || !data) return null
  const mime = meta.match(/:(.*?);/)?.[1] || 'image/png'
  const binary = atob(data)
  const array = Uint8Array.from(binary, (c) => c.charCodeAt(0))
  return new File([array], filename, { type: mime })
}

export default function useImage() {
  const copyIng = ref<boolean>(false)

  const downLoadImage = (url: string, fileName: string = 'qrcode.png') => {
    const checkIsBase64 = _isBase64Image(url)
    if (!checkIsBase64) alert('image error')
    const link = document.createElement('a')
    link.download = fileName
    link.href = url
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }


  /** 
   * 複製圖片到剪貼簿 
   * @param s 圖片路徑(base64)
   * @returns boolean , `true` 成功複製 `false` 複製失敗
   **/ 
  const copyImageToClipboard = async(s: string): Promise<boolean> => {
    try {
      const blob = _base64ToBlob(s)
      if (!blob) throw { message: '_base64ToBlob null' }
      copyIng.value = true
      const item = new ClipboardItem({ [blob.type]: blob })
      await navigator.clipboard.write([item])
      copyIng.value = false
      return true
    } catch (err) {
      console.error(err)
      // alert('❌ 複製失敗')
      return false
    }
  }

  /**
   * 使用 Web Share API 分享圖片
   */
  async function shareBase64Image(base64: string) {
    if (!navigator.share) {
      showFailToast({ message: '系统不支援' })
      return
    }

    try {
      const file = _base64ToFile(base64, 'qrcode.png')
      if (!file) throw { message: '_base64ToFile null' }
      const filesArray = [file]
      await navigator.share({
        // title: '我的 QR Code',
        // text: '快掃描這個 QR Code！',
        files: filesArray,
      })
    } catch (err) {
      console.error('❌ 分享失败', err)
    }
  }

  return {
    copyIng,
    downLoadImage,
    copyImageToClipboard,
    shareBase64Image
  }
}