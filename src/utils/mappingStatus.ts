const bonusMap: { [key in number]: string } = {
  3: '平台紅利',
  4: '升級禮金',
  5: '每月紅包',
  6: '生日禮金',
  7: '代理紅利',
  8: '推廣紅利',
  9: '存款優惠',
  10: '活動紅利',
  11: '負數置零',
  12: '推薦紅利',
  13: '預約取款',
  14: '提款優惠',
  15: '扣除彩金',
  119: '到帳確認彩金',
  123: '代理代存-紅利'
}

export const bonusType = (type: number) => {
  return type in bonusMap ? bonusMap[type] : type
}