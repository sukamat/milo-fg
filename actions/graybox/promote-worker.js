/* ************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
* Copyright 2024 Adobe
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

const { getAioLogger } = require('../utils');
const { isGrayboxParamsValid } = require('./utils');
const grayboxConfig = require('./config');

async function main(params) {
    const logger = getAioLogger();
    let responsePayload;
    logger.info('Graybox Promote Worker invoked');

    if (!isGrayboxParamsValid(params)) {
        responsePayload = 'Required data is not available to proceed with Graybox Promote action.';
        logger.error(responsePayload);
        return exitAction({
            code: 400,
            payload: responsePayload
        });
    }

    grayboxConfig.setGrayboxConfig(params);

    // TODO - find all files in graybox folder for the specified experience
    // TODO - update docx file before triggering copy
    // TODO - copy updated docx file to the default content folder
    // TODO - run the bulk preview action on the list of files that were copied to default tree
    // TODO - update the project excel file as and when necessary to update the status of the promote action

    responsePayload = 'Graybox Promote Worker action completed';
    return exitAction({
        body: responsePayload,
    });
}

function exitAction(resp) {
    grayboxConfig.removePayload();
    return resp;
}

exports.main = main;
