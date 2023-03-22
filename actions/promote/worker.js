const fetch = require('node-fetch');
const { getConfig } = require('../config');
const {
    getAuthorizedRequestOption, createFolder, saveFile, updateExcelTable
} = require('../sharepoint');
const {
    getAioLogger, simulatePreview, handleExtension, getFile
} = require('../utils');

async function main(params) {
    const logger = getAioLogger();
    let payload;
    try {
        const { spToken } = params;
        const { adminPageUri } = params;
        const { projectExcelPath } = params;
        logger.info(spToken);
        logger.info(adminPageUri);
        logger.info(projectExcelPath);

        if (!spToken || !adminPageUri || !projectExcelPath) {
            payload = 'Required data not available to proceed.';
            logger.error(payload);
        } else {
            logger.info('Getting all files to be promoted');
            payload = await promoteFloodgatedFiles(spToken, adminPageUri, projectExcelPath);
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
    const { sp } = await getConfig(adminPageUri);
    const baseURI = `${sp.api.excel.update.fgBaseURI}`;
    const rootFolder = baseURI.split('/').pop();
    logger.info(`baseURI:: ${baseURI}`);
    logger.info(`rootFolder:: ${rootFolder}`);
    const options = getAuthorizedRequestOption(spToken, { method: 'GET' });

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

/**
 * Copies the Floodgated files back to the main content tree.
 * Creates intermediate folders if needed.
 */
async function promoteCopy(spToken, adminPageUri, srcPath, destinationFolder) {
    const logger = getAioLogger();
    logger.info(`promoteCopy::${srcPath} --- ${destinationFolder}`);

    await createFolder(spToken, adminPageUri, destinationFolder);
    const { sp } = await getConfig(adminPageUri);
    const destRootFolder = `${sp.api.file.copy.baseURI}`.split('/').pop();

    const payload = { ...sp.api.file.copy.payload, parentReference: { path: `${destRootFolder}${destinationFolder}` } };
    const options = getAuthorizedRequestOption(spToken, {
        method: sp.api.file.copy.method,
        body: JSON.stringify(payload),
    });

    // copy source is the pink directory for promote
    const copyStatusInfo = await fetch(`${sp.api.file.copy.fgBaseURI}${srcPath}:/copy`, options);
    const statusUrl = copyStatusInfo.headers.get('Location');
    let copySuccess = false;
    let copyStatusJson = {};
    while (statusUrl && !copySuccess && copyStatusJson.status !== 'failed') {
        // eslint-disable-next-line no-await-in-loop
        const status = await fetch(statusUrl);
        if (status.ok) {
            // eslint-disable-next-line no-await-in-loop
            copyStatusJson = await status.json();
            copySuccess = copyStatusJson.status === 'completed';
        }
    }
    return copySuccess;
}

async function promoteFloodgatedFiles(spToken, adminPageUri, projectExcelPath) {
    const logger = getAioLogger();

    async function promoteFile(downloadUrl, filePath) {
        const status = { success: false };
        try {
            let promoteSuccess = false;
            logger.info(`Promoting ${filePath}`);
            const { sp } = await getConfig(adminPageUri);
            const options = getAuthorizedRequestOption(spToken);
            const res = await fetch(`${sp.api.file.get.baseURI}${filePath}`, options);
            if (res.ok) {
                // File exists at the destination (main content tree)
                // Get the file in the pink directory using downloadUrl
                const file = await getFile(downloadUrl);
                if (file) {
                    // Save the file in the main content tree
                    const saveStatus = await saveFile(spToken, adminPageUri, file, filePath);
                    if (saveStatus.success) {
                        promoteSuccess = true;
                    }
                }
            } else {
                // File does not exist at the destination (main content tree)
                // File can be copied directly
                const destinationFolder = `${filePath.substring(0, filePath.lastIndexOf('/'))}`;
                promoteSuccess = await promoteCopy(spToken, adminPageUri, filePath, destinationFolder);
            }
            status.success = promoteSuccess;
            status.srcPath = filePath;
        } catch (error) {
            logger.error(`Error occurred when trying to promote files to main content tree ${error.message}`);
        }
        return status;
    }

    const startPromote = new Date();
    // Iterate the floodgate tree and get all files to promote
    const allFloodgatedFiles = await findAllFiles(spToken, adminPageUri);
    const promoteStatuses = await Promise.all(
        allFloodgatedFiles.map((file) => promoteFile(file.fileDownloadUrl, file.filePath)),
    );
    const endPromote = new Date();

    logger.info('Previewing promoted files.');
    const previewStatuses = await Promise.all(
        promoteStatuses
            .filter((status) => status.success)
            .map((status) => simulatePreview(handleExtension(status.srcPath), 1, false, adminPageUri)),
    );
    logger.info('Completed Preview for promoted files.');

    const failedPromotes = promoteStatuses.filter((status) => !status.success)
        .map((status) => status.srcPath || 'Path Info Not available');
    const failedPreviews = previewStatuses.filter((status) => !status.success)
        .map((status) => status.path);

    const excelValues = [['PROMOTE', startPromote, endPromote, failedPromotes.join('\n'), failedPreviews.join('\n')]];
    await updateExcelTable(spToken, adminPageUri, projectExcelPath, 'PROMOTE_STATUS', excelValues);
    logger.info('Project excel file updated with promote status.');

    if (failedPromotes.length > 0 || failedPreviews.length > 0) {
        logger.info('Error occurred when promoting floodgated content. Check project excel sheet for additional information.');
    } else {
        logger.info('Promoted floodgate tree successfully. Reloading page... please wait.');
    }

    return 'promotion completed';
}

exports.main = main;
