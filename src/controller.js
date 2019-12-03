import { TYPE_START_YEAR, TYPE_END_YEAR, TYPE_TEMPERATURE } from "./const"

/**
 * @class Controller
 * Links the user input and the view output.
 * @param model
 * @param view
 */
export class Controller {

    constructor(model, view) {

      this.model = model
      this.view = view
  
      // Explicit this binding
      this.model.bindChartListChange(this.onChartDataChange)
      this.view.bindTemperatureChange(this.handleTemperatureChange)
      this.view.bindPrecipitationChange(this.handlePrecipitationChange)
      this.view.bindStartYearChange(this.handleStartYearChange)
      this.view.bindEndYearChange(this.handleEndYearChange)
      this.model.getData(TYPE_TEMPERATURE)
    }
  
    handleTemperatureChange = data => {
      this.model.loadServerData(data)
    }

    handlePrecipitationChange = data => {
      this.model.loadServerData(data)
    }

    handleStartYearChange = data => {
      this.model.setYear(TYPE_START_YEAR, data)
    }

    handleEndYearChange = data => {
      this.model.setYear(TYPE_END_YEAR, data)
    }

    onChartDataChange = chartDataRange => {
      this.view.drawCanvas(chartDataRange)
    }
  }