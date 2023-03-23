/* ************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
* Copyright 2023 Adobe
* All Rights Reserved.
*
* NOTICE: All information contained herein is, and remains
* the property of Adobe and its suppliers, if any. The intellectual
* and technical concepts contained herein are proprietary to Adobe
* and its suppliers and are protected by all applicable intellectual
* property laws, including trade secret and copyright laws.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe.
************************************************************************* */

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
