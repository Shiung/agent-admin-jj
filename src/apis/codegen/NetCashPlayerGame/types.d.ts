import type { Pagination, BaseResponse, RequestPage } from '../common'

type FunckyDetail = {
  /** 游戏名称 */
  GameName: string
  /** 直播间 ID，#若不是從直播間投注，會是空值 */
  LiveId: string
  /** 主播名称，#若不是從直播間投注，會是空值 */
  LiveStreamerName: string
  /** 直播间名称，#若不是從直播間投注，會是空值 */
  LiveStreamingTitle: string
  /** 玩家账号 */
  PlayerAccount: string
  /** 玩家开伞倍率, 玩家輸時為 0 */
  PlayerCashOutResult: number
  PlayerId: number
  /** 玩家盈利 */
  PlayerWin: number
  /** 游戏编号，#若不是從直播間投注，會是空值 */
  RoundId: string
  /** 账变时间 (Unix timestamp) */
  SettleTime: number
  /** 总投注 */
  TotalBet: number
  /**
   * 注单ID
   * @example "Funky_fkg_200006658808"
   **/
  TransactionId: string
  /** 有效投注 */
  ValidBet: number
}

type GameLiveDetail = {
  /** 玩法 */
  BetPointName: string
  /** 靴號 */
  BootNo: string
  /** 牌型 */
  CardResult: string
  GameId: number
  /** 游戏模式 */
  GameMode: string
  /** 賠率 */
  Odds: string
  /** 厅名称 */
  PlatformName: string
  /** 结果 */
  Result: string
  /** 局數 */
  RoundCount: string
  /** 局號 */
  RoundNo: string
  /** 注單號 */
  TransactionId: string
}

type LiveDetail = {
  Ante: number
  BetOnAlias: string
  BetOnName: string
  BetTime: number
  CurrencyType: string
  FirstOpenTime: number
  GameId: number
  Id: number
  LiveId: string
  LiveStreamingTitle: string
  MarketId: string
  MarketInfo: string
  MarketName: string
  MarketResult: string
  MarketType: string
  MarketWinner: string
  Odds: string
  OrderStatus: string
  Payout: number
  Round: string
  StreamerName: string
  TransactionId: string
}


type SportDetail = {
  /** 業主 id */
  AgentId: number
  /** 客隊名稱 */
  AwayTeam: string
  /** 牌局編號 */
  BetNumber: string
  /** 下注金額(元) */
  BetStake: number
  /** 下注時間 Seconds */
  BetTime: number
  /** 投注类型(ex.单场、串场2x1...) */
  BetTypeString: string
  /** 提前結算次數 */
  CashOutCount: number
  /** 提前結算返還 */
  CashOutPayoutStake: number
  /** 提前結算本金 */
  CashOutTotalStake: number
  /** 建立時間 Seconds */
  CreateTime: number
  /** 環境(ex.PROD) */
  Env: string
  GameId: number
  /** 賽果 */
  GameResult: string
  /** 開賽時間 Seconds */
  GameStartTime: number
  /** 球種名稱 */
  GameType: string
  /** 主隊名稱 */
  HomeTeam: string
  Id: number
  /** 投注項 + 球頭 or K 值 */
  InPlayScore: string
  Ip: string
  /** 是否為滾球 */
  IsInPlay: boolean
  /** 聯賽名稱 */
  LeagueName: string
  /** 投注情况 or 盤口 */
  MarketName: string
  /** 滾球時下注比分 */
  MarketType: string
  /** 賽事 id */
  MatchId: number
  /** 賠率 */
  Odds: number
  /** 投注項 + 球頭 or K 值 */
  OptionName: string
  /** 玩家 id */
  PlayerId: number
  /** 會員輸贏(元) */
  PlayerWinLoss: number
  /** 結算狀態 */
  SettleStatus: number
  /** 結算時間 Seconds */
  SettlementTime: number
  /** 注單號 */
  TransactionId: string
  /** 更新時間 Seconds */
  UpdateTime: number
  /** 遊戲帳號 */
  UserId: string
  /** 有效投注(元) */
  ValidStake: number
  /** 場館代號(ex.OBTY) */
  VenueName: string
  /** 版號 */
  Version: number
}

