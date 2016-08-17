'use strict'

const sailThru = require('sailthru-client').createSailthruClient(
    process.env['SAILTHRU_API_KEY'],
    process.env['SAILTHRU_API_SECRET']
  )
sailThru.enableLogging()

let airbrake
if (process.env['AIRBRAKE_PROJECT_ID'] && process.env['AIRBAKE_PROJECT_KEY']) {
  airbrake = require('airbrake').createClient(
    process.env['AIRBRAKE_PROJECT_ID'],
    process.env['AIRBAKE_PROJECT_KEY']
  )
  airbrake.handleExceptions()
}

const reportError = (err) => {
  if (airbrake) {
    var error = new Error(err)
    airbrake.notify(error, () => {})
  }
}

exports.handler = (event, context) => {
  if (event.apiKey === process.env['SAILTHRU_LAMBDA_KEY']) {
    sailThru.apiPost(event.apiType, event.postParams, (err, response) => {
      if (response.error) {
        reportError("SailThru API Error: " + response.error + " - " + response.errormsg)
      }
      else if (err) {
        reportError("SailThru API Error: " + JSON.stringify(err))
      }
    })
  }
  else {
      reportError('Invalid API Key')
  }
}
