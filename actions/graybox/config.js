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

class GrayboxConfig {
    gbConfig = {};

    setGrayboxConfig(params) {
        this.gbConfig.fgSite = params.fgSite;
        this.gbConfig.fgClientId = params.fgClientId;
        this.gbConfig.fgAuthority = params.fgAuthority;
        this.gbConfig.destRootFolder = params.destRootFolder;
        this.gbConfig.gbRootFolder = params.gbRootFolder;
        this.gbConfig.projectExcelPath = params.projectExcelPath;
        this.gbConfig.experienceName = params.experienceName;
        this.gbConfig.spToken = params.spToken;
    }

    getGrayboxConfig() {
        return this.gbConfig;
    }

    removePayload() {
        this.gbConfig = {};
    }
}

module.exports = new GrayboxConfig();