type GameDetail = {
  AgentId: number
  BetGold: number
  ChannelId: string
  ChannelName: string
  /** 公司輸贏 */
  CompanyWinLose: number
  CreateTime: number
  DataFlag: number
  DataType: number
  Detail: string
  /** Funky火箭遊戲詳情 */
  FunkyDetails: Array<FunckyDetail>
  GameId: number
  /** 真人注單詳情 */
  GameLiveDetails: Array<GameLiveDetail>
  GameType: string
  Id: number
  IsBetTrade: number
  /** 直播競猜詳情 */
  LiveDetails: Array<LiveDetail>
  LogId: string
  LoginAccount: string
  PackageConfigId: number
  PackageName: string
  PlayerId: number
  /** 會員輸贏 */
  PlayerWinLose: number
  RoundId: string
  SettleCount: number
  SettlementTime: number
  /** 體育注單詳情 */
  SportDetails: Array<SportDetail>
  Status: number
  SubGameId: number
  TotalBetGold: number
  TransactionId: string
  TransactionTime: number
  ValidWater: number
  Version: number
  VipLevel: string
  WinGold: number
}

type PlayerRechargeList = {
  /** 大代理id */
  AgentId: number
  /** 充值金額 */
  Amount: number
  /** 渠道號 */
  ChannelId: string
  /** 渠道名稱 */
  ChannelName: string
  /** 創建時間 */
  CreateTime: number
  /** 資料標記 0:正式 1:測試 */
  DataFlag: number
  /** 資料類型 0:真實 1:虛擬 */
  DataType: number
  /** 充值手續費 */
  Fee: number
  /** 充值費率 */
  FeeRate: number
  /** 帳變時間 */
  FinishTime: number
  /** 會員帳號 */
  LoginAccount: string
  /** 訂單號 */
  OrderId: string
  /** 產品名稱 */
  PackageName: string
  /** 支付方式 */
  PayType: number
  /** 會員id */
  PlayerId: number
  /** 真實姓名 */
  PlayerName: string
  /** 到帳進度 f默认 t已到账 */
  Process: string
  /** 實際金額 */
  RealAmount: number
  /** 狀態((1 || 2) && process == 'f':处理中 2 && process == 't':充值完成 3:充值失败 4:已审核 12:充值取消 13:用戶取消) */
  Status: number
  /** vip等級 */
  VipLevel: string
}

type PlayerWithdrawList = {
  /** 提現類型 */
  AccountType: number
  /** 申請提現 */
  Amount: number
  /** 提現手續費 */
  Fee: number
  /** 提現費率 */
  FeeRate: number
  /** 帳變時間 */
  FinishTime: number
  /** 訂單號 */
  OrderId: string
  /** 會員id */
  PlayerId: number
  /** 處理狀態 */
  Process: number
  /** 實際提現 */
  RealAmount: number
  /** 退款狀態(0:待定 1:退币 2:不退) */
  RefundScore: number
  /** 訂單狀態 */
  Status: number
}

type PlayerRedList = {
  /** 會員帳號 */
  Account: string
  /** 代理id */
  AdminId: number
  /** 總代id */
  AgentId: number
  /** 紅利金額 */
  Bonus: number
  /** 紅利標題 */
  BonusTitle: string
  /** 红利类型(4:升级礼金 5:每月红包 6:生日礼金 9:活动红利 12:推荐红利) */
  BonusType: number
  /** 渠道號 */
  ChannelId: string
  CreateTime: number
  /** 流水倍數 */
  Draw: number
  /** 流水 */
  DrawAmount: number
  FinishTime: number
  /** 訂單號 */
  OrderId: string
  /** 會員id */
  PlayerId: number
  SendTime: number
  /** 狀態(2:申請成功 5:待領取) */
  Status: number
  UpdateTime: number
  /** vip等級 */
  VipLevel: string
}

