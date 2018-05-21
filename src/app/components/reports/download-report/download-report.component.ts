import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource, MatSnackBar } from '@angular/material';
import { MatFormFieldModule } from '@angular/material/form-field';
import { DataServiceService } from '../../../services/data-service.service';
import { FormControl, FormGroup, Validator, Validators } from '@angular/forms';
import { merge } from 'rxjs/observable/merge';
import { of as observableOf } from 'rxjs/observable/of';
import { Observable } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';



import * as moment from 'moment';
import { HttpModule } from '@angular/http';
import * as FileSaver from 'file-saver';

declare var _: any;

@Component({
  selector: 'app-download-report',
  templateUrl: './download-report.component.html',
  styleUrls: ['./download-report.component.css']
})
export class DownloadReportComponent implements OnInit {
  headers: any; loadingData: any;
  pageSize: number = 30;
  displayedColumns = ['adjType', 'item', 'description', 'skid', 'customer', 'status', 'qty', 'amount', 'details'];
  dataSource = new MatTableDataSource()
  resultsLength = 0; isLoadingResults = true; isRateLimitReached = false;



  dateForm = new FormGroup({
    dateStart: new FormControl('', Validators.required),
    dateEnd: new FormControl('', Validators.required)
  })

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private dataService: DataServiceService, public snackBar: MatSnackBar) { }

  ngOnInit() {
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    // this.getPaginationData(0);

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          return this.dataService.getAdjustments(this.sort.active, this.sort.direction, this.paginator.pageIndex);

        }), map((data) => {
          var results = data.json();
          this.isLoadingResults = false;
          this.isRateLimitReached = false;
          this.resultsLength = results.totalCount;

          return results.items;
        }),
        catchError(() => {
          this.isLoadingResults = false;
          let loadError = this.snackBar.open('Unable to retrive data, please try again', '', { duration: 6000 });
          return observableOf([]);
        })
      ).subscribe(data => {
        this.dataSource = data;
      })



  }


  applyFilter(skid: any) {
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    this.resultsLength = 0;

    this.dataService.getAdjustmentsBySkid(skid).subscribe(res => {
      this.dataSource = _.sortBy(res, 'createdDate').reverse();
    }, err => {
      console.log(err);
      if (err.status == 404) {
      }
      else {
        let loadError = this.snackBar.open('Unable to retrive data, please try again', '', { duration: 6000 });
      }

    });
  }

  showDetails(id: any) {
    console.log(id);
  }

  applyDates() {
    if (this.dateForm.value.dateEnd < this.dateForm.value.dateStart) {
      let loadError = this.snackBar.open('Error to Select Dates.', '', { duration: 6000 });
    } else {

      this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
      this.resultsLength = 0;
      this.pageSize = 0;

      var start = moment(this.dateForm.value.dateStart).format('MM-DD-YYYY')
      var end = moment(this.dateForm.value.dateEnd).format('MM-DD-YYYY')

      this.dataService.getRecords(start, end).then(res => {
        this.dataSource = _.sortBy(res.items, 'createdDate').reverse();
        this.resultsLength = res.totalCount;
        this.pageSize = res.totalCount

      }, err => {
        let loadError = this.snackBar.open('Unable to retrive data, please try again', '', { duration: 6000 });
      })
    }
  }

  downloadAll() {
    this.dataService.downloadAll().subscribe(res => {
      FileSaver.saveAs(res, 'ReportAll.xls');
    }, err => {
      let loadError = this.snackBar.open('Unable to retrive data, please try again', '', { duration: 6000 });
    })

  }

  downloadCurrent() {
    this.dataService.downloadCurrent(this.dataSource).subscribe(res => {
      FileSaver.saveAs(res, 'ReportCurrent.xls');
    }, err => {
      let loadError = this.snackBar.open('Unable to retrive data, please try again', '', { duration: 6000 });
    })
  }
}


export class ResponseData {
  totalCount: number;
  totalPages: number;
  prevPageLink: string;
  nextPageLink: string;
  items: [MyAdjustment]
}

export class MyAdjustment {
  id: number;
  adjType: string;
  reason: string;
  warehouse: string;
  location: string;
  item: string;
  description: string;
  skid: number;
  customer: string;
  qtyToAdjust: number;
  amountToAdjust: number;
  apprId: number;
  ccAppStatus: number;
  status: string;
  createdBy: string;
  inventoryDate: string;
  standardCost: number;
  apprStatus: any;
  ccAppDate: any;
  createdDate: any;
  ccAppName: any;
  ncmr: string;
  baanOrder: string;
}

