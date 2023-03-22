const fetch = require('node-fetch');
const { getUrlInfo, getAioLogger } = require('./utils');

const FLOODGATE_CONFIG = '/drafts/floodgate/configs/config.json';
const GRAPH_API = 'https://graph.microsoft.com/v1.0';

function getSharepointConfig(config) {
    const sharepointConfig = config.sp.data[0];
    // ${sharepointConfig.site} - MS Graph API Url with site pointers.
    const baseURI = `${sharepointConfig.site}/drive/root:${sharepointConfig.rootFolders}`;
    const fgBaseURI = `${sharepointConfig.site}/drive/root:${sharepointConfig.fgRootFolder}`;
    return {
        ...sharepointConfig,
        clientApp: {
            auth: {
                clientId: sharepointConfig.clientId,
                authority: sharepointConfig.authority,
            },
            cache: { cacheLocation: 'sessionStorage' },
        },
        shareUrl: sharepointConfig.shareurl,
        fgShareUrl: sharepointConfig.fgShareUrl,
        login: { redirectUri: '/tools/loc/spauth' },
        api: {
            url: GRAPH_API,
            file: {
                get: { baseURI, fgBaseURI },
                download: { baseURI: `${sharepointConfig.site}/drive/items` },
                upload: {
                    baseURI,
                    fgBaseURI,
                    method: 'PUT',
                },
                delete: {
                    baseURI,
                    fgBaseURI,
                    method: 'DELETE',
                },
                update: {
                    baseURI,
                    fgBaseURI,
                    method: 'PATCH',
                },
                createUploadSession: {
                    baseURI,
                    fgBaseURI,
                    method: 'POST',
                    payload: { '@microsoft.graph.conflictBehavior': 'replace' },
                },
                copy: {
                    baseURI,
                    fgBaseURI,
                    method: 'POST',
                    payload: { '@microsoft.graph.conflictBehavior': 'replace' },
                },
            },
            directory: {
                create: {
                    baseURI,
                    fgBaseURI,
                    method: 'PATCH',
                    payload: { folder: {} },
                },
            },
            excel: {
                update: {
                    baseURI,
                    fgBaseURI,
                    method: 'POST',
                },
            },
            batch: { uri: `${GRAPH_API}/$batch` },
        },
    };
}

async function fetchConfigJson(configPath) {
    const logger = getAioLogger();
    logger.info('inside fetch config json');
    const configResponse = await fetch(configPath);
    if (!configResponse.ok) {
        logger.error('Config not found');
    }
    return configResponse.json();
}

function getHelixAdminConfig() {
    const logger = getAioLogger();
    logger.info('inside getHelixAdminConfig');
    const adminServerURL = 'https://admin.hlx.page';
    return {
        api: {
            status: { baseURI: `${adminServerURL}/status` },
            preview: { baseURI: `${adminServerURL}/preview` },
        },
    };
}

async function getConfig(adminPageUri) {
    const logger = getAioLogger();
    const urlInfo = getUrlInfo(adminPageUri);
    if (urlInfo.isValid()) {
        const configPath = `${urlInfo.origin}${FLOODGATE_CONFIG}`;
        logger.info(`config path:: ${configPath}`);
        const configJson = await fetchConfigJson(configPath);
        logger.info(JSON.stringify(configJson));
        return {
            sp: getSharepointConfig(configJson),
            admin: getHelixAdminConfig(),
        };
    }
    return undefined;
}

module.exports = {
    getConfig,
};