type PlayerAgentApplyGoldList = {
  /** 代存金額 */
  Amount: number
  /** 代存回饋 */
  CreditBonus: number
  /** 代存手續費 */
  CreditFee: number
  /** 會員帳號 */
  LoginAccount: string
  /** 訂單號 */
  OrderId: string
  /** 帳變時間 */
  ProcessingTime: number
  /** 備註 */
  Remarks: string
  /** 狀態(2:完成) */
  Status: number
  /** 充值類型(2:代理代存 10:代理代存-紅利) */
  TransferType: number
  /** vip等級 */
  VipLevel: string
  /** 錢包類型(钱包类型 1：佣金钱包 2：代存钱包) */
  WalletType: number
  /** 流水倍數 */
  WithdrawWaterMultiply: number
}
export interface GamedetailRequest extends RequestPage {
  /** 查詢開始時間，timestamp */
  BeginTime: number
  /** 查詢結束時間，timestamp */
  EndTime: number
  PlayerId?: number
  /** 會員帳號 */
  LoginAccount?: string
  /**
   * 場館代號，多個場館用逗號分隔
   * @example "OBTY,DBTY"
   **/
  GameType?: string
  PackageId?: number
  /** 排序欄位(TotalBetGold, ValidWater, WinGold)，前面帶正負號代表排序方式
   * @example "-TotalBetGold(總投注降冪)"
   */
  Sort?: string
  /** 查詢的時間類型(1=下注时间, 2=结算时间, 3=开赛时间) */
  SelectTimeType: 1 | 2 | 3
  /** 注单状态(0:全部, 1:已结算, 2:已取消, -1:未结算) */
  Status?: 0 | 1 | 2 | -1
}

export interface GamedetailResponseData {
  /** 注單資料 */
  Items: Array<GameDetail>
  /** 場館總計 */
  MoreItems: {
    GameId: number
    SumAddGold: number
    SumBetGold: number
    SumPlayerWinLose: number
    SumProfitGold: number
    SumTotalBetGold: number
    SumTotalBetNum: number
    SumValidWater: number
    SumWinGold: number
  }
  Pagination: Pagination
}

export type GamedetailResponse = BaseResponse<GamedetailResponseData>

export interface CommonRechargelistRequest extends RequestPage {
  /** 會員id */
  PlayerId?: number
  /** 開始時間 */
  BeginTime: number
  /** 結束時間 */
  EndTime: number
  /** 狀態(0:全部 1:处理中 2:充值完成 3:充值失败 4:已审核 12:充值取消 13:用戶取消) */
  Status?: string
  /** 排序欄位(帳變時間:finish_time 充值金額:amount)，正負號為升降冪 */
  Sort?: string
  /** 會員帳號 */
  LoginAccount?: string
}

export interface CommonRechargelistResponseData {
  Items: Array<PlayerRechargeList>
  Pagination: Pagination
}

export type CommonRechargelistResponse = BaseResponse<CommonRechargelistResponseData>

export interface CommonWithdrawlistRequest extends RequestPage {
  /** 會員id */
  PlayerId?: number
  /** 開始時間 */
  BeginTime?: number
  /** 結束時間 */
  EndTime?: number
  /** 狀態(0:全部 1:待处理 2:已出款 3:退款驳回 5:处理中) */
  Status?: number
  /** 排序欄位(帳變時間:finish_time 提現金額:amount) */
  Sort?: string
  /** 會員帳號 */
  LoginAccount?: string
}

export interface CommonWithdrawlistResponseData {
  Items: Array<PlayerWithdrawList>
  Pagination: Pagination
}

export type CommonWithdrawlistResponse = BaseResponse<CommonWithdrawlistResponseData>

export interface RedListRequest extends RequestPage {
  /** 會員id */
  PlayerId?: number
  /** 開始時間 */
  BeginTime: number
  /** 結束時間 */
  EndTime: number
  /** 排序欄位(领奖时间:send_time 紅利金額:bonus) */
  Sort?: string
  /** 會員帳號 */
  LoginAccount?: string
  /** 狀態(2:已領取) (Required, Allowed values: 2) */
  Status: number
}

export interface RedListResponseData {
  Items: Array<PlayerRedList>
  Pagination: Pagination
  Total: {
    /** 紅利人數 */
    Count: number
    /** 紅利總金額 */
    SumAmount: number
  }
}

export type RedListResponse = BaseResponse<RedListResponseData>

export interface AgentapplygoldlistRequest extends RequestPage {
  /** 會員id */
  PlayerId?: number
  /** 開始時間 */
  BeginTime: number
  /** 結束時間 */
  EndTime: number
  /** 錢包類型(钱包类型 1：佣金钱包 2：代存钱包) */
  WalletType?: number
  /** 排序欄位(帳變時間:update_time 代存金額:amount) */
  Sort?: string
  /** 會員帳號 */
  LoginAccount?: string
}

export interface AgentapplygoldlistResponseData {
  Items: Array<PlayerAgentApplyGoldList>
  Pagination: Pagination
}

export type AgentapplygoldlistResponse = BaseResponse<AgentapplygoldlistResponseData>
