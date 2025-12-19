const bonusMap: { [key in number]: string } = {
  3: '平台红利',
  4: '升级礼金',
  5: '每月红包',
  6: '生日礼金',
  7: '代理红利',
  8: '推广红利',
  9: '存款优惠',
  10: '活动红利',
  11: '负数置零',
  12: '推荐红利',
  13: '预约取款',
  14: '提款优惠',
  15: '扣除彩金',
  119: '到账确认彩金',
  123: '代理代存-红利'
}

export const bonusType = (type: number) => {
  return type in bonusMap ? bonusMap[type] : type
}
