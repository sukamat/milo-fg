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

const fetch = require('node-fetch');
const { getFilesData } = require('./sharepoint');
const {
    getAioLogger, getUrlInfo, handleExtension, getFloodgateUrl, getDocPathFromUrl
} = require('./utils');

async function getProjectDetails(adminPageUri, projectExcelPath) {
    const logger = getAioLogger();
    logger.info('Getting paths from project excel worksheet');

    const urlInfo = getUrlInfo(adminPageUri);
    const projectUrl = `${urlInfo.origin}${handleExtension(projectExcelPath)}`;
    const projectFileJson = await readProjectFile(projectUrl);
    if (!projectFileJson) {
        logger.error('Could not read the project excel JSON');
        return {};
    }

    const urlsData = projectFileJson.urls.data;
    const urls = new Map();
    const filePaths = new Map();
    urlsData.forEach((urlRow) => {
        const url = urlRow.URL;
        const docPath = getDocPathFromUrl(url);
        urls.set(url, { doc: { filePath: docPath, url, fg: { url: getFloodgateUrl(url) } } });
        // Add urls data to filePaths map
        if (filePaths.has(docPath)) {
            filePaths.get(docPath).push(url);
        } else {
            filePaths.set(docPath, [url]);
        }
    });

    return {
        url: projectUrl, urls, filePaths
    };
}

async function readProjectFile(projectWebUrl) {
    const resp = await fetch(projectWebUrl, { cache: 'no-store' });
    const json = await resp.json();
    if (json?.urls?.data) {
        return json;
    }
    return undefined;
}

/**
 * Makes the sharepoint file data part of `projectDetail` per URL.
 */
function injectSharepointData(projectUrls, filePaths, docPaths, spFiles, isFloodgate) {
    for (let i = 0; i < spFiles.length; i += 1) {
        let fileBody = {};
        let status = 404;
        if (!spFiles[i].error) {
            fileBody = spFiles[i];
            status = 200;
        }
        const filePath = docPaths[i];
        const urls = filePaths.get(filePath);
        urls.forEach((key) => {
            const urlObjVal = projectUrls.get(key);
            if (isFloodgate) {
                urlObjVal.doc.fg.sp = fileBody;
                urlObjVal.doc.fg.sp.status = status;
            } else {
                urlObjVal.doc.sp = fileBody;
                urlObjVal.doc.sp.status = status;
            }
        });
    }
}

async function updateProjectWithDocs(spToken, adminPageUri, projectDetail) {
    const logger = getAioLogger();
    if (!projectDetail || !projectDetail.filePaths) {
        logger.error('Error occurred when injecting sharepoint data');
        return;
    }
    const { filePaths } = projectDetail;
    const docPaths = [...filePaths.keys()];
    const spFiles = await getFilesData(spToken, adminPageUri, docPaths);
    injectSharepointData(projectDetail.urls, filePaths, docPaths, spFiles);
    const fgSpFiles = await getFilesData(spToken, adminPageUri, docPaths, true);
    injectSharepointData(projectDetail.urls, filePaths, docPaths, fgSpFiles, true);
}

module.exports = {
    getProjectDetails,
    updateProjectWithDocs,
};
