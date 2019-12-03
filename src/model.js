import { 
  TYPE_TEMPERATURE, 
  TYPE_PRECIPATION, 
  TYPE_START_YEAR, 
  TYPE_END_YEAR, 
  ERROR_DB_FAIL, 
  ERROR_DB_NO_DATA, 
  ERROR_DB_SAVE_FAIL,
  SUCCESS_RECORDS_FOUND } from "./const"
import { DB }  from './db'

/**
 * @class Model
 * Manages the data of the application.
 */
export class Model {

  constructor() {

      this.db = new DB()
      this.chartDataRange = []
      this.startYear = 1881
      this.endYear = 2006
      this.temperature = {}
      this.precipitation = {}
      this.currentChart = TYPE_TEMPERATURE
      this.dbNeedUpdate = false
    }
  
    getData(type)  {

      this.currentChart = type
      this.db.fetchData(this.startYear, this.endYear, this.currentChart, this.onFetchHandler.bind(this))
    }

    onFetchHandler(result, data) {

      switch(result) {
        case ERROR_DB_FAIL:
          //  indexedDB fails and can't be used, continue with server
          this.loadServerData(this.currentChart)
          break
        case ERROR_DB_NO_DATA:
          //  indexedDB has no data, need to get data from server and put in DB
          this.dbNeedUpdate = true
          this.loadServerData(this.currentChart)
          break
          case SUCCESS_RECORDS_FOUND:
            this.buildDataRange(data)
          break
      }
    }

    loadFile = filePath => {

      var result = null;
      var xmlhttp = new XMLHttpRequest();
      xmlhttp.open("GET", filePath, false);
      xmlhttp.send();
      if (xmlhttp.status == 200) {
        result = xmlhttp.responseText;
      }
      return result;
    }

    loadServerData(type) {

      this.currentChart = type
      switch(type) {
        case TYPE_TEMPERATURE:
            this.temperature = JSON.parse(this.loadFile('http://localhost:5000/temperature'))
            this.buildDataRange(this.temperature)
            if(this.dbNeedUpdate) {
              this.db.saveData(this.temperature, this.currentChart, this.onSaveHandler.bind(this))
              this.dbNeedUpdate = false
            }
          break;
        case TYPE_PRECIPATION:
            this.precipitation = JSON.parse(this.loadFile('http://localhost:5000/precipitation'))
            this.buildDataRange(this.precipitation)
            if(this.dbNeedUpdate) {
              this.db.saveData(this.precipitation, this.currentChart, this.onSaveHandler.bind(this))
              this.dbNeedUpdate = false
            }
          break;
        default:
          console.log('Error! Type not found in loadServerData function call arguments!')
      }
    }

    onSaveHandler(result) {

      switch(result) {
        case ERROR_DB_FAIL:
          //  indexedDB fails and can't be used, continue with server
          this.loadServerData(this.currentChart)
          break;
        case ERROR_DB_SAVE_FAIL:
          //  indexedDB has no data, need to get data from server and put in DB
          this.loadServerData(this.currentChart)
          this.dbNeedUpdate = true
          break;
      }
    }

    setYear(type, value) {
      switch(type) {
        case TYPE_START_YEAR:
            this.startYear = value
          break;
        case TYPE_END_YEAR:
            this.endYear = value
          break;
        default:
          console.log('Error! Type not found in setYear function call arguments!')
      }
    }

    buildDataRange(data) {
      if(this.startYear > this.endYear) {
        console.log('Error! Start year must be equal or lower than end year! Start year:'+this.startYear+' end year: '+this.endYear)
        return
      }
      if(this.endYear - this.startYear < 10) {
        //  build detailed chart on each day of the year
        let test = value => {
          let dateValue = value.t.split('-')
          let year = parseInt(dateValue[0])
          if (year >= this.startYear && year <= this.endYear) {
            return value
          }
        }
        this.chartDataRange = data.filter(test)
      } else {
        //  approximated chart - simplified to average value each month
        let average = []
        let currYear = -1;
        let currMonth = -1;
        let arr = []
        for(let i=0; i<data.length; i++) {
          let dateValue = data[i]['t'].split('-')
          if((parseInt(dateValue[0]) != currYear || parseInt(dateValue[1]) != currMonth) && 
          (parseInt(dateValue[0]) >= this.startYear && parseInt(dateValue[0]) <= this.endYear)) {
            //  update current month and year and calculate average
            currYear = parseInt(dateValue[0])
            currMonth = parseInt(dateValue[1])
            if(arr.length > 0) {
              average.push({t: currYear+'-'+currMonth, v: this.calcAverage(arr)})
              arr = []
            }
          } else {
            arr.push(data[i]['v'])
          }
        }
        this.chartDataRange = average;
      }
      
      this.onChartDataChange(this.chartDataRange)
    }

    calcAverage(values) {

      let sum = values.reduce((previous, current) => current += previous)
      let avg = sum / values.length
      return avg
    }

    bindChartListChange(callback) {

      this.onChartDataChange = callback
    }

    getCurrentChart() {

      return this.currentChart
    }

  }