export interface LoginFormData {
  Username: string
  Password: string
  ValidCode: string
  KeyCode: string
  FromType: number
  Domain: string
  IsApp: number
  UseNewPermission: boolean
  Platform: string
  DeviceId: string
}

export interface LoginResponseData {
  LoginType: number
}

export interface LoginResponse {
  Code: number
  Data: LoginResponseData | UserInfo | null
  Msg: string
  Id: string
}

export interface ImageValidCodeResponse {
  Code: number
  Data: {
    Item: string
    KeyCode: string
  }
  Msg: string
  Id: string
}

export interface VLoginFormData {
  Username: string
  Password: string
  ValidCode: string
}

export interface VLoginResponse {
  Code: number
  Data: UserInfo | null
  Msg: string
  Id: string
}

export interface UserInfo {
  Account: Record<string, any>
  Admin: Record<string, any>
  IsRequireGoogleAuthBinding: number
  NavV2: Record<string, any> | null
  NetCashAccount: Record<string, any>
  RoleV2: Record<string, any> | null
  SubMenusV2: Record<string, any>
  Token: string
}

export interface IsLoginResponse {
  Code: number
  Data: UserInfo | null
  Msg: string
  Id: string
}

export interface CompareCommissionResponse {
  Code: number
  Data: CompareCommissionResponseData
  Msg: string
  Id: string
}

export interface CompareCommissionResponseData {
  CurrentMonth: CompareCommissionData
  LastMonth: CompareCommissionData
}

export interface CompareCommissionData {  
  ReportMonth: string // 佣金月份
  CommissionTotal: number // 预计佣金 
  CommissionRate: number // 佣金比例
  BetWinTotal: number // 公司输赢，單位:分
  MoneyChangeFee: number // 輸贏調整承擔費用，單位:分
  ApiFeeTotalFee: number // 平台費承擔費用，單位:分
  PayMoneyFee: number // 存款承擔費用，單位:分
  WithdrawMoneyFee: number // 提款承擔費用，單位:分
  BackWaterGoldFee: number // 返水承擔費用，單位:分
  RedGoldFee: number // 紅利承擔費用，單位:分
  LastMonthCleanBetWinTotal: number // 上期结余，單位:分
  AdminChargeMoneyFee: number // 代存回馈，單位:分
  CommissionChildTotal: number // 下級貢獻，單位:分
  CommissionChildList: CommissionChildList[] // 各層下級貢獻
  CleanBetWinTotal: number // 净输赢，單位:分
}

export interface CommissionChildList {
  Level: number // 代理层级
  CurrentAdmin: boolean // 是否为登入者层级
  CommissionTotal: number // 佣金总计，单位:分
}
