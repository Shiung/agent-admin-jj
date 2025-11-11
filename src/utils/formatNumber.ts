import Big from 'big.js'

// 格式化数字（保留2位小数）
export const formatNumber = (value: string | number, fixed = 2): string => {
  if (!value) return new Big(0).toFixed(fixed)
  return new Big(value).toFixed(fixed)
}

// 格式化金额（除以100，保留2位小数）
export const formatMoney = (value: string | number, fixed = 2, isDiv100 = true): string => {
  if (!value) return new Big(0).toFixed(fixed)
  if (isDiv100) return new Big(value).div(100).toFixed(fixed)
  return formatNumber(value, fixed)
}

// 格式化数字（大于等于10000显示K，保留2位小数）
export const formatNumberToK = (value: string | number, fixed = 0): string => {
  if (!value) return formatNumber(0, fixed)
  if (new Big(value).abs().gte(10000)) return new Big(value).div(1000).toFixed(fixed) + 'K'
  return formatNumber(value, fixed)
}

// 格式化金额，先除100，再格式化（大于等于10000显示K，保留2位小数）
export const formatMoneyToK = (value: string | number, fixed = 2): string => {
  if (!value) return formatMoney(0, fixed)

  if (new Big(value).div(100).abs().gte(10000)) return new Big(value).div(100).div(1000).toFixed(fixed) + 'K'
  return formatMoney(value, fixed)
}

// 格式化带符号的数字
export const formatSignedNumber = (value: string | number, fixed = 2, toK = true): { text: string; color: string } => {
  const formatted = toK ? formatNumberToK(value, fixed) : formatNumber(value, fixed)
  if (new Big(value ?? 0).gt(0)) {
    return { text: '+' + formatted, color: 'text-error-normal' }
  } else if (new Big(value ?? 0).lt(0)) {
    return { text: formatted, color: 'text-success-normal' }
  } else {
    return { text: formatted, color: 'text-neutral2-basic' }
  }
}

// 格式化带符号的金額
export const formatSignedMoney = (value: string | number, fixed = 2, toK = true): { text: string; color: string } => {
  const formatted = toK ? formatMoneyToK(value, fixed) : formatMoney(value, fixed)

  if (new Big(value ?? 0).gt(0)) {
    return { text: '+' + formatted, color: 'text-error-normal' }
  } else if (new Big(value ?? 0).lt(0)) {
    return { text: formatted, color: 'text-success-normal' }
  } else {
    return { text: formatted, color: 'text-neutral2-basic' }
  }
}