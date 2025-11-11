const remoteImgUrl = import.meta.env.VITE_IMGURL || ''

export default function getRemoteSourcePath(path: string) {
  return `${remoteImgUrl}${path}`
}