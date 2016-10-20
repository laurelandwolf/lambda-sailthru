'use strict'

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

const buildConnection = (envType) => {

  let apiKey = process.env['SAILTHRU_API_KEY']
  let apiSecret = process.env['SAILTHRU_API_SECRET']

  if (envType === 'development' || envType === 'staging') {
    apiKey = process.env['SAILTHRU_DEV_API_KEY']
    apiSecret = process.env['SAILTHRU_DEV_API_SECRET']
  }

  const sailThru = require('sailthru-client').createSailthruClient(
      apiKey,
      apiSecret
    )
  sailThru.enableLogging()
  return sailThru
}

exports.handler = (request, context) => {

  const event = request.body
  if (event.apiKey === process.env['SAILTHRU_LAMBDA_KEY']) {
    const sailThru = buildConnection(event.sailthruEnv)

    if (event.apiType === 'send') {
      sailThru.send(request.template, request.email, options, (err, response) => {
        if (response.error) {
          reportError("SailThru API Error: " + response.error + " - " + response.errormsg)
        }
        else if (err) {
          reportError("SailThru API Error: " + JSON.stringify(err))
        }
      })
    }
    else {
      sailThru.apiPost(event.apiType, event.postParams, (err, response) => {
        if (response.error) {
          reportError("SailThru API Error: " + response.error + " - " + response.errormsg)
        }
        else if (err) {
          reportError("SailThru API Error: " + JSON.stringify(err))
        }
      })
    }
  }
  else {
      reportError('Invalid API Key')
  }
}
