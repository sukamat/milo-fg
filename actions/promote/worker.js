const AioLogger = require('@adobe/aio-lib-core-logging');
const fetch = require('node-fetch');
const { getConfig } = require("../config");
const { getAuthorizedRequestOption } = require("../sharepoint");

async function main(params) {
    const logger = AioLogger('main', { level: params.LOG_LEVEL || 'info' });
    const token = params.token;
    logger.info(token);

    let payload = 'sunil';
    try {
        payload = await findAllFiles(logger);
    } catch (err) {
        logger.error(err);
    }

    return {
        statusCode: 200,
        body: payload,
    }
}

async function findAllFiles(logger) {
    logger.info('inside func');
    const { sp } = await getConfig(logger);
    const baseURI = `${sp.api.excel.update.fgBaseURI}`;
    const rootFolder = baseURI.split('/').pop();
    logger.info('baseURI:: ' + baseURI);
    logger.info('rootFolder:: ' + rootFolder);
    const options = getAuthorizedRequestOption({ method: 'GET' }, logger);

    return findAllFloodgatedFiles(baseURI, options, rootFolder, [], ['']);
}

/**
 * Iteratively finds all files under a specified root folder.
 */
async function findAllFloodgatedFiles(baseURI, options, rootFolder, fgFiles, fgFolders) {
    while (fgFolders.length !== 0) {
        const uri = `${baseURI}${fgFolders.shift()}:/children`;
        // eslint-disable-next-line no-await-in-loop
        const res = await fetch(uri, options);
        if (res.ok) {
            // eslint-disable-next-line no-await-in-loop
            const json = await res.json();
            const driveItems = json.value;
            driveItems?.forEach((item) => {
                const itemPath = `${item.parentReference.path.replace(`/drive/root:/${rootFolder}`, '')}/${item.name}`;
                if (item.folder) {
                    // it is a folder
                    fgFolders.push(itemPath);
                } else {
                    const downloadUrl = item['@microsoft.graph.downloadUrl'];
                    fgFiles.push({ fileDownloadUrl: downloadUrl, filePath: itemPath });
                }
            });
        }
    }

    return fgFiles;
}

exports.main = main;