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

export interface BankList {
  AgentId: number // 代理id
  BankCode: string // 银行代码
  BankName: string // 银行名称
  IsOpen: number // 是否开启
  Key: number // 键
}

export interface RealPackageIdNameMap {
  AdminId: number // 代理id
  PackageId: number // 包id
  PackageName: string // 包名称
}
export interface ConfigInfoData {
  BankList: BankList[] // 银行列表
  RealPackageIdNameMap: RealPackageIdNameMap[] // 真实包id与名称映射
}

export interface ConfigInfoResponse {
  Code: number
  Data: ConfigInfoData
  Msg: string
  Id: string
}


export interface NetcashdashboardInfoV2Response {
  Code: number
  Data: NetcashdashboardInfoV2Data
  Msg: string
  Id: string
}

export interface NetcashdashboardInfoV2Query {
  ReportType: number // 報表類型，1:日報，2:月報
  MonthDate: string // 查詢月份
  PackageId: number
}

export interface NetcashdashboardInfoV2MonthTotal {
  SumNewRegNum: number // 注册人数
  SumPayNum: number // 充值人数 (去重)
  SumWithdrawNum: number // 提現人数 (去重)
  SumNewPayMoney: number // 新會員存款金额，單位:分
  SumPayMoney: number // 充值金额，單位:分
  SumWithdrawMoney: number // 提現金额，單位:分
  SumFirstPayNum: number // 首存人数 
  SumBetGameNum: number // 投注人数 (去重)
  SumGoodBetGameMoney: number // 有效投注金额，單位:分
  SumFirstPayMoney: number // 首存金额，單位:分
  SumBetGameMoney: number // 投注金额，單位:分
  SumWinLostMoney: number // 公司输赢，單位:分
  SumAgentCustomerPayMoney: number // 代存金额，單位:分
  SumAgentCustomerPayNum: number // 代存人数
}

export interface NetcashdashboardInfoV2Data {
  PlayerNum: number // 下級成員數
  ActivityUserNum: number // 活躍會員數
  LastMonthTotal: NetcashdashboardInfoV2MonthTotal // 上月加總
  MonthTotal: NetcashdashboardInfoV2MonthTotal // 本月加總
}

export interface CompareGameDataQuery {
  ReportType: number // 報表類型，1:日報，2:月報
}

export interface CompareGameDataResponse {
  Code: number
  Data: CompareGameDataData
  Msg: string
  Id: string
}

export interface CompareGameDataData {
  GameData: GameDataItem[] // 當前週期遊戲數據
  LastPeriodGameData: GameDataItem[] // 之前週期遊戲數據
}

export interface GameDataItem {
  GameType: string // 遊戲代號(請前端mapping到遊戲名稱)
  SumValidWater: number // 有效投注，單位:分
  SumWinLose: number // 總盈利(公司輸贏)，單位:分
}

export interface SolidConfigResponse {
  Code: number
  Data: SolidConfigData
  Msg: string
  Id: string
}

export interface SolidConfigData {
  GameSetting: Record<string, any>[]
}