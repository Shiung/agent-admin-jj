import type {
  PutNetcashmultiRequest,
  PutNetcashmultiResponse,
  PostNetcashmultiRequest,
  PostNetcashmultiResponse,
  GetNetcashmultiInfoV2Response,
  NetcashmultiListQuery,
  GetNetcashmultiListResponse,
  NetcashmultiSearchAdminQuery,
  GetNetcashmultiSearchAdminResponse,
  GetNetcashmultiTreeResponse,
} from './data-contracts'
import type { HttpClient, RequestParams } from './http-client'
import { ContentType } from './http-client'

export class Netcashmulti<SecurityDataType = unknown> {
  http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  /**
   * 管理>代理管理>編輯下級代理
   *
   * @tags Netcashmulti
   * @name PutNetcashmulti
   * @request PUT:/admin/agentnetcashmulti
   * @secure
   */
  putNetcashmulti = (
    data: PutNetcashmultiRequest,
    params: RequestParams = {},
  ) =>
    this.http.request<PutNetcashmultiResponse, any>({
      path: '/admin/agentnetcashmulti',
      method: "PUT",
      body: data,
      secure: true,
      type: ContentType.FormData,
      format: "json",
      ...params,
    });

  /**
   * 管理>代理管理>創建下級代理
   *
   * @tags Netcashmulti
   * @name PostNetcashmulti
   * @request POST:/admin/agentnetcashmulti
   * @secure
   */
  postNetcashmulti = (
    data: PostNetcashmultiRequest,
    params: RequestParams = {},
  ) =>
    this.http.request<PostNetcashmultiResponse, any>({
      path: '/admin/agentnetcashmulti',
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.FormData,
      format: "json",
      ...params,
    });

  /**
   * 管理>代理管理>當期代理資訊V2
   *
   * @tags Netcashmulti
   * @name GetNetcashmultiInfoV2
   * @request GET:/admin/agentnetcashmulti/infov2
   * @secure
   */
  getNetcashmultiInfoV2 = (
    params: RequestParams = {},
  ) =>
    this.http.request<GetNetcashmultiInfoV2Response, any>({
      path: '/admin/agentnetcashmulti/infov2',
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });

  /**
   * 管理>代理管理>下級代理列表
   *
   * @tags Netcashmulti
   * @name GetNetcashmultiList
   * @request GET:/admin/agentnetcashmulti/list
   * @secure
   */
  getNetcashmultiList = (
    query: NetcashmultiListQuery,
    params: RequestParams = {},
  ) =>
    this.http.request<GetNetcashmultiListResponse, any>({
      path: '/admin/agentnetcashmulti/list',
      method: "GET",
      secure: true,
      format: "json",
      query,
      ...params,
    });

  /**
   * 管理>代理管理>代理搜尋
   *
   * @tags Netcashmulti
   * @name GetNetcashmultiSearch
   * @request GET:/admin/agentnetcashmulti/searchadmin
   * @secure
   */
  getNetcashmultiSearchAdmin = (
    query: NetcashmultiSearchAdminQuery,
    params: RequestParams = {},
  ) =>
    this.http.request<GetNetcashmultiSearchAdminResponse, any>({
      path: '/admin/agentnetcashmulti/searchadmin',
      method: "GET",
      secure: true,
      format: "json",
      query,
      ...params,
    });

  /**
   * 管理>代理管理>代理組織圖
   *
   * @tags Netcashmulti
   * @name GetNetcashmultiTree
   * @request GET:/admin/agentnetcashmulti/tree
   * @secure
   */
  getNetcashmultiTree = (
    params: RequestParams = {},
  ) =>
    this.http.request<GetNetcashmultiTreeResponse, any>({
      path: '/admin/agentnetcashmulti/tree',
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });

}
