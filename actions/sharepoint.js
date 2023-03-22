const { Headers } = require('node-fetch');
const { getAioLogger } = require('./utils');

// eslint-disable-next-line default-param-last
function getAuthorizedRequestOption({ body = null, json = true, method = 'GET' } = {}, spToken) {
    const logger = getAioLogger();
    const bearer = `Bearer ${spToken}`;
    const headers = new Headers();
    headers.append('Authorization', bearer);
    if (json) {
        headers.append('Accept', 'application/json');
        headers.append('Content-Type', 'application/json');
    }

    const options = {
        method,
        headers,
    };

    if (body) {
        options.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    logger.info(JSON.stringify(options));

    return options;
}

module.exports = {
    getAuthorizedRequestOption,
};
