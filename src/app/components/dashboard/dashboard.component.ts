import { Component, OnInit } from '@angular/core';
import { Observable } from "rxjs";
import { IntervalObservable } from "rxjs/observable/IntervalObservable";
import { MatSnackBar } from '@angular/material';
import { DataServiceService } from '../../services/data-service.service';

import * as moment from 'moment';

declare var _: any;
declare var $: any;
declare var Chart: any;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  timer = Observable.interval(300000);
  barNegQty: Array<any> = new Array(); barNegLabels: Array<any> = new Array();
  negativeAdj: number = 0;
  positiveAdj: number = 0; totalAmount: number = 0; customers: Array<any> = new Array();
  customersqty: Array<any> = new Array(); reasons: Array<any> = new Array();
  reasonsqty: Array<any> = new Array(); status: Array<any> = new Array();
  statusqty: Array<any> = new Array(); barPosLabels: Array<any> = new Array();
  barPosQty: Array<any> = new Array();
  barNetLabels: Array<any> = new Array(); barNetQty: Array<any> = new Array();

  constructor(private dataService: DataServiceService, public snackBar: MatSnackBar) { }

  ngOnInit() {
    this.getData();

    this.timer.subscribe(x => this.getData());
  }


  private getData() {
    this.negativeAdj = 0; this.positiveAdj = 0; this.totalAmount = 0;
    this.customers = []; this.customersqty = []; this.reasons = []; this.reasonsqty = []; this.status = [];
    this.statusqty = []; this.barPosLabels = []; this.barPosQty = [];
    this.barNegLabels = []; this.barNegQty = []; this.barNetLabels = []; this.barNetQty = [];


    this.dataService.getFiscalDates().subscribe(res => {
      var start = moment(res.startFiscalPeriod).format('MM-DD-YYYY')
      var end = moment(res.endFiscalPeriod).format('MM-DD-YYYY')

      this.dataService.getRecords(start, end).then(results => {
        var res = results.items

        _.groupByMulti = function (obj, values, context) {
          if (!values.length)
            return obj;
          var byFirst = _.groupBy(obj, values[0], context),
            rest = values.slice(1);
          for (var prop in byFirst) {
            byFirst[prop] = _.groupByMulti(byFirst[prop], rest, context);
          }
          return byFirst;
        };


        //Reasons
        var reason = _.groupByMulti(res, ['reason', 'id'], null);
        Object.keys(reason).forEach((key) => {
          this.reasons.push(key);
          this.reasonsqty.push(Object.keys(reason[key]).length);
        });

        //Customer
        var customers = _.groupByMulti(res, ['customer', 'id'], null);
        Object.keys(customers).forEach((key) => {
          this.customers.push(key);
          this.customersqty.push(Object.keys(customers[key]).length);
        });

        //NET Total
        var ad = _.groupByMulti(res, ['adjType']);
        Object.keys(ad).forEach((key) => {
          Object.keys(ad[key]).forEach((key1) => {
            if (ad[key][key1].status == 'REJECTED') {
            }
            else if (ad[key][key1].status == 'CANCELED') {
            }
            else {
              if (ad[key][key1].adjType == 'NEGATIVE') {
                this.negativeAdj = this.negativeAdj + ad[key][key1].amountToAdjust
              }
              else {
                this.positiveAdj = this.positiveAdj + ad[key][key1].amountToAdjust
              }
            }
          });
        });

        this.totalAmount = this.positiveAdj - this.negativeAdj;


        //Status
        var statRecors = _.groupByMulti(res, ['status', 'id'])

        Object.keys(statRecors).forEach((key) => {
          this.status.push(key);
          this.statusqty.push(Object.keys(statRecors[key]).length);
        })


        //$ Trend
        var recTrend = _.groupByMulti(res, ['shortDate']);

        var tPosQty = 0;
        var tNegQty = 0;
        var tNetQty = 0;

        Object.keys(recTrend).forEach((key) => {
          this.barPosLabels.push(key);
          this.barNegLabels.push(key);
          this.barNetLabels.push(key);

          Object.keys(recTrend[key]).forEach((key1) => {

            if (recTrend[key][key1].status == 'REJECTED') {
            }
            else if (recTrend[key][key1].status == 'CANCELED') {
            }
            else {
              if (recTrend[key][key1].adjType == 'NEGATIVE') {
                tNegQty = tNegQty + recTrend[key][key1].amountToAdjust
              }
              else {
                tPosQty = tPosQty + recTrend[key][key1].amountToAdjust
              }
            }
          });

          this.barNegQty.push(tNegQty);
          this.barPosQty.push(tPosQty);
          tNetQty = tPosQty - tNegQty;
          this.barNetQty.push(tNetQty);

          tPosQty = 0;
          tNegQty = 0;
          tNetQty = 0;

          var NegativeTrend = $("#NegativeTrend");
          var NegativeTrendChart = new Chart(NegativeTrend, {
            type: 'line',
            data: {
              labels: this.barNegLabels,
              datasets: [{
                data: this.barNegQty,
                backgroundColor: ['rgb(0,154,221)'],
                borderWidth: 1
              }]
            },
            options: {
              legend: {
                display: false
              }
            }
          });

          var PositiveTrend = $("#PositiveTrend");
          var PositiveTrendChart = new Chart(PositiveTrend, {
            type: 'line',
            data: {
              labels: this.barPosLabels,
              datasets: [{
                data: this.barPosQty,
                backgroundColor: ['rgb(130,188,0)'],
                borderWidth: 1
              }]
            },
            options: {
              legend: {
                display: false
              }
            }
          });

          var NetTrend = $("#NetTrend");
          var NetTrendChart = new Chart(NetTrend, {
            type: 'line',
            data: {
              labels: this.barNetLabels,
              datasets: [{
                data: this.barNetQty,
                backgroundColor: ['rgb(245,128,33)'],
                borderWidth: 1
              }]
            },
            options: {
              legend: {
                display: false
              }
            }
          });

          var ReasonPie = $("#reasons");
          var ReasonPieChart = new Chart(ReasonPie, {
            type: 'pie',
            data: {
              labels: this.reasons,
              datasets: [{
                data: this.reasonsqty,
                backgroundColor: [
                  'rgb(0,154,221)', 'rgb(245,128,33)', 'rgb(130,188,0)', 'rgb(208,50,56)', 'rgb(194,24,91)', 'rgb(100,79,69)',
                  'rgb(34,104,137)', 'rgb(0,100,50)', 'rgb(56,142,60)', 'rgb(0,84,134)', 'rgb(34,104,137)'
                ],
                borderWidth: 1
              }]
            },
            options: {
              legend: {
                display: true,
                position: 'left',
                labels: {
                  boxWidth: 10,
                  fontSize: 8
                }
              }
            }
          });

          var CustomerPie = $("#customers");
          var CustomerPieChart = new Chart(CustomerPie, {
            type: 'pie',
            data: {
              labels: this.customers,
              datasets: [{
                data: this.customersqty,
                backgroundColor: [
                  'rgb(0,154,221)', 'rgb(245,128,33)', 'rgb(130,188,0)', 'rgb(208,50,56)', 'rgb(194,24,91)', 'rgb(100,79,69)',
                  'rgb(34,104,137)', 'rgb(0,100,50)', 'rgb(56,142,60)', 'rgb(0,84,134)', 'rgb(34,104,137)'
                ],
                borderWidth: 1
              }]
            },
            options: {
              legend: {
                display: true,
                position: 'left',
                labels: {
                  boxWidth: 10,
                  fontSize: 8
                }
              }
            }
          });

          var StatusPie = $("#status");
          var StatusPieChart = new Chart(StatusPie, {
            type: 'pie',
            data: {
              labels: this.status,
              datasets: [{
                data: this.statusqty,
                backgroundColor: [
                  'rgb(0,154,221)', 'rgb(208,50,56)', 'rgb(130,188,0)', 'rgb(226,226,226)', 'rgb(208,50,56)'
                ],
                borderWidth: 1
              }]
            },
            options: {
              legend: {
                display: true,
                position: 'left',
                labels: {
                  boxWidth: 10,
                  fontSize: 8
                }
              }
            }
          });

        });
      }, err => {
        let loadError = this.snackBar.open('Unable to retrive data, please try again', '', { duration: 6000 });
      });
    }, err => {
      let loadError = this.snackBar.open('Unable to retrive data, please try again', '', { duration: 6000 });
    });
  }
}
