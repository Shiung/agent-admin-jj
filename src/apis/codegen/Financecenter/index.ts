import type {
  FinancecenterDetaillistRequest,
  FinancecenterDetaillistResponse
} from '../data-contracts'

import type { HttpClient, RequestParams } from '../http-client'

export class Financecenter<SecurityDataType = unknown> {
  http: HttpClient<SecurityDataType>;
    
  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  /** "個人>資金明細" */
  getDetaillist = (
    query: FinancecenterDetaillistRequest,
    params: RequestParams = {},
  ) =>
    this.http.request<FinancecenterDetaillistResponse, any>({
      path: '/admin/financecenter/detaillist',
      method: 'GET',
      query: query,
      secure: true,
      format: "json",
      ...params
    })
}