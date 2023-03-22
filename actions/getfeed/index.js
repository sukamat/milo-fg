const fetch = require('node-fetch');

async function main(params) {
    const response = await fetch('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY');
    const json = await response.json();

    return {
        statusCode: 200,
        body: {
            payload: params,
        }
    }
}

exports.main = main;