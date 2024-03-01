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

const FgUser = require('../fgUser');

function isGrayboxParamsValid(params) {
    const {
        rootFolder,
        gbRootFolder,
        projectExcelPath,
        experienceName,
        spToken,
        adminPageUri,
        draftsOnly,
        promoteIgnorePaths
    } = params;

    const requiredParams = [rootFolder, gbRootFolder, projectExcelPath,
        experienceName, spToken, adminPageUri, draftsOnly, promoteIgnorePaths];

    // Return true if all required parameters are present
    return !requiredParams.some((param) => !param);
}

async function isUserAuthorized(params, grpIds) {
    const { spToken } = params;
    const grayboxUser = new FgUser({ at: spToken });
    const found = await grayboxUser.isInGroups(grpIds);
    return found;
}

async function validateAction(params, grpIds) {
    if (!isGrayboxParamsValid(params)) {
        return {
            code: 400,
            payload: 'Required data is not available to proceed with Graybox Promote action.'
        };
    }
    if (!await isUserAuthorized(params, grpIds)) {
        return {
            code: 401,
            payload: 'Additional permissions required to proceed with Graybox Promote action.'
        };
    }
    return {
        code: 200
    };
}

module.exports = {
    validateAction
};
