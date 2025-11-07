import type {
  SolidConfigResponse
} from './data-contracts'
import type { HttpClient, RequestParams } from './http-client'
// import { ContentType } from './http-client'

export class Game<SecurityDataType = unknown> {
  http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  /**
   * 項目基礎配置
   *
   * @tags Game
   * @name GetSolidConfig
   * @request GET:/api/game/solidconfig
   * @secure
   */
  getSolidConfig = (
    params: RequestParams = {},
  ) =>
    this.http.request<SolidConfigResponse, any>({
      path: '/api/game/solidconfig',
      method: "GET",
      secure: true,
      format: "json",
      ...params,
    });

}
