const AioLogger = require('@adobe/aio-lib-core-logging');
const fetch = require('node-fetch');

const MAX_RETRIES = 5;

function getAioLogger(loggerName = 'main', logLevel = 'info') {
    return AioLogger(loggerName, { level: logLevel });
}

function getUrlInfo(adminPageUri) {
    const logger = getAioLogger();
    logger.info('inside getUrlInfo');
    const location = new URL(adminPageUri);
    logger.info('after location');
    logger.info(location);
    function getParam(name) {
        return location.searchParams.get(name);
    }
    const projectName = getParam('project');
    const sub = projectName ? projectName.split('--') : [];

    const sp = getParam('referrer');
    const owner = getParam('owner') || sub[1];
    const repo = getParam('repo') || sub[0];
    const ref = getParam('ref') || 'main';

    logger.info(`sp::${sp}::owner::${owner}::repo::${repo}::ref::${ref}`);

    const urlInfo = {
        sp,
        owner,
        repo,
        ref,
        origin: `https://${ref}--${repo}--${owner}.hlx.page`,
        isValid() {
            return sp && owner && repo && ref;
        },
    };
    logger.info('exiting getUrlInfo');
    return urlInfo;
}

// eslint-disable-next-line default-param-last
async function simulatePreview(path, retryAttempt = 1, isFloodgate, adminPageUri) {
    const previewStatus = { success: true, path };
    try {
        const urlInfo = getUrlInfo(adminPageUri);
        const repo = isFloodgate ? `${urlInfo.repo}-pink` : urlInfo.repo;
        const previewUrl = `https://admin.hlx.page/preview/${urlInfo.owner}/${repo}/${urlInfo.ref}${path}`;
        const response = await fetch(
            `${previewUrl}`,
            { method: 'POST' },
        );
        if (!response.ok && retryAttempt <= MAX_RETRIES) {
            await simulatePreview(path, retryAttempt + 1, isFloodgate, adminPageUri);
        }
        previewStatus.responseJson = await response.json();
    } catch (error) {
        previewStatus.success = false;
    }
    return previewStatus;
}

function handleExtension(path) {
    if (path.endsWith('.xlsx')) {
        return path.replace('.xlsx', '.json');
    }
    return path.substring(0, path.lastIndexOf('.'));
}

async function getFile(downloadUrl) {
    const response = await fetch(downloadUrl);
    if (response) {
        return response.blob();
    }
    return undefined;
}

module.exports = {
    getAioLogger,
    getUrlInfo,
    simulatePreview,
    handleExtension,
    getFile,
};
