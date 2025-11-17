const remoteImgUrl = import.meta.env.VITE_IMG_URL || ''

export default function getRemoteSourcePath(path: string) {
  return `${remoteImgUrl}${path}`
}
