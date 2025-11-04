const getDeviceId = () => {
  if (localStorage.getItem('DeviceId_serial')) return localStorage.getItem('DeviceId_serial')

  //设置生成随机Id
  const nam1 = setRandom(8, 5)
  const nam2 = setRandom(4, 5)
  const nam3 = setRandom(4, 5)
  const nam4 = setRandom(4, 5)
  const nam5 = setRandom(12, 8)
  const str = `${nam1}-${nam2}--${nam3}--${nam4}-${nam5}`
  
  localStorage.setItem('DeviceId_serial', str)
  return localStorage.getItem('DeviceId_serial')

}

const setRandom = (num1: number, num2: number) => {
  const name = []
  const letter = generateSmall_1()
  for (let i = 0; i < num1; i++) {
    name.push(letter[Math.round(Math.random() * 26)])
  }
  for (let i = 0; i < num2; i++) {
    name[Math.round(Math.random() * name.length - 1)] = Math.round(Math.random() * 9)
  }
  return name.join('')
}

const generateSmall_1 = () => {
  //设置26个字母
  const str = []
  for (let i = 97; i < 123; i++) {
    str.push(String.fromCharCode(i))
  }
  return str
}

export default getDeviceId