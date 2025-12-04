/** 取得提款Icon */
export const getWithdrawTypeImage = (type: number | string) => {
  switch (parseInt(String(type))) {
    case 1001: // 普通银行卡
      return "../../static/images/payTypeIcon/yl.png"
    case 1002: // 普通支付宝
      return "../../static/images/payTypeIcon/zfb.png"
    case 1003: // 普通支付宝
      return "../../static/images/payTypeIcon/wy.png"
    case 3: // USDT
      return "../../static/images/payTypeIcon/btb.png"
    case 6: //EBPay
      return "../../static/images/payTypeIcon/ebpay.png"
    case 11: //易币付
      return "../../static/images/payTypeIcon/ybf.png"
    case 17: //DD
      return "../../static/images/payTypeIcon/dd.png"
    default:
      return ''
  }
}

/** 打銀行卡/支付寶帳號清單 or 虛擬幣帳號清單api時要帶的參數 */
export const getWithdrawAccountType = (type: number | string) => {
  switch (parseInt(String(type))) {
    case 1001: // 普通银行卡
      return 0
    case 1002: // 普通支付宝
      return 1
    case 1003: // 普通USDT
    case 3: // USDT
    case 11: //易币付
      return 'USDT'
    case 6: //EBPay
      return 'EB'
    case 17: //易币付
      return 'DDB'
    default:
      return ''
  }
}

/** 取得提款帳號種類名稱 */
export const getWithdrawAccountName = (type: number | string) => {
  switch (parseInt(String(type))) {
    case 1001: // 普通银行卡
      return '银行卡'
    case 1002: // 普通支付宝
      return '支付宝'
    case 1003: // 普通USDT
    case 3: // USDT
    case 11: //易币付
    case 6: //EBPay
      return '虚拟币'
    case 17: //DD
      return 'DD钱包'
    default:
      return ''
  }
}

/** 取得提現方式名稱(先寫死, 這邊應該跟提現拿到的Name一樣) */
export const getWithdrawName = (type: number | string) => {
  switch (parseInt(String(type))) {
    case 1001:
      return '普通银行卡'
    case 1002:
      return '普通支付宝'
    case 1003:
      return '普通USDT'
    case 1:
      return '银行卡'
    case 2:
      return '支付宝'
    case 3:
      return 'USDT'
    case 4:
      return '银行卡预约'
    case 5:
      return 'CNYB'
    case 6:
      return 'EBPay'
    case 7:
      return 'HH5'
    case 8:
      return 'TX转卡'
    case 9:
      return 'OKpay'
    case 10:
      return '万币'
    case 11:
      return '易币付虚拟币'
    case 12:
      return 'Koipay'
    case 13:
      return '4E'
    case 14:
      return '波币'
    case 15:
      return '玖鼎管家'
    case 16:
      return '易汇钱包'
    case 17:
      return 'DD钱包'
    case 18:
      return '微信'
    case 19:
      return 'JDpay'
    case 20:
      return '808pay'
    case 21:
      return '988pay'
    case 22:
      return 'CBpay'
    case 23:
      return '代理代提'
    case 142:
      return '提现调整'
    default:
      return ''
  }
}

/** 取得充值Icon */
export const getRechargeTypeImage = (type: number | string) => {
  switch (parseInt(String(type))) {
    case 11: // USDT支付
      return '../../static/images/payTypeIcon/btb.png'
    case 13: // USDT
      return '../../static/images/payTypeIcon/btb.png'
    case 28: // EBPay
      return '../../static/images/payTypeIcon/ebpay.png'
    case 35: // GDF
      return '../../static/images/payTypeIcon/gdf.png'
    case 40: // DD钱包
      return '../../static/images/payTypeIcon/dd.png'
  }
}

/** 取得充值名稱 */
export const getRechargeName = (type: number | string) => {
  switch (parseInt(String(type))) {
    case 11:
      return 'USDT支付'
    case 13:
      return 'USDT'
    case 28:
      return 'EBPay'
    case 35:
      return 'GDF'
    case 40:
      return 'DD钱包'
    default:
      return ''
  }
}

/** 充值判斷幣種用 */
export const getRechargeAccountType = (type: number | string) => {
  switch (parseInt(String(type))) {
    case 11: // USDT支付
    case 13: // USDT
    case 35: // GDF
      return 'USDT'
    case 28: // EBPay
      return 'EB'
    case 40: //DD
      return 'DD钱包'
    default:
      return ''
  }
}

/** 充值提交訂單後判斷是不是三方用 */
export const getRechargeType = (type: number | string) => {
  switch (parseInt(String(type))) {
    case 13: // USDT
    case 35: // GDF
      return 'custom'
    case 28: // EBPay
    case 11: // USDT支付
    case 40: // DDB
      return 'thirdParty'
    default:
      return ''
  }
}

/** 手機號碼轉隱碼 */
export function hidePhoneNumber(phoneNumber: string): string {
  const parts = phoneNumber.split('_')
  if (parts.length < 0) return phoneNumber
  const lastPart = parts.pop()
  const masked = (lastPart && lastPart.length > 4) 
    ? '*'.repeat(lastPart.length - 4) + lastPart.slice(-4) 
    : lastPart
  return parts.concat([masked as string]).join('_')
}

/** email轉隱碼 */
export function hideEmail(email: string): string {
  const [username, domain] = email.split('@')
  if (!username || !domain) return email
  const maskedUsername = (username.length) > 1 ? username[0] + '****' : username
  return maskedUsername + '@' + domain
}
