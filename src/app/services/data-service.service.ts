import { Injectable } from '@angular/core';
import { Http, Headers, ResponseContentType } from '@angular/http';
import 'rxjs/add/operator/map';

import { environment } from '../../environments/environment';

@Injectable()
export class DataServiceService {

  constructor(private http: Http) { }

  getFiscalDates() {
    return this.http.get(environment.endpoint.server + 'GetFiscalDates').map(res => res.json());
  }

  getRecords(start: any, end: any) {
    return this.http.get(environment.endpoint.server + 'GetAdjustmentsByDates/' + start + '/' + end).toPromise().then(res => res.json());
  }

  getAdjustments(sort: string, order: string, page: number) {
    return this.http.get(environment.endpoint.server + 'GetAdjustments?sort=' + sort + '&order=' + order + '&page=' + page).map(res => res);
  }

  getAdjustmentsBySkid(skid: any) {
    return this.http.get(environment.endpoint.server + 'GetAdjustmentsBySkid/' + skid).map(res => res.json());
  }

  downloadAll() {
    return this.http.get(environment.endpoint.server + 'DownloadAll', { responseType: ResponseContentType.Blob }).map(res => res.blob());
  }

  downloadCurrent(records: any) {
    return this.http.post(environment.endpoint.server + 'DownloadCurrent', records, { responseType: ResponseContentType.Blob }).map(res => res.blob());
  }
}
