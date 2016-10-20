# lambda-sailthru
A lightweight AWS Lambda function that communicates with Sailthru.com API. This function will work with any Salthru endpoint by specifying the endpoint name in the JSON object provided to the function.

Includes Airbrake integration. To enable your Airbrake integration you must set the following deployment variables: `AIRBRAKE_PROJECT_ID` and `AIRBAKE_PROJECT_KEY`. If these variables are not provided Airbrake will not be enabled but the function will still make API requests.

## Getting Started
1. `npm install -g node-lambda`
2. `npm install`
3. Copy `deploy.env.example` to `deploy.env`
4. Copy `event.json.example` to `event.json`
5. Copy `.env.example` to `.env`
3. To test the function locally: `node-lambda run`

## Example
The following is an example of a JSON object lambda-sailthru expects. You will also find this example in `event.json.example`
```
{
  "apiType": "user",
  "apiKey": "INTERNAL_API_KEY",
  "postParams": {
    "id": "test@test.com",
    "key": "email",
    "vars": {
      "test": "true"
    }
  }
}
```
`apiType`: Sailthru endpoint

`apiKey`: This should match your `SAILTHRU_LAMBDA_KEY` provided in deploy.env

`postParams`: JS object that provides required Sailthru API parameters. See [Sailthru API](https://getstarted.sailthru.com/new-for-developers-overview/api/api-overview/) documentation for examples.

## Deployment
If you installed node-lambda there are two options available

1. `node-lambda package`

    Creates a compressed zip file that includes the main function and node_modules folder
2. `node-lambda deploy`

    Automatically deploys the function to your AWS Lambda server. Requires AWS keys in .env to be updated with your credentials. See [node-lambda documentation](https://github.com/motdotla/node-lambda) for more configuration options

## AWS API Gateway Configuration
Incoming POST requests to Amazon API Gateway require configuring the endpoint's Integration Request. The following is an example mapping for POST requests with `Content-Type: application/json`
```
#set($allParams = $input.params())
{
"body" : $input.json('$'),
"params" : {
#foreach($type in $allParams.keySet())
    #set($params = $allParams.get($type))
"$type" : {
    #foreach($paramName in $params.keySet())
    "$paramName" : "$util.escapeJavaScript($params.get($paramName))"
        #if($foreach.hasNext),#end
    #end
}
    #if($foreach.hasNext),#end
#end
},
"context" : {
    "account-id" : "$context.identity.accountId",
    "api-id" : "$context.apiId",
    "api-key" : "$context.identity.apiKey",
    "http-method" : "$context.httpMethod",
    "user" : "$context.identity.user",
    "user-agent" : "$context.identity.userAgent",
    "request-id" : "$context.requestId",
    "resource-id" : "$context.resourceId",
    "resource-path" : "$context.resourcePath"
    }
}
```
