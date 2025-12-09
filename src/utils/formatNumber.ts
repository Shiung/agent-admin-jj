import Big from 'big.js'

/**
 * 格式化数字
 * @param value 数字
 * @param fixed 保留小数位数
 * @returns 格式化后的数字
 */
export const formatNumber = (value: string | number, fixed = 2): number => {
  if (!value) return +new Big(0).toFixed(fixed)
  return +new Big(value).toFixed(fixed)
}

/**
 * 格式化数字（带千分位）
 * @param value 数字
 * @param fixed 保留小数位数
 * @param removeTrailingZeros 是否去除小数点后尾数0（默认true）
 * @returns 格式化后的数字字符串（带千分位）
 */
export const formatNumberWithCommas = (value: string | number, fixed = 0, removeTrailingZeros = true): string => {
  const num = formatNumber(value, fixed)
  return new Intl.NumberFormat('zh-CN', {
    minimumFractionDigits: removeTrailingZeros ? 0 : fixed,
    maximumFractionDigits: fixed,
  }).format(num)
}

/**
 * 格式化金额（除以100）
 * @param value 金额
 * @param fixed 保留小数位数
 * @param isDiv100 是否除以100
 * @returns 格式化后的金额
 */
export const formatMoney = (value: string | number, fixed = 2, isDiv100 = true): number => {
  if (!value) return +new Big(0).toFixed(fixed)
  if (isDiv100) return +new Big(value).div(100).toFixed(fixed)
  return +formatNumber(value, fixed)
}

/**
 * 格式化金额（除以100, 每三位加逗号）100000 => 1,000
 * @param value 金额
 * @param fixed 保留小数位数
 * @param isDiv100 是否除以100
 * @returns 格式化后的金额
 */
export const formatMoneyWithComma = (value: string | number, fixed = 2, isDiv100 = true): string => {
  if (!value) return formatMoney(0, fixed).toString()
  return formatMoney(value, fixed, isDiv100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/**
 * 格式化金额（除以100，带千分位）
 * @param value 金额
 * @param fixed 保留小数位数
 * @param removeTrailingZeros 是否去除小数点后尾数0（默认true）
 * @returns 格式化后的金额字符串（带千分位）
 */
export const formatMoneyWithCommas = (value: string | number, fixed = 2, removeTrailingZeros = true): string => {
  const amountInYuan = formatMoney(value, fixed, true)
  return new Intl.NumberFormat('zh-CN', {
    minimumFractionDigits: removeTrailingZeros ? 0 : fixed,
    maximumFractionDigits: fixed,
  }).format(amountInYuan)
}

/**
 * 格式化数字（大于等于10000显示K）
 * @param value 数字
 * @param fixed 保留小数位数
 * @returns 格式化后的数字
 */
export const formatNumberToK = (value: string | number, fixed = 0): string => {
  if (!value) return formatNumber(0, fixed).toString()
  if (new Big(value).abs().gte(10000)) return (+new Big(value).div(1000).toFixed(fixed)) + 'K'
  return formatNumber(value, fixed).toString()
}

/**
 * 格式化金额（大于等于10000显示K）
 * @param value 金额
 * @param fixed 保留小数位数
 * @returns 格式化后的金额
 */
export const formatMoneyToK = (value: string | number, fixed = 2): string => {
  if (!value) return formatMoney(0, fixed).toString()

  if (new Big(value).div(100).abs().gte(10000)) return (+new Big(value).div(100).div(1000).toFixed(fixed)) + 'K'
  return formatMoney(value, fixed).toString()
}

/**
 * 格式化带符号的数字
 * @param value 数字
 * @param fixed 保留小数位数
 * @param toK 是否格式化为K
 * @returns 格式化后的数字
 */
export const formatSignedNumber = (value: string | number, fixed = 2, toK = true): { text: string; color: string } => {
  const formatted = toK ? formatNumberToK(value, fixed) : formatNumber(value, fixed).toString()
  if (new Big(value ?? 0).gt(0)) {
    return { text: '+' + formatted, color: 'text-error-normal' }
  } else if (new Big(value ?? 0).lt(0)) {
    return { text: formatted, color: 'text-success-normal' }
  } else {
    return { text: formatted, color: 'text-neutral2-basic' }
  }
}

/**
 * 格式化带符号的金額
 * @param value 金额
 * @param fixed 保留小数位数
 * @param toK 是否格式化为K
 * @returns 格式化后的金额
 */
export const formatSignedMoney = (value: string | number, fixed = 2, toK = true): { text: string; color: string } => {
  const formatted = toK ? formatMoneyToK(value, fixed) : formatMoney(value, fixed).toString()

  if (new Big(value ?? 0).gt(0)) {
    return { text: '+' + formatted, color: 'text-error-normal' }
  } else if (new Big(value ?? 0).lt(0)) {
    return { text: formatted, color: 'text-success-normal' }
  } else {
    return { text: formatted, color: 'text-neutral2-basic' }
  }
}

/**
 * 格式化带符号的数字（带千分位）
 * @param value 数字
 * @param fixed 保留小数位数
 * @param removeTrailingZeros 是否去除小数点后尾数0（默认true）
 * @returns 格式化后的数字（带千分位）
 */
export const formatSignedNumberWithCommas = (value: string | number, fixed = 0, removeTrailingZeros = true): { text: string; color: string } => {
  const absValue = new Big(value ?? 0).abs()
  const formatted = new Intl.NumberFormat('zh-CN', {
    minimumFractionDigits: removeTrailingZeros ? 0 : fixed,
    maximumFractionDigits: fixed,
  }).format(+absValue.toFixed(fixed))

  if (new Big(value ?? 0).gt(0)) {
    return { text: '+' + formatted, color: 'text-error-normal' }
  } else if (new Big(value ?? 0).lt(0)) {
    return { text: '-' + formatted, color: 'text-success-normal' }
  } else {
    return { text: formatted, color: 'text-neutral2-basic' }
  }
}

/**
 * 格式化带符号的金额（除以100，带千分位）
 * @param value 金额
 * @param fixed 保留小数位数
 * @param removeTrailingZeros 是否去除小数点后尾数0（默认true）
 * @returns 格式化后的金额（带千分位）
 */
export const formatSignedMoneyWithCommas = (value: string | number, fixed = 2, removeTrailingZeros = true): { text: string; color: string } => {
  const amountInYuan = formatMoney(value, fixed, true)
  const absValue = new Big(amountInYuan).abs()
  const formatted = new Intl.NumberFormat('zh-CN', {
    minimumFractionDigits: removeTrailingZeros ? 0 : fixed,
    maximumFractionDigits: fixed,
  }).format(+absValue.toFixed(fixed))

  if (new Big(amountInYuan).gt(0)) {
    return { text: '+' + formatted, color: 'text-error-normal' }
  } else if (new Big(amountInYuan).lt(0)) {
    return { text: '-' + formatted, color: 'text-success-normal' }
  } else {
    return { text: formatted, color: 'text-neutral2-basic' }
  }
}
