const transferTypeMap: { [key in number]: string } = {
  1: '代理转账',
  2: '代理代存-代存',
  3: '额度调整',
  4: '代理红利',
  5: '代客充值',
  6: '佣金提现',
  7: '佣金发放',
  8: '额度还款',
  9: '佣金还款(用佣金還額度欠款)',
  10: '代理代存-红利',
  11: '代理充值',
  12: '佣金调整',
  13: '代理充值-还款',
  14: '佣金转额度',
  15: '佣金结算',
  16: '佣金提现返还',
}

export const transferType = (type: number) => {
  return type in transferTypeMap ? transferTypeMap[type] : type
}
