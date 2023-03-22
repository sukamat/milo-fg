// eslint-disable-next-line import/no-extraneous-dependencies
const openwhisk = require('openwhisk');
const { getAioLogger } = require('../utils');

// This returns the activation ID of the action that it called
function main(args) {
    const logger = getAioLogger();
    let ret = 'error';
    try {
        const ow = openwhisk();
        return ow.actions.invoke({
            name: 'milo-fg/promote-worker', // the name of the action to invoke
            blocking: false, // this is the flag that instructs to execute the worker asynchronous
            result: false,
            params: args
        });
    } catch (err) {
        logger.error(err);
        ret = err;
    }

    return ret;
}

exports.main = main;
