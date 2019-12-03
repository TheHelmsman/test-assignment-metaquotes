import {TYPE_TEMPERATURE, TYPE_PRECIPATION } from "./const"
/**
 * @class View
 * Visual representation of the model.
 */
export class View {

    constructor() {

      this.app = this.getElement('#root')

      this.title = this.createElement('h1')
      this.title.textContent = 'Архив метеослужбы'

      this.temperatureButton = this.createElement('button')
      this.temperatureButton.className = 'button-selected'
      this.temperatureButton.textContent = 'Температура'
      
      this.precipitationButton = this.createElement('button')
      this.precipitationButton.className = 'button-not-selected'
      this.precipitationButton.textContent = 'Осадки'

      this.buttonsContainer = this.createElement('div')
      this.buttonsContainer.append(this.temperatureButton, this.precipitationButton)

      this.selectBegin = this.createElement('select')
      this.selectBegin.id = 'select-begin'
      this.selectEnd = this.createElement('select')
      this.selectEnd.id = 'select-end'
      
      for(let i=0; i<=125; i++) {
        
        let optionBegin = document.createElement( 'option' )
        let optionEnd = document.createElement( 'option' )
        
        optionBegin.value = optionBegin.textContent = optionEnd.value = optionEnd.textContent = 1881 + i
        optionBegin.id = 'begin-' + (1881 + i)
        optionEnd.id = 'end-' + (1881 + i)
        
        this.selectBegin.appendChild( optionBegin )
        this.selectEnd.appendChild( optionEnd )
      }

      this.selectBegin.selectedIndex = 0
      this.selectEnd.selectedIndex = this.selectEnd.length -1
      
      this.chartContainer = this.createElement('div')
      
      this.selectsContaner = this.createElement('div')
      this.selectsContaner.id = 'selectsContainer'
      this.selectsContaner.append(this.selectBegin, this.selectEnd)

      this.chartContaner = this.createElement('div')
      this.chartContainer.id = 'chartContainer'
      this.chartContaner.append(this.selectsContaner, this.chartContainer)
      
      this.form = this.createElement('form')
      this.form.append(this.buttonsContainer, this.chartContaner)
      
      this.app.append(this.title, this.form)
    }
  
    createElement(tag, className) {

      const element = document.createElement(tag)
      if (className) element.classList.add(className)
      return element
    }
  
    getElement(selector) {

      const element = document.querySelector(selector)
      return element
    }
  
    calcMin(chartDataRange) {

      let minVal = chartDataRange[0]['v']
      chartDataRange.forEach(element => {
        if(element['v'] < minVal) minVal = element['v']
      })
      return parseInt(minVal)
    }

    calcMax(chartDataRange) {

      let maxVal = chartDataRange[0]['v']
      chartDataRange.forEach(element => {
        if(element['v'] > maxVal) maxVal = element['v']
      })
      return parseInt(maxVal)
    }

    drawCanvas(chartDataRange) {

      if(chartDataRange.length === 0) return;

      this.sections = chartDataRange.length
      this.val_max = this.calcMax(chartDataRange)
      this.val_min = this.calcMin(chartDataRange)
      this.stepSize = 2
      this.rowSize = 50
      this.margin = 10
      this.chartContainer = document.getElementById("chartContainer")
      this.chartContainer.innerHTML = ''
      this.canvas = document.createElement('canvas')
      this.canvas.width = 650;
      this.canvas.height = 400;
      this.canvas.style.zIndex = 8;
      this.chartContainer.append(this.canvas)
      this.context = this.canvas.getContext("2d")
      this.context.fillStyle = "#0099ff"
      this.context.font = "20 pt Verdana"
      this.xAxis = new Array(12)
      this.columnSize = 50
      this.yScale = (this.canvas.height - this.columnSize - this.margin) / (this.val_max - this.val_min)
      this.xScale = (this.canvas.width - this.rowSize) / this.sections
      
      this.context.strokeStyle="#009933" // color of grid lines
      this.context.beginPath()
      
      // X axis, and grid lines on the graph
      for (let i=0; i<=this.sections; i++) {
        let x = i * this.xScale + this.rowSize
        this.context.moveTo(x, this.columnSize)
        this.context.lineTo(x, this.canvas.height + this.margin)
      }
      // print row header and draw horizontal grid lines
      let count =  0;
      for (let scale=this.val_max; scale>=this.val_min; scale = scale - this.stepSize) {
        let y = this.columnSize + (this.yScale * count * this.stepSize)
        this.context.fillText(scale, this.margin, y + this.margin)
        this.context.moveTo(this.rowSize, y)
        this.context.lineTo(this.canvas.width, y)
        count++
      }
      this.context.stroke()
      
      this.context.translate(this.rowSize, this.canvas.height + this.val_min * this.yScale)
      this.context.scale(1,-1 * this.yScale)
      
      this.context.strokeStyle = "#FF0066"

      this.context.beginPath()
      this.context.moveTo(0, chartDataRange[0]['v'])
      for (let i=1; i<chartDataRange.length; i++) {
        this.context.lineTo(i * this.xScale, chartDataRange[i]['v'])
      }
      this.context.stroke()

    }
    
    bindTemperatureChange(handler) {

      this.temperatureButton.addEventListener('click', event => {
        event.preventDefault()
        this.temperatureButton.className = 'button-selected';
        this.precipitationButton.className = 'button-not-selected';
        handler(TYPE_TEMPERATURE)
      }, false)
    }

    bindPrecipitationChange(handler) {

      this.precipitationButton.addEventListener('click', event => {
        event.preventDefault()
        this.precipitationButton.className = 'button-selected';
        this.temperatureButton.className = 'button-not-selected';
        handler(TYPE_PRECIPATION)
      }, false)
    }

    bindStartYearChange(handler) {

      this.selectBegin.addEventListener('change', event => {
        event.preventDefault()
        const year = parseInt(event.target[event.target.selectedIndex].value)
        handler(year)
      }, false)
    }

    bindEndYearChange(handler) {

      this.selectEnd.addEventListener('change', event => {
        event.preventDefault()
        const year = parseInt(event.target[event.target.selectedIndex].value)
        handler(year)
      }, false)
    }

  }