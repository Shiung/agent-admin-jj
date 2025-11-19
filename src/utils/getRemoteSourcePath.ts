const remoteImgUrl = import.meta.env.VITE_IMG_URL || ''
console.log('meta env', import.meta.env)

export default function getRemoteSourcePath(path: string) {
  return `${remoteImgUrl}${path}`
}
