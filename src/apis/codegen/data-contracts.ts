export type * from './Finance/type.d.ts'

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

export interface SendPhoneVerifyCodeQuery {
  DeviceId: string
  OpType: number
  Number: string
}

export interface SendPhoneVerifyCodeResponse {
  Code: number
  Data: string
  Msg: string
  Id: string
}

export interface SendEmailVerifyCodeQuery {
  DeviceId: string
  OpType: number
  Email: string
}

export interface SendEmailVerifyCodeResponse {
  Code: number
  Data: string
  Msg: string
  Id: string
}

export interface MineResponse {
  Code: number
  Data: string
  Msg: string
}

export interface PhoneVerifyResponse {
  Code: number
  Data: string
  Msg: string
  id?: string
  errorCode?: string
  message?: string
}

export interface EmailVerifyResponse {
  Code: number
  Data: string
  Msg: string
}

export interface GoogleValidResponseData {
  QrCode: string
  Secret: string
}
export interface GoogleCodeResponse {
  Code: number
  Data: GoogleValidResponseData | null
  Msg: string
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
  CommissionRate: number // 佣金比例(單層:30代表30%,多層3000代表30%)
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
  CloneChanelId: string
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

export interface SystemConfigRequest {
  Domain: string
}

export interface SystemConfigResponse {
  Code: number
  Data: SystemConfigData
  Msg: string
  Id: string
}

export interface SystemConfigData {
  /** 手機號註冊開關 開=1, 關=0 */
  PhoneRegister: number
  /** 手機號驗證開關 開=1, 關=0 */
  PhoneVerify: number
  /** 手機號綁定開關 開=1, 關=0 */
  PhoneBind: number
  /** 郵箱註冊開關 開=1, 關=0 */
  EmailRegister: number
  /** 郵箱驗證開關 開=1, 關=0 */
  EmailVerify: number
  /** 郵箱綁定開關 開=1, 關=0 */
  EmailBind: number
  /** 谷歌驗證開關 開=1, 關=0 */
  GoogleVerify: number
  /** 谷歌綁定開關 開=1, 關=0 */
  GoogleBind: number
  /** 彈窗開關 開=1, 關=0 */
  PupUp: number
  /** 提示介面文本 */
  Tips: string
  AgentId: number
}

export interface AccountInfoResponse {
  Code: number
  Data: AccountInfoData
  Msg: string
  Id: string
}

export interface AccountInfoData {
  Ip: string
  Address: string
  Count: number // 登录次数
  Country: number
  Username: string
  /** 真實姓名 */
  RealName: string
  Phone: string
  Email: string
  GoogleSecret: string
  QQ: string
  PrivatePassword: string
  /** 是否設置私人密碼 1:是 2:否 */
  IsSetPrivatePassword: number
  Name: string
  CreateTime: number
  IsAllowOtherDeviceLogin: number
  LoginType: number
  TimeFreeVerification: number
  AccountLevel: number
  /** 代理層級 1:單層代理，2:單層團隊代理，3:多層代理 */
  AccountType: number
  CommissionTemplateId: number
  CommissionMultiTemplateId: number
  CommissionRateStr: string
  CommissionRate: {
    Level: number
    LevelName: string
    ActiveNum: number
    SumWinLose: number
    CommissionRate: number
  }[]
  SettlementType: number
  ParentAdminId: number
  ParentUsername: string
  /** 佣金設定生效日，空字串不顯示 */
  CommissionActiveDate: string
  /** 設定生效前的佣金比例，空字串不顯示 */
  LastCommissionRate: string
  /** 設定生效前佣金結算週期，1:日結 2:週結 3:月結，0不顯示 */
  LastSettlementType: number
}

export interface CommissionRateItem {
  Level: number // 层级
  LevelName: string // 层级名称
  ActiveNum: number // 活跃人数
  SumWinLose: number // 输赢金额，单位:分
  CommissionRate: number // 佣金比例
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

export interface GameListConfigRequest {
  /** false:全部, true:只查詢代理可見的場館 */
  AgentVisible: boolean
}

export interface GameListConfigResponse {
  Code: number
  Data: Array<{
    PlatformType: number
    PlatformName: string
    Games: Array<{
      PlatformType: number
      GameId: number
      GameCode: string
      Name: string
      SysEnable: boolean
      Visible: boolean
    }>
  }>
  Msg: string
  Id: string
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

// ==================== 报表 - 佣金 API ====================
export interface PutNetcashmultiRequest {
  AdminId: number // 代理ID
  Password: string // 密碼
  ConfirmPassword: string // 確認密碼
  Name: string // 名稱
  CommissionRate: string // 佣金比例（單費率為數值，多費率為JSON格式保存不同的場館類型分成）
  Remark: string // 備註
}

export interface ReportCenterCommissionQuery {
  ReportBeginTime: number // Unix 时间戳
  ReportEndTime: number // Unix 时间戳
}

export interface ReportCenterCommissionResponse {
  Code: number
  Data: ReportCenterCommissionData
  Msg: string
  Id: string
}

export interface ReportCenterCommissionData {
  CurrentMonthMultiLayer: MultiLayerCommissionData
  CurrentMonthSingleLayer: SingleLayerCommissionData
  LastMonthMultiLayer: MultiLayerCommissionData
  LastMonthSingleLayer: SingleLayerCommissionData
}

/** 多层代理佣金数据 */
export interface MultiLayerCommissionData {
  AccountLevel: number // 显示代理级别, 用于无限代理显示代理层数
  AccountType: number // 1=单层代理,2=多层代理-单费率,3=多层
  ActivityUserNum: number // 活跃用户数量
  ActualCommissionChangeAfter: number // 调整后实际应发佣金
  ActualCommissionTotal: number // 实际应发佣金, 系统发放一级代理=自己+所有下級, 系统发放所有代
  AdminChargeMoney: number // 代充金额
  AdminChargeMoneyFee: number // 代充金额奖励
  AdminChargeMoneyRate: number // 代充金额奖励比例
  AdminId: number // 推广ID
  AgentId: number // 代理ID
  AlgorithmTemplateId: number // 佣金算法方案
  ApiFeeTemplateId: number // 场馆费率模板id
  ApiFeeTotal: number // 平台费，不同场馆汇总
  ApiFeeTotalFee: number // 平台费費用
  BackWaterGold: number // 返水
  BackWaterGoldFee: number // 返水費用
  BetGold: number // 总押注
  CleanBetWinTotal: number // 当月净输赢
  CommissionActiveDate: string // 佣金設定生效日期
  CommissionChangeAfter: number // 调整后佣金
  CommissionChangeAmount: number // 调整金额：计算佣金+调整金额=调整后佣金
  CommissionChildTotal: number // 计算佣金-下级贡献
  CommissionLv: number // 佣金方案档次
  CommissionMultiTemplateId: number // 多层多费率佣金方案模板id
  CommissionRate: string // 多层费率佣金，如 "5500" = 55%
  CommissionSelfTotal: number // 计算佣金-自营
  CommissionTemplateId: number // 单层佣金方案模板id
  CommissionTotal: number // 计算佣金=自营+下级
  CommissionType: number // 佣金类型：1=场馆佣金,2=流水佣金
  CreateTime: number
  CreditDue: number // 代理代存还款金额
  DataSearchType: number // 数据查询类型, 数据类型 0:正式,1:測試,2:全部
  Desc: string // 备注
  Id: number // 資料id
  IsNegativeWinAdd: number // 当月的负盈利是否累积到下月 1:累积 0:不累积
  IsPositiveWinAdd: number // 当月的正盈利是否累积到下月：未达到佣金档次 1:累积 0:不累积
  IsSettlement: number // 是否已经结算，-1未处理 1成功 2拒绝
  LastCommissionRate: string // 最後佣金比例
  LastMonthAdminChargeMoneyFee: number // 上月代充金额奖励
  LastMonthCleanBetWinTotal: number // 上期結餘
  LastSettlementType: number // 最後佣金週期
  MoneyChange: number // 輸贏調整
  MoneyChangeFee: number // 輸贏調整費用
  MonthCleanBetWinTotal: number // 本月累计值，提供给下个月使用
  ParentAdminId: number // 显示上级代理, 用于无限代理显示上层代理
  PayMoney: number // 存款
  PayMoneyFee: number // 存款费用
  PayMoneyRate: number // 存款费率:10000分之一
  PlatformTypeWinLose: string // 场馆输赢存储
  RealCleanBetWinTotal: number // 本期結餘
  RedAdminChargeCommissionGold: number // 佣金代充红利
  RedAdminChargeGold: number // 代理代充红利:包含信用代充红利和佣金代充红利
  RedAdminGold: number // 代理红利，人工存入
  RedGold: number // 红利
  RedGoldFee: number // 红利費用
  RedRecommendGold: number // 推荐红利自动，邀请好友
  RedRecommendGold2: number // 推广红利2推荐红利，人工存入
  Remark: string // 调整原因
  ReportDay: string // 统计日期2019-04-16
  ReportDayEnd: string // 统计日期2019-04-16 结束时间
  ReportDayEndTime: number // 统计日期2019-04-16 结束时间的时间戳方式
  ReportDayTime: number // 统计日期2019-04-16的时间戳方式
  ReportMonth: string // 统计日期2019-04
  SendCommissionType: number // 发佣方式: 1=系统发放一级代理 2=系统发
  SendType: number // 佣金类型: 1=云平台发放,2=代理后台发放
  SettlementName: string // 结算人/发放人
  SettlementTime: number // 结算日期
  SettlementType: number // 佣金周期 1=日结,2=周结,3=月结
  TeamLeaderId: number // 团长ID，通过这个字段判断类型
  UpdateTime: number
  ValidWater: number // 总有效流水
  WinGold: number // 总返奖
  WithdrawAdjustMoney: number // 取款调整
  WithdrawAdjustMoneyFee: number // 取款调整费用
  WithdrawMoney: number // 取款
  WithdrawMoneyFee: number // 取款费用
  WithdrawMoneyRate: number // 取款费率：10000分之一
}

/** 单层代理佣金数据 */
export interface SingleLayerCommissionData {
  ActivityUserNum: number // 活跃用户数量
  AdminChargeMoney: number // 代充金额
  AdminChargeMoneyFee: number // 代充金额奖励
  AdminChargeMoneyRate: number // 代充金额奖励比例
  AdminId: number // 推广ID
  AgentId: number // 代理ID
  AlgorithmTemplateId: number // 佣金算法方案
  ApiFeeTemplateId: number // 平台费又名场馆费ID
  ApiFeeTotal: number // 平台费，不同场馆汇总
  ApiFeeTotalFee: number // 平台费費用
  BackWaterGold: number // 返水
  BackWaterGoldFee: number // 返水費用
  BetGold: number // 总押注
  CleanBetWinTotal: number // 当月净输赢
  CommissionActiveDate: string // 佣金設定生效日期
  CommissionChangeAfter: number // 调整后佣金
  CommissionChangeAmount: number // 调整金额：计算佣金+调整金额=调整后佣金
  CommissionLv: number // 佣金方案档次
  CommissionRate: number // 佣金比例
  CommissionTemplateId: number // 佣金方案ID
  CommissionTotal: number // 计算佣金
  CreateTime: number // 创建时间
  DataSearchType: number // 数据查询类型, 数据类型 0:正式,1:測試,2:全部
  Id: number // 資料id
  IsNegativeWinAdd: number // 当月的负盈利是否累积到下月 1:累积 0:不累积
  IsPositiveWinAdd: number // 当月的正盈利是否累积到下月：未达到佣金档次 1:累积 0:不累积
  IsSettlement: number // 是否已经结算，-1未处理 1成功 2拒绝
  LastCommissionRate: string // 最後佣金比例
  LastMonthAdminChargeMoneyFee: number  // 上月代充金额奖励
  LastMonthCleanBetWinTotal: number // 上期結餘
  LastSettlementType: number // 最後佣金週期
  MoneyChange: number // 輸贏調整
  MoneyChangeFee: number // 輸贏調整費用
  PayMoney: number // 存款
  PayMoneyFee: number // 存款费用
  PayMoneyRate: number // 存款费率：10000分之一
  RealCleanBetWinTotal: number // 本期結餘
  RedAdminChargeCommissionGold: number // 佣金代充红利
  RedAdminChargeGold: number // 代理代充红利:包含信用代充红利和佣金代充红利
  RedAdminGold: number // 代理红利，人工存入
  RedGold: number // 红利
  RedGoldFee: number // 红利費用
  RedRecommendGold: number // 推荐红利自动，邀请好友
  RedRecommendGold2: number // 推荐红利，人工存入
  ReportDay: string // 统计日期2019-04-16
  ReportDayTime: number // 统计日期2019-04-16的时间戳方式
  ReportMonth: string // 统计日期2019-04
  SettlementTime: number // 结算日期
  TeamLeaderId: number // 团长ID，通过这个字段判断类型
  WinGold: number // 总返奖
  WithdrawAdjustMoney: number // 取款调整
  WithdrawAdjustMoneyFee: number // 取款调整费用
  WithdrawMoney: number // 取款
  WithdrawMoneyFee: number // 取款费用
  WithdrawMoneyRate: number // 取款费率：10000分之一
}

// 下级佣金报表查询参数
export interface ReportCenterCommissionChildQuery {
  ReportMonth: string // 报表月份，格式：YYYY-MM
  Page?: number // 页码
  PageSize?: number // 每页数量
  AccountLevel?: number // 代理级别（0:全部, 1:一级, 2:二级, 3:三级）
  AgentAccount?: string // 代理账号
  IsSettlement?: number // 佣金发放状态（-1:未发放, 0:全部, 1:已发放, 2:已拒绝）
  Sort?: string // 排序参数（带负号表示降序，如：-CommissionTotal, CommissionTotal, -AccountLevel, AccountLevel, -CreateTime, CreateTime）
}

// 下级佣金报表数据项（包含本月和上月对比）
export interface ChildCommissionReportItem {
  CurrentMonth: MultiLayerCommissionData // 本月数据
  LastMonth: MultiLayerCommissionData // 上月数据
}

// 下级佣金报表汇总数据
export interface ChildCommissionReportTotal {
  SumActivityUserNum: number // 活跃用户总数
  SumActualCommissionTotal: number // 实际应发佣金总计
  SumAdminChargeMoney: number // 存款总额
  SumAdminChargeMoneyFee: number // 存款费用总额
  SumApiFeeTotal: number // API费用总额
  SumApiFeeTotalFee: number // API费用总计
  SumBackWaterGold: number // 返水总额
  SumBackWaterGoldFee: number // 返水费用总额
  SumBetGold: number // 投注总额
  SumCleanBetWinTotal: number // 净盈利总额
  SumCommissionChangeAfter: number // 佣金调整后总额
  SumCommissionChangeAmount: number // 佣金调整金额总额
  SumCommissionChildTotal: number // 下级贡献总额
  SumCommissionTotal: number // 佣金总额
  SumCreditDue: number // 信用额度总额
  SumDeputyCount: number // 副代理数量
  SumLastMonthCleanBetWinTotal: number // 上期结余总额
  SumMainCount: number // 主代理数量
  SumMoneyChange: number // 输赢调整总额
  SumMoneyChangeFee: number // 输赢调整费用总额
  SumPayMoneyFee: number // 存款手续费总额
  SumRealCleanBetWinTotal: number // 实际净盈利总额
  SumRedAdminChargeCommissionGold: number // 代存回馈总额
  SumRedAdminChargeGold: number // 代理代充红利总额
  SumRedGold: number // 红利总额
  SumRedGoldFee: number // 红利费用总额
  SumSendCommissionTotal: number // 已发佣金总计
  SumValidWater: number // 总流水
  SumWinGold: number // 返奖总额
  SumWithdrawMoneyFee: number // 提款费用总额
}

// 分页信息
export interface Pagination {
  CurrPage: number // 当前页码
  PageSize: number // 每页数量
  MaxPageCount: number // 最大页数
  MaxCount: number // 总记录数
}

// 下级佣金报表响应数据
export interface ReportCenterCommissionChildResponseData {
  Data: ChildCommissionReportItem[] // 下级代理列表（包含本月和上月对比）
  Total: ChildCommissionReportTotal // 汇总数据
  Pagination: Pagination // 分页信息
}

// 下级佣金报表响应
export interface ReportCenterCommissionChildResponse {
  Code: number
  Data: ReportCenterCommissionChildResponseData
  Msg: string
  Id: string
}

// 团队佣金报表查询参数
export interface ReportCenterCommissionTeamQuery {
  ReportMonth: string // 报表月份，格式：YYYY-MM
  Page?: number // 当前页数
  PageSize?: number // 分页笔数
  Username?: string // 代理名稱
}

// 团队佣金成员数据
export interface TeamCommissionData {
  ActivityUserNum: number // 活跃用户数
  AdminChargeMoney: number // 代存金额
  AdminChargeMoneyFee: number // 代存费用
  AdminChargeMoneyRate: number // 代存费率
  AdminId: number // 管理员ID
  AgentId: number // 代理ID
  AlgorithmTemplateId: number // 算法模板ID
  ApiFeeTemplateId: number // API费用模板ID
  ApiFeeTotal: number // API费用总计
  ApiFeeTotalFee: number // API费用
  BackWaterGold: number // 返水金额
  BackWaterGoldFee: number // 返水费用
  BetGold: number // 投注金额
  CleanBetWinTotal: number // 净盈利
  CommissionChangeAfter: number // 佣金调整后
  CommissionChangeAmount: number // 佣金调整金额
  CommissionLv: number // 佣金等级
  CommissionRate: number // 佣金比例
  CommissionTemplateId: number // 佣金模板ID
  CommissionTotal: number // 佣金总计
  CreateTime: number // 创建时间
  DataSearchType: number // 数据搜索类型
  Id: number // ID
  IsMain: number // 是否主代理
  IsNegativeWinAdd: number // 是否负盈利累加
  IsPositiveWinAdd: number // 是否正盈利累加
  IsSettlement: number // 是否已结算
  LastMonthAdminChargeMoneyFee: number // 上月代存费用
  LastMonthCleanBetWinTotal: number // 上期结余
  MoneyChange: number // 输赢调整
  MoneyChangeFee: number // 输赢调整费用
  PayMoney: number // 存款金额
  PayMoneyFee: number // 存款费用
  PayMoneyRate: number // 存款费率
  RealCleanBetWinTotal: number // 实际净盈利
  RedAdminChargeCommissionGold: number // 代存回馈
  RedAdminChargeGold: number // 代理充值红利
  RedAdminGold: number // 代理红利
  RedGold: number // 红利
  RedGoldFee: number // 红利费用
  RedRecommendGold: number // 推荐红利1
  RedRecommendGold2: number // 推荐红利2
  ReportDay: string // 报表日期
  ReportDayTime: number // 报表日期时间戳
  ReportMonth: string // 报表月份
  SettlementTime: number // 结算时间
  TeamLeaderId: number // 团队领导ID
  Username: string // 用户名
  WinGold: number // 返奖
  WithdrawAdjustMoney: number // 提款调整
  WithdrawAdjustMoneyFee: number // 提款调整费用
  WithdrawMoney: number // 提款金额
  WithdrawMoneyFee: number // 提款费用
  WithdrawMoneyRate: number // 提款费率
}

// 团队佣金报表汇总数据
export interface TeamCommissionReportTotal {
  ActivityUserNum: number // 活跃用户总数
  AdminChargeMoneyFee: number // 代存费用总额
  ApiFeeTotal: number // API费用总额
  ApiFeeTotalFee: number // API费用总计
  BackWaterGold: number // 返水总额
  BackWaterGoldFee: number // 返水费用总额
  BetGold: number // 投注总额
  CleanBetWinTotal: number // 净盈利总额
  CommissionChangeAfter: number // 佣金调整后总额
  CommissionTotal: number // 佣金总额
  LastMonthCleanBetWinTotal: number // 上期结余总额
  MoneyChange: number // 输赢调整总额
  MoneyChangeFee: number // 输赢调整费用总额
  PayMoneyFee: number // 存款费用总额
  RealCleanBetWinTotal: number // 实际净盈利总额
  RedGold: number // 红利总额
  RedGoldFee: number // 红利费用总额
  WinGold: number // 返奖总额
  WithdrawMoneyFee: number // 提款费用总额
}

// 团队佣金报表响应数据
export interface ReportCenterCommissionTeamResponseData {
  CurrentMonth: TeamCommissionData[] // 本月团队数据
  LastMonth: TeamCommissionData[] // 上月团队数据
  Total: TeamCommissionReportTotal // 汇总数据
}

// 团队佣金报表响应
export interface ReportCenterCommissionTeamResponse {
  Code: number
  Data: ReportCenterCommissionTeamResponseData
  Msg: string
  Id: string
}

// ==================== 报表 - 财务 API ====================

// 财务个人报表查询参数
export interface ReportCenterFinancePersonalQuery {
  BeginTime: number // 开始时间 Unix 时间戳
  EndTime: number // 结束时间 Unix 时间戳
}

// 财务个人报表数据
export interface ReportCenterFinancePersonalData {
  SumAgentCommissionPay: number // 佣金代存，单位:分
  SumAgentCommissionPayBonus: number // 佣金代存回馈，单位:分
  SumAgentCreditPay: number // 额度代存，单位:分
  SumAgentCreditPayBonus: number // 额度代存回馈，单位:分
  SumApiFeeTotal: number // 场馆费，单位:分
  SumBackWaterCount: number // 返水人数
  SumBackWaterGold: number // 返水金额，单位:分
  SumBetGold: number // 投注金额，单位:分
  SumMoneyChange: number // 输赢调整记录-总金额，单位:分
  SumMoneyChangeAddCount: number // 输赢调整记录-上分次数
  SumMoneyChangeReduceCount: number // 输赢调整记录-下分次数
  SumPayCount: number // 充值人数
  SumPayMoney: number // 充值金额，单位:分
  SumPayMoneyFee: number // 充值手续费，单位:分
  SumProfit: number // 总盈利，单位:分
  SumRedCount: number // 红利人数
  SumRedGold: number // 红利金额，单位:分
  SumValidBetGold: number // 有效投注，单位:分
  SumWithdrawCount: number // 提现人数
  SumWithdrawMoney: number // 提现金额，单位:分
  SumWithdrawMoneyFee: number // 提现手续费，单位:分
}

// 财务个人报表响应
export interface ReportCenterFinancePersonalResponse {
  Code: number
  Data: ReportCenterFinancePersonalData
  Msg: string
  Id: string
}

// ==================== 报表 - 财务详情（游戏记录）API ====================

// 财务详情查询参数
export interface ReportCenterFinanceDetailQuery {
  Page?: number // 分页页数
  PageSize?: number // 分页笔数
  BeginTime: number // 开始时间（Unix时间戳）
  EndTime: number // 结束时间（Unix时间戳）
  ChannelSearchType?: number // 渠道查询 0:模糊 1:精准
  ChannelSearch?: string // 渠道名称
  PlatformGameType?: string // 场馆代码
  PackageId?: number // 产品id
  Sort?: string // 排序条件(SumWinLoseGold:总盈利)开头负号代表降序，例如 -SumWinLoseGold(总盈利降序)
}

// 游戏资料by场馆
export interface PlayerGameDailyData {
  ApiFeeTotal: number // 场馆费，单位:分
  Fee: number // 场馆费率
  GameType: string // 平台
  ProfitRate: number // 盈余比例
  SumBetGold: number // 投注，单位:分
  SumBetTimes: number // 投注次数
  SumBetUsers: number // 投注人数
  SumValidWater: number // 有效投注，单位:分
  SumWinGold: number // 实际派发金额，单位:分
  SumWinLoseGold: number // 输赢，单位:分
}

// 游戏资料总计
export interface PlayerGameDailySummary {
  ApiFeeTotal: number // 场馆费，单位:分
  BetGoldTotal: number // 投注，单位:分
  BetTimesTotal: number // 投注次数
  BetUsersTotal: number // 投注人数
  ProfitRateTotal: number // 盈余比例
  ValidWaterTotal: number // 有效投注，单位:分
  WinGoldTotal: number // 实际派发金额，单位:分
  WinLoseGoldTotal: number // 输赢，单位:分
}

// 财务详情响应数据
export interface ReportCenterFinanceDetailData {
  Items: PlayerGameDailyData[] // 游戏资料by场馆
  Total: PlayerGameDailySummary // 游戏资料总计
}

// 财务详情响应
export interface ReportCenterFinanceDetailResponse {
  Code: number
  Data: ReportCenterFinanceDetailData
  Msg: string
  Id: string
}

// ==================== 游戏注单详情 API ====================

// 游戏注单详情查询参数
export interface GameDetailQuery {
  Page?: number // 分页页数
  PageSize?: number // 分页笔数
  BeginTime: number // 查询开始时间（Unix时间戳）
  EndTime: number // 查询结束时间（Unix时间戳）
  PlayerId?: number // 玩家ID
  LoginAccount?: string // 会员账号
  GameType?: string // 场馆代号，多个场馆用逗号分隔，例如 "OBTY,DBTY"
  PackageId?: number // 产品ID
  Sort?: string // 排序字段(TotalBetGold:总投注, ValidWater:有效投注, WinGold:派彩, CompanyWinLose:总盈利, SettlementTime:结算时间)，前面带正负号代表排序方式，例如 -TotalBetGold(总投注降序)
  SelectTimeType: number // 查询的时间类型(1=下注时间, 2=结算时间, 3=开赛时间)
  Status?: number // 注单状态(0:全部, 1:已结算, 2:已取消, -1:未结算)
}

// Funky火箭游戏详情
export interface FunkyDetail {
  GameName?: string // 游戏名称，例如 "Funky火箭"
  LiveId?: string // 直播间 ID，若不是从直播间投注，会是空值
  LiveStreamerName?: string // 主播名称，若不是从直播间投注，会是空值
  LiveStreamingTitle?: string // 直播间名称，若不是从直播间投注，会是空值
  PlayerAccount?: string // 玩家账号
  PlayerCashOutResult?: number // 玩家开伞倍率，玩家输时为 0
  PlayerId?: number // 玩家ID
  PlayerWin?: number // 玩家盈利，单位:分
  RoundId?: string // 游戏编号，若不是从直播间投注，会是空值
  SettleTime?: number // 账变时间 (Unix timestamp)
  TotalBet?: number // 总投注，单位:分
  TransactionId?: string // 注单ID，例如 "Funky_fkg_200006658808"
  ValidBet?: number // 有效投注，单位:分
}

// 真人注单详情
export interface GameLiveDetail {
  BetPointName?: string // 玩法
  BootNo?: string // 靴号
  CardResult?: string // 牌型
  GameId?: number // 游戏ID
  GameMode?: string // 游戏模式
  Odds?: string // 赔率
  PlatformName?: string // 厅名称
  Result?: string // 结果
  RoundCount?: string // 局数
  RoundNo?: string // 局号
  TransactionId?: string // 注单号
}

// 直播竞猜详情
export interface StreamDetail {
  Ante?: number // 底注，单位:分
  BetOnAlias?: string // 投注别名
  BetOnName?: string // 投注名称
  BetTime?: number // 投注时间 (Unix timestamp)
  CurrencyType?: string // 货币类型
  FirstOpenTime?: number // 首次开盘时间 (Unix timestamp)
  GameId?: number // 游戏ID
  Id?: number // ID
  LiveId?: string // 直播间ID
  LiveStreamingTitle?: string // 直播间标题
  MarketId?: string // 盘口ID
  MarketInfo?: string // 盘口信息
  MarketName?: string // 盘口名称
  MarketResult?: string // 盘口结果
  MarketType?: string // 盘口类型
  MarketWinner?: string // 盘口赢家
  Odds?: string // 赔率
  OrderStatus?: string // 订单状态
  Payout?: number // 派彩，单位:分
  Round?: string // 局号
  StreamerName?: string // 主播名称
  TransactionId?: string // 交易ID
}

// 体育注单详情
export interface SportDetail {
  AgentId?: number // 业主 id
  AwayTeam?: string // 客队名称
  BetNumber?: string // 牌局编号
  BetStake?: number // 下注金额(元)
  BetTime?: number // 下注时间 (Unix timestamp)
  BetTypeString?: string // 投注类型(ex.单场、串场2x1...)
  CashOutCount?: number // 提前结算次数
  CashOutPayoutStake?: number // 提前结算返还
  CashOutTotalStake?: number // 提前结算本金
  CreateTime?: number // 建立时间 (Unix timestamp)
  Env?: string // 环境(ex.PROD)
  GameId?: number // 游戏ID
  GameResult?: string // 赛果
  GameStartTime?: number // 开赛时间 (Unix timestamp)
  GameType?: string // 球种名称
  HomeTeam?: string // 主队名称
  Id?: number // ID
  InPlayScore?: string // 投注项 + 球头 or K 值
  Ip?: string // IP地址
  IsInPlay?: boolean // 是否为滚球
  LeagueName?: string // 联赛名称
  MarketName?: string // 投注情况 or 盘口
  MarketType?: string // 滚球时下注比分
  MatchId?: number // 赛事 id
  Odds?: number // 赔率
  OptionName?: string // 投注项 + 球头 or K 值
  PlayerId?: number // 玩家 id
  PlayerWinLoss?: number // 会员输赢(元)
  SettleStatus?: number // 结算状态
  SettlementTime?: number // 结算时间 (Unix timestamp)
  TransactionId?: string // 注单号
  UpdateTime?: number // 更新时间 (Unix timestamp)
  UserId?: string // 游戏账号
  ValidStake?: number // 有效投注(元)
  VenueName?: string // 场馆代号(ex.OBTY)
  Version?: number // 版号
}

// 注单资料
export interface GameDetailItem {
  AgentId: number // 代理ID
  BetGold: number // 投注金额，单位:分
  ChannelId: string // 渠道ID
  ChannelName: string // 渠道名称
  CompanyWinLose: number // 公司输赢，单位:分
  CreateTime: number // 创建时间（Unix时间戳）
  DataFlag: number // 数据标记
  DataType: number // 数据类型
  Detail: string // 详情
  FunkyDetails?: FunkyDetail[] // Funky火箭游戏详情
  GameId: number // 游戏ID
  GameLiveDetails?: GameLiveDetail[] // 真人注单详情
  GameType: string // 游戏类型
  Id: number // ID
  IsBetTrade: number // 是否投注交易
  LiveDetails?: StreamDetail[] // 直播竞猜详情
  LogId: string // 日志ID
  LoginAccount: string // 登录账号
  PackageConfigId: number // 产品配置ID
  PackageName: string // 产品名称
  PlayerId: number // 玩家ID
  PlayerWinLose: number // 会员输赢，单位:分
  RoundId: string // 局号
  SettleCount: number // 结算次数
  SettlementTime: number // 结算时间（Unix时间戳）
  SportDetails?: SportDetail[] // 体育注单详情
  Status: number // 状态
  SubGameId: number // 子游戏ID
  TotalBetGold: number // 总投注，单位:分
  TransactionId: string // 交易ID
  TransactionTime: number // 交易时间（Unix时间戳）
  ValidWater: number // 有效流水，单位:分
  Version: number // 版本
  VipLevel: string // VIP等级
  WinGold: number // 赢金额，单位:分
}

// 场馆总计
export interface SumItem {
  GameId: number // 游戏ID
  SumAddGold: number // 总增加金额，单位:分
  SumBetGold: number // 总投注，单位:分
  SumPlayerWinLose: number // 会员总输赢，单位:分
  SumProfitGold: number // 总盈利，单位:分
  SumTotalBetGold: number // 总投注金额，单位:分
  SumTotalBetNum: number // 总投注次数
  SumValidWater: number // 总有效流水，单位:分
  SumWinGold: number // 总赢金额，单位:分
}

// 游戏注单详情响应数据
export interface GameDetailData {
  Items: GameDetailItem[] // 注单资料
  MoreItems: SumItem // 场馆总计
  Pagination: Pagination // 分页信息
}

// 游戏注单详情响应
export interface GameDetailResponse {
  Code: number
  Data: GameDetailData
  Msg: string
  Id: string
}

// ==================== 充值类型配置 ====================

// 充值类型项
export interface RechargeType {
  Key: number // 充值类型ID
  Name: string // 充值类型名称
  I18nKey: string // 国际化键
  IsOpen: boolean // 是否开启
  CurrencyName: string // 货币名称
}

// 充值类型列表响应
export interface RechargeTypeListResponse {
  Code: number
  Data: RechargeType[]
  Msg: string
  id: string
}

// ==================== 充值/提现记录相关 ====================

// 充值/提现总计查询参数
export interface PaymentSummaryQuery {
  LoginAccount?: string // 会员账号
  BeginTime: number // 开始时间（Unix时间戳）
  EndTime: number // 结束时间（Unix时间戳）
}

// 充值/提现总计数据
export interface PaymentSummaryData {
  DepositAmount: number // 充值总金额（分）
  DepositCount: number // 充值总笔数
  WithdrawAmount: number // 提现总金额（分）
  WithdrawCount: number // 提现总笔数
}

// 充值/提现总计响应
export interface PaymentSummaryResponse {
  Code: number
  Data: PaymentSummaryData
  Msg: string
  Id: string
}

// 充值记录查询参数
export interface RechargeListQuery {
  Page?: number // 分页页数
  PageSize?: number // 分页笔数
  PlayerId?: number // 会员ID
  BeginTime: number // 开始时间（Unix时间戳）
  EndTime: number // 结束时间（Unix时间戳）
  Status?: number // 状态(0:全部 1:待处理 2:已出款 3:退款驳回 5:处理中)
  Sort?: string // 排序字段(账变时间:finish_time 充值金额:amount)，前面带正负号代表排序方式
  LoginAccount?: string // 会员账号
}

// 充值记录明细
export interface PlayerRechargeList {
  AgentId?: number // 大代理id
  Amount?: number // 充值金额（分）
  ChannelId?: string // 渠道号
  ChannelName?: string // 渠道名称
  CreateTime?: number // 创建时间（Unix时间戳）
  DataFlag?: number // 资料标记 0:正式 1:测试
  DataType?: number // 资料类型 0:真实 1:虚拟
  Fee?: number // 充值手续费（分）
  FeeRate?: number // 充值费率（千分比，例如 10 表示 1%）
  FinishTime?: number // 账变时间（Unix时间戳）
  LoginAccount?: string // 会员账号
  OrderId?: string // 订单号
  PackageName?: string // 产品名称
  PayType?: number // 支付方式
  PlayerId?: number // 会员id
  PlayerName?: string // 真实姓名
  Process?: string // 到账进度 f默认 t已到账
  RealAmount?: number // 实际金额（分）
  Status?: number // 状态
}

// 充值记录数据
export interface RechargeListData {
  Items: PlayerRechargeList[]
  Pagination: Pagination
}

// 充值记录响应
export interface RechargeListResponse {
  Code: number
  Data: RechargeListData
  Msg: string
  Id: string
}

// 提现记录查询参数
export interface WithdrawListQuery {
  Page?: number // 分页页数
  PageSize?: number // 分页笔数
  PlayerId?: number // 会员ID
  BeginTime: number // 开始时间（Unix时间戳）
  EndTime: number // 结束时间（Unix时间戳）
  Status?: number // 状态(0:全部 1:待处理 2:已出款 3:退款驳回 5:处理中)
  Sort?: string // 排序字段(账变时间:finish_time 提现金额:amount)，前面带正负号代表排序方式
  LoginAccount?: string // 会员账号
}

// 提现记录明细
export interface PlayerWithdrawList {
  AccountType?: string // 提现类型，例如 "142(提现调整)"
  Amount?: number // 申请提现（分）
  Fee?: number // 提现手续费（分）
  FeeRate?: number // 提现费率（千分比，例如 10 表示 1%）
  FinishTime?: number // 账变时间（Unix时间戳）
  OrderId?: string // 订单号
  PlayerId?: number // 会员id
  Process?: number // 处理状态
  RealAmount?: number // 实际提现（分）
  RefundScore?: number // 退款状态(0:待定 1:退币 2:不退)
  Status?: number // 订单状态
}

// 提现记录数据
export interface WithdrawListData {
  Items: PlayerWithdrawList[]
  Pagination: Pagination
}

// 提现记录响应
export interface WithdrawListResponse {
  Code: number
  Data: WithdrawListData
  Msg: string
  Id: string
}

// ==================== 充值/提现手续费记录相关 ====================

// 充值手续费记录查询参数
export interface PayRecordsQuery {
  Page?: number // 分页页数
  PageSize?: number // 分页笔数
  BeginTime: number // 开始时间（Unix时间戳）
  EndTime: number // 结束时间（Unix时间戳）
  LoginAccount?: string // 会员账号
  Sort?: string // 排序字段(transaction_time:交易时间, amount:金额)，前面带正负号代表排序方式
}

// 充值手续费记录明细
export interface PayRecordItem {
  Amount: number // 充值金额（分）
  Fee: number // 手续费（分）
  FeeRate: number // 费率
  LoginAccount: string // 会员账号
  OrderId: string // 订单号
  PayType: number // 支付方式
  PlayerId: number // 玩家ID
  TransactionTime: number // 交易时间（Unix时间戳）
}

// 充值手续费总计
export interface PayRecordsTotal {
  TotalAmount: number // 总充值金额（分）
  TotalFee: number // 总手续费（分）
}

// 充值手续费记录数据
export interface PayRecordsData {
  Items: PayRecordItem[]
  Pagination: Pagination
  Total: PayRecordsTotal
}

// 充值手续费记录响应
export interface PayRecordsResponse {
  Code: number
  Data: PayRecordsData
  Msg: string
  Id: string
}

// 提现手续费记录查询参数
export interface WithdrawRecordsQuery {
  Page?: number // 分页页数
  PageSize?: number // 分页笔数
  BeginTime: number // 开始时间（Unix时间戳）
  EndTime: number // 结束时间（Unix时间戳）
  LoginAccount?: string // 会员账号
  Sort?: string // 排序字段(transaction_time:交易时间, amount:金额)，前面带正负号代表排序方式
}

// 提现手续费记录明细
export interface WithdrawRecordItem {
  Amount: number // 提现金额（分）
  Fee: number // 手续费（分）
  FeeRate: number // 费率
  LoginAccount: string // 会员账号
  OrderId: string // 订单号
  PayType: number // 支付方式
  PlayerId: number // 玩家ID
  TransactionTime: number // 交易时间（Unix时间戳）
  WithdrawType: number // 提现类型
}

// 提现手续费总计
export interface WithdrawRecordsTotal {
  TotalAmount: number // 总提现金额（分）
  TotalFee: number // 总手续费（分）
}

// 提现手续费记录数据
export interface WithdrawRecordsData {
  Items: WithdrawRecordItem[]
  Pagination: Pagination
  Total: WithdrawRecordsTotal
}

// 提现手续费记录响应
export interface WithdrawRecordsResponse {
  Code: number
  Data: WithdrawRecordsData
  Msg: string
  Id: string
}

// ==================== 充提手续费总计相关 ====================

// 充提手续费总计查询参数
export interface PayMoneyWithdrawFeeDetailsQuery {
  Page?: number // 分页页数
  PageSize?: number // 分页笔数
  BeginTime: number // 开始时间（Unix时间戳）
  EndTime: number // 结束时间（Unix时间戳）
}

// 充提手续费日报明细
export interface PayMoneyWithdrawFeeItem {
  PayMoney: number // 充值金额（分）
  PayMoneyFee: number // 充值手续费（分）
  ReportDay: string // 日报
  ReportDayTime: number // 日报时间（Unix时间戳）
  WithdrawMoney: number // 提现金额（分）
  WithdrawMoneyFee: number // 提现手续费（分）
}

// 充提手续费总计
export interface PayMoneyWithdrawFeeTotal {
  TotalPayFee: number // 充值手续费总计（分）
  TotalWithdrawFee: number // 提现手续费总计（分）
}

// 充提手续费详情数据
export interface PayMoneyWithdrawFeeDetailsData {
  Items: PayMoneyWithdrawFeeItem[]
  Total: PayMoneyWithdrawFeeTotal
}

// 充提手续费详情响应
export interface PayMoneyWithdrawFeeDetailsResponse {
  Code: number
  Data: PayMoneyWithdrawFeeDetailsData
  Msg: string
  Id: string
}
export interface HelpCenterListData {
  AdminId: number
  Content: string
  CreateAdminId: number
  CreateTime: number
  Deleted: number
  Id: number
  Sort: number
  Tag: string
  UpdateTime: number
}

export interface PutNetcashmultiResponse {
  Code: number
  Data: Record<string, any>
  Msg: string
  Id: string
}

export interface PostNetcashmultiRequest {
  Username: string // 代理帳號
  Password: string // 密碼
  ConfirmPassword: string // 確認密碼
  Name: string // 名稱
  CommissionRate: string // 佣金比例（單費率為數值，多費率為JSON格式保存不同的場館類型分成）
  Remark: string // 備註
}

export interface PostNetcashmultiResponse {
  Code: number
  Data: Record<string, any>
  Msg: string
  Id: string
}

export interface GetNetcashmultiInfoV2Response {
  Code: number
  Data: GetNetcashmultiInfoV2Data
  Msg: string
  Id: string
}

export interface GetNetcashmultiInfoV2Data {
  AccountLevel: number // 代理層級
  CommissionRate: string // 佣金比例
  DownLineAgents: number // 下級代理數
  DownLineMembers: number // 會員數
  Username: string // 代理账号
}

export interface NetcashmultiListQuery {
  Page: number // 页码
  PageSize: number // 每页条数
  Sort: string // 排序 前面帶正負號代表排序方式。ex: -CreateTime, +Members,支援參數: AccountLevel, CreateTime, Members
  Username: string // 代理账号
  AccountLevel: number // 代理層級
  AdminId: number // 代理ID
  CreateTimeBegin: number // 创建时间开始
  CreateTimeEnd: number // 创建时间结束
}

export interface GetNetcashmultiListResponse {
  Code: number
  Data: NetcashmultiListData
  Msg: string
  Id: string
}

export interface Pagination {
  CurrPage: number // 当前页码
  MaxCount: number // 总数
  MaxPageCount: number // 总页数
  PageSize: number // 每页条数
}

export interface NetcashmultiListData {
  Items: NetcashmultiListItem[]
  Pagination: Pagination
}

export interface NetcashmultiListItem {
  AccountLevel: number,
  AdminId: number,
  CommissionRate: string,
  CreateTime: number,
  Members: number,
  Name: string,
  ParentTree: string,
  Remark: string,
  Username: string
}

export interface NetcashmultiSearchAdminQuery {
  Username: string // 代理账号
  AccountLevel: number // 代理層級
}

export interface GetNetcashmultiSearchAdminResponse {
  Code: number
  Data: NetcashmultiSearchAdminData
  Msg: string
  Id: string
}

export interface NetcashmultiSearchAdminData {
  Items: NetcashmultiSearchAdminItem[]
}

export interface NetcashmultiSearchAdminItem {
  AdminId: number,
  Username: string
}

export interface GetNetcashmultiTreeResponse {
  Code: number
  Data: NetcashmultiTreeData
  Msg: string
  Id: string
}

export interface NetcashmultiTreeData {
  MultiAgentTree: NetcashmultiTreeItem
}

export interface NetcashmultiTreeItem {
  AccountLevel: number,
  AdminId: number,
  Children: NetcashmultiTreeItem[],
  CommissionRate: string,
  SumWinLose: number,
  Username: string
}

export interface GetNetcashteamInfoResponse {
  Code: number
  Data: GetNetcashteamInfoData
  Msg: string
  Id: string
}


export interface GetNetcashteamInfoData {
  ActiveMembers: number,
  CreateTime: number,
  Deleted: number,
  Deputys: number,
  Id: number,
  Members: number,
  Remark: string,
  TeamName: string,
  Type: number,
  Username: string
}

export interface NetcashteamListV2Query {
  Page: number // 页码
  PageSize: number // 每页条数
  Sort: string // 排序(示例: 按照渠道正向排序 'ChannelId'，按照渠道反向排序 '-ChannelId')。如果為空，默認按照Id反向排序
  JoinTeamTimeBegin: number // 开始时间
  JoinTeamTimeEnd: number // 结束时间
  AdminId: number // 代理ID
}

export interface NetcashteamListV2Data {
  Items: NetcashteamListV2Item[]
  Pagination: Pagination
}

export interface NetcashteamListV2Item {
  ActiveMembers: number,
  AdminId: number,
  JoinTeamTime: number,
  Members: number,
  Username: string
}

export interface GetNetcashteamListV2Response {
  Code: number
  Data: NetcashteamListV2Data
  Msg: string
  Id: string
}

export interface NetcashteamSearchQuery {
  Username: string // 代理账号
}

export interface NetcashteamSearchData {
  Items: NetcashteamSearchItem[]
}

export interface NetcashteamSearchItem {
  AdminId: number,
  Username: string
}

export interface GetNetcashteamSearchResponse {
  Code: number
  Data: NetcashteamSearchData
  Msg: string
  Id: string
}

export interface HelpCenterListResponse {
  Code: number
  Data: { Items: Array<HelpCenterListData> }
  Msg: string
  Id: string
}

export interface LoginSettingRequest {
  LoginType: number // 登录类型，1:允许，0:禁止
  IsAllowOtherDeviceLogin: number // 是否允许其他设备登录，1:允许，0:不允许
  PrivatePassword: string // 私人密码
  TimeFreeVerification: number // 免验证时间，单位:分钟
}

export type * from './Playermanage/types'
export type * from './NetCashPlayerGame/types'
export type * from './ApiConfig/types'
