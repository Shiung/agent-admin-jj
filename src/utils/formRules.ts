/** 必填 */
export const rulesRequired = (params: any = {}) => {
  return {
    required: true,
    message: '此项为必填',
    ...(params)
  }
}
/** TRC20 */
export const rulesTRC20 = (params: any = {}) => {
  return {
    pattern: /^T/,
    message: '不符合 TRC20 规则，必须以 T 开头',
    ...(params)
  }
}
/** ERC20 */
export const rulesERC20 = (params: any = {}) => {
  return {
    pattern: /^0x/,
    message: '不符合 ERC20 规则，必须以 0x 开头',
    ...(params)
  }
}
/** EBPay */
export const rulesEBPay = (params: any = {}) => {
  return {
    pattern: /^eb/,
    message: '不符合 EBPay 规则，必须以 eb 开头',
    ...(params)
  }
}
/** 銀行卡號 */
export const rulesBankCard = (params: any = {}) => {
  return {
    pattern: /^([1-9]{1})(\d{11}|\d{15}|\d{16}|\d{17}|\d{18})$/,
    message: '长度必须在16-19之间',
    ...(params)
  }
}
/** 手機號 */
export const rulesTelephone = (params: any = {}) => {
  return {
    pattern: /^1[3-9]\d{9}$/,
    message: '请输入正确的手机号码',
    ...(params)
  }
}
/** 郵箱 */
export const rulesMail = (params: any = {}) => {
  return {
    pattern: /^\w+([.-]\w+)*@\w+([.-]\w+)*\.\w{2,3}$/,
    message: '请输入正确的邮箱',
    ...(params)
  }
}
/** 手機或郵箱 */
export const rulesTelephoneOrMail = (params: any = {}) => {
  return {
    pattern: /^1[3-9]\d{9}$|^\w+([.-]\w+)*@\w+([.-]\w+)*\.\w{2,3}$/,
    message: '不是一个有效的手机号或邮箱',
    ...(params)
  }
}
/** 手機/郵箱/谷歌 驗證碼 */
export const rulesVerifyCode = (params: any = {}) => {
  return {
    pattern: /\b\d{6}\b/,
    message: '请输入6位数验证码',
    ...(params)
  }
}