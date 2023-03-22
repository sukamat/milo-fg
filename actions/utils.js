const AioLogger = require('@adobe/aio-lib-core-logging');

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

module.exports = {
    getAioLogger,
    getUrlInfo,
};
