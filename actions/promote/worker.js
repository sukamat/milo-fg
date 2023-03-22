const fetch = require('node-fetch');
const { getConfig } = require('../config');
const { getAuthorizedRequestOption } = require('../sharepoint');
const { getAioLogger } = require('../utils');

async function main(params) {
    const logger = getAioLogger();
    let payload;
    try {
        const { spToken } = params;
        const { adminPageUri } = params;
        logger.info(spToken);
        logger.info(adminPageUri);

        if (!spToken || !adminPageUri) {
            payload = 'Required data not available to proceed.';
            logger.error(payload);
        } else {
            logger.info('Getting all files to be promoted');
            payload = await findAllFiles(spToken, adminPageUri);
        }
    } catch (err) {
        logger.error(err);
        payload = err;
    }

    return {
        statusCode: 200,
        body: payload,
    };
}

async function findAllFiles(spToken, adminPageUri) {
    const logger = getAioLogger();
    logger.info('inside func');
    const { sp } = await getConfig(adminPageUri);
    const baseURI = `${sp.api.excel.update.fgBaseURI}`;
    const rootFolder = baseURI.split('/').pop();
    logger.info(`baseURI:: ${baseURI}`);
    logger.info(`rootFolder:: ${rootFolder}`);
    const options = getAuthorizedRequestOption({ method: 'GET' }, spToken);

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
            if (driveItems) {
                driveItems.forEach((item) => {
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
    }

    return fgFiles;
}

exports.main = main;
