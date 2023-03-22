function getUrlInfo(logger) {
    logger.info('inside getUrlInfo');
    //const location = new URL(document.location.href);
    const uri = 'https://main--milo--adobecom.hlx.page/tools/floodgate/index.html?project=milo--adobecom&referrer=https%3A%2F%2Fadobe.sharepoint.com%2F%3Ax%3A%2Fr%2Fsites%2Fadobecom%2F_layouts%2F15%2FDoc.aspx%3Fsourcedoc%3D%257B4EBD6F30-D51F-419B-BD0A-7485D4081302%257D%26file%3Dsample_fg_project.xlsx%26action%3Ddefault%26mobileredirect%3Dtrue';
    const location = new URL(uri);
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

    logger.info('params read');

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
    getUrlInfo,
};