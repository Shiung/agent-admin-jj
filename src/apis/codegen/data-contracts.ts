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
  CommissionTotal: number // 预计佣金(單層)
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
  CommissionChildTotal: number // 下級貢獻，單位:分(多層)
  CommissionChildList: CommissionChildList[] // 各層下級貢獻
  CleanBetWinTotal: number // 净输赢，單位:分
  CommissionSelfTotal: number // 会员佣金，單位:分(多層)
}

export interface CommissionChildList {
  Level: number // 代理层级
  CurrentAdmin: boolean // 是否为登入者层级
  CommissionTotal: number // 佣金总计，单位:分
}

/** `0` 代理域名 `1` 專屬域名 */
export type DomainType = 0 | 1

interface Domain {
  /** 域名類型 */
  NetCashDomainType: DomainType
  /** 域名 */
  Domain: string
}

export interface PromotionlinkListV2Request {
  NetCashDomainType: DomainType
}

export interface PromotionlinkListV2ResponseData {
  /** 管理員 ID */
  AdminId: number
  /** 代理 ID */
  AgentId: number
  /** 渠道 ID */
  ChannelId: string
  /** 克隆渠道 ID */
  CloneChannelId: string
  /** 產品 ID */
  PackageId: number
  /** 產品名稱 */
  PackageName: string
  /** 邀請碼 */
  InvitationCode: string
  /** 建渠道的安卓母包版本 */
  AndroidPackVersion: string
  /** 建渠道的IOS母包版本 */
  IosPackVersion: string
  /** 推廣類型
   * `0` 游戏-首页
   * `1` 游戏-直播页
   * `2` 纯直播
   * `3` 首页（无直播）
   * `4` 纯直播（登录后游戏-直播页）
   * `5` 游戏-杯赛页
   */
  PushType: 0 | 1 | 2 | 3 | 4 | 5
  /** 產品圖標 */
  Icon: string
  /** APP 域名連結 */
  AppDomains: Array<Domain>
  /** PC/H5 域名連結 */
  H5Domains: Array<Domain>
  /** 創建時間 */
  CreateTime: number
}

export interface PromotionlinkListV2Response {
  Code: number
  Data: { Items: Array<PromotionlinkListV2ResponseData> }
  Msg: string
  Id: string
}

export interface PromotionconfListallResponseData {
  /** 素材 ID */
  Id: number
  /** 代理 ID */
  AdminId: number
  /** 元素類型 */
  Type: PromotionconfListallRequest['Type']
  /** 內容 */
  Value: string
  /** 是否刪除 */
  Deleted: number
  /** 建立素材的管理員 ID */
  CreateAdminId: number
  /** 創建時間 */
  CreateTime: number
  /** 更新時間 */
  UpdateTime: number
}

export interface PromotionconfListallRequest {
  /** 元素類型
   * `1` 尺寸
   * `2` 主題
   */
  Type: 1 | 2
}

export interface PromotionconfListallResponse {
  Code: number
  Data: { Items: Array<PromotionconfListallResponseData> }
  Msg: string
  Id: string
}

export interface PromotionmaterialsListallResponseData {
  /** 素材 ID */
  Id: number
  /** 素材圖片路徑 */
  ImagePath: string
  /** 代理語言分組 ID */
  LangGroupId: number
  /** 產品 ID */
  PackageId: number
  /** 產品名稱 */
  PackageName: string
  /** 尺寸 ID */
  SizeId: number
  /** 尺寸名稱 */
  SizeName: string
  /** 主題 ID */
  ThemeId: number
  /** 主題名稱 */
  ThemeName: string
  /** 創建時間 */
  CreateTime: number
}
export interface PromotionmaterialsListallRequest {
  /** 尺寸 ID */
  SizeId?: number
  /** 主題 ID */
  ThemeId?: number
  /** 產品 ID */
  PackageId?: number
}

export interface PromotionmaterialsListallResponse {
  Code: number
  Data: { Items: Array<PromotionmaterialsListallResponseData> }
  Msg: string
  Id: string
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

export interface ReportsChartsQuery {
  ReportType: number // 報表類型，1:日報，2:月報
  PackageId: number
  ParamAmountLeft: string // 金額維度指標名稱
  ParamAmountRight: string // 金額維度指標名稱
  ParamCountLeft: string // 數量維度指標名稱
  ParamCountRight: string // 數量維度指標名稱
}

export interface ReportsChartsResponse {
  Code: number
  Data: ReportsChartsData
  Msg: string
  Id: string
}

export interface ReportsChartsData {
  ParamAmountList: string[] // 金額維度下拉選單
  ParamCountList: string[] // 數量維度下拉選單
  MonthReportChartItems: ReportChartItems // 月報各項指標資料
  DayReportChartItems: ReportChartItems // 日報各項指標資料
}

export interface ReportChartItems {
  ParamAmountLeft: ReportChartItem[]
  ParamAmountRight: ReportChartItem[]
  ParamCountLeft: ReportChartItem[]
  ParamCountRight: ReportChartItem[]
}

export interface ReportChartItem {
  ReportDay?: string
  ReportMonth?: string
  ParamName: string
  ParamValue: string // 指標值，如為金額(ParamAmount)則單位為分
}
