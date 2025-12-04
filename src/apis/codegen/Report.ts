import type {
  ReportCenterCommissionQuery,
  ReportCenterCommissionResponse,
  ReportCenterCommissionChildQuery,
  ReportCenterCommissionChildResponse,
  ReportCenterCommissionTeamQuery,
  ReportCenterCommissionTeamResponse,
  ReportCenterFinancePersonalQuery,
  ReportCenterFinancePersonalResponse,
  ReportCenterFinanceDetailQuery,
  ReportCenterFinanceDetailResponse,
} from './data-contracts'
import type { HttpClient, RequestParams } from './http-client'

export class Report<SecurityDataType = unknown> {
  http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  /**
   * 报表中心-佣金-个人佣金数据（包含本月和上月）
   *
   * @tags Report
   * @name ReportCenterCommission
   * @request GET:/admin/netcashreportcenter/compare/commission
   * @secure
   */
  getReportCenterCommission = (
    query: ReportCenterCommissionQuery,
    params: RequestParams = {},
  ) =>
    this.http.request<ReportCenterCommissionResponse, any>({
      path: '/admin/netcashreportcenter/compare/commission',
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });

  /**
   * 报表中心-佣金-下级佣金报表
   *
   * @tags Report
   * @name ReportCenterCommissionChild
   * @request GET:/admin/netcashreportcenter/compare/commission/child
   * @secure
   */
  getReportCenterCommissionChild = (
    query: ReportCenterCommissionChildQuery,
    params: RequestParams = {},
  ) =>
    this.http.request<ReportCenterCommissionChildResponse, any>({
      path: '/admin/netcashreportcenter/compare/commission/child',
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });

  /**
   * 报表中心-佣金-团队佣金报表
   *
   * @tags Report
   * @name ReportCenterCommissionTeam
   * @request GET:/admin/netcashreportcenter/compare/commission/team
   * @secure
   */
  getReportCenterCommissionTeam = (
    query: ReportCenterCommissionTeamQuery,
    params: RequestParams = {},
  ) =>
    this.http.request<ReportCenterCommissionTeamResponse, any>({
      path: '/admin/netcashreportcenter/compare/commission/team',
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });

  /**
   * 报表中心-财务-个人财务数据
   *
   * @tags Report
   * @name ReportCenterFinancePersonal
   * @request GET:/admin/netcashreportcenter/finance/personal
   * @secure
   */
  getReportCenterFinancePersonal = (
    query: ReportCenterFinancePersonalQuery,
    params: RequestParams = {},
  ) =>
    this.http.request<ReportCenterFinancePersonalResponse, any>({
      path: '/admin/netcashreportcenter/finance/personal',
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });

  /**
   * 报表中心-财务详情（游戏记录）
   *
   * @tags Report
   * @name ReportCenterFinanceDetail
   * @request GET:/admin/netcashreportcenter/financedetail
   * @secure
   */
  getReportCenterFinanceDetail = (
    query: ReportCenterFinanceDetailQuery,
    params: RequestParams = {},
  ) =>
    this.http.request<ReportCenterFinanceDetailResponse, any>({
      path: '/admin/netcashreportcenter/financedetail',
      method: "GET",
      query: query,
      secure: true,
      format: "json",
      ...params,
    });
}
