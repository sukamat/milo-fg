/*
 * Copyright 2021 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
const { Headers } = require('node-fetch');
const accessToken = 'eyJ0eXAiOiJKV1QiLCJub25jZSI6Ik1yWjU5cU5oNjAxUFZYMzZLS2YwTnhPWm5yY2xHdVFlV1U4Z2tFR2RRUTgiLCJhbGciOiJSUzI1NiIsIng1dCI6Ii1LSTNROW5OUjdiUm9meG1lWm9YcWJIWkdldyIsImtpZCI6Ii1LSTNROW5OUjdiUm9meG1lWm9YcWJIWkdldyJ9.eyJhdWQiOiIwMDAwMDAwMy0wMDAwLTAwMDAtYzAwMC0wMDAwMDAwMDAwMDAiLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC9mYTdiMWI1YS03YjM0LTQzODctOTRhZS1kMmMxNzhkZWNlZTEvIiwiaWF0IjoxNjc5NDQ2NzgxLCJuYmYiOjE2Nzk0NDY3ODEsImV4cCI6MTY3OTQ1MTI4NywiYWNjdCI6MCwiYWNyIjoiMSIsImFpbyI6IkFWUUFxLzhUQUFBQTdyMW9JRDdJSG9CZHNBSFk4VFRITVJ3dFQ0UW1kVEJ5NTl1UmsybURyZUVIQUY5SzV3ZEhGYjg1cWUycE1FOUlJaEs2UVdabGZtcnVHV3JURGVITnl6ZXMyUWZPb3Z1YmpzSFFpZDJrL28wPSIsImFtciI6WyJwd2QiLCJtZmEiXSwiYXBwX2Rpc3BsYXluYW1lIjoiQWRvYmVDb20gVHJhbnNsYXRpb24iLCJhcHBpZCI6IjAwODYyNmFlLWY4MTgtNDNkOC05ZDdmLTI2YWZlMDVlNzcxZCIsImFwcGlkYWNyIjoiMCIsImZhbWlseV9uYW1lIjoiS2FtYXQiLCJnaXZlbl9uYW1lIjoiU3VuaWwiLCJpZHR5cCI6InVzZXIiLCJpcGFkZHIiOiI3My4xNTguMjA1LjE5MiIsIm5hbWUiOiJTdW5pbCBLYW1hdCIsIm9pZCI6Ijc1ODRkMmUzLTEzOWMtNDVlNS1hNGU1LWRkNzNkMjk1YmFhYyIsIm9ucHJlbV9zaWQiOiJTLTEtNS0yMS03NjI5Nzk2MTUtMjAzMTU3NTI5OS05Mjk3MDEwMDAtMjI3OTEwIiwicGxhdGYiOiI1IiwicHVpZCI6IjEwMDNCRkZEODY4OTAwQ0IiLCJyaCI6IjAuQVNZQVdodDctalI3aDBPVXJ0TEJlTjdPNFFNQUFBQUFBQUFBd0FBQUFBQUFBQUFtQU04LiIsInNjcCI6IkZpbGVzLlJlYWRXcml0ZSBvcGVuaWQgcHJvZmlsZSBTaXRlcy5SZWFkV3JpdGUuQWxsIGVtYWlsIiwic2lnbmluX3N0YXRlIjpbImttc2kiXSwic3ViIjoiU3o3VmZPR1F1czRoc2ZLUUk0al9YY0lEQ1VCSWM2WG1FZklzZlJiRGVwayIsInRlbmFudF9yZWdpb25fc2NvcGUiOiJXVyIsInRpZCI6ImZhN2IxYjVhLTdiMzQtNDM4Ny05NGFlLWQyYzE3OGRlY2VlMSIsInVuaXF1ZV9uYW1lIjoic3VrYW1hdEBhZG9iZS5jb20iLCJ1cG4iOiJzdWthbWF0QGFkb2JlLmNvbSIsInV0aSI6IlJrRjZZd2RsYjBPdk8zQXRtS2VMQUEiLCJ2ZXIiOiIxLjAiLCJ3aWRzIjpbImI3OWZiZjRkLTNlZjktNDY4OS04MTQzLTc2YjE5NGU4NTUwOSJdLCJ4bXNfc3QiOnsic3ViIjoieU54TU5xNEJZNUtjZkZMVjBqaDVlTS1vQW9xSXMzSHU1ZDZIRVdsU3pmVSJ9LCJ4bXNfdGNkdCI6MTM2MTgxMjc0NX0.TCe2SbOWLuWEGaNFvRpuKkqaoZm5Y2nwn7TCXiwE6n5lJAXWj3wxalZ6PjQsImsayxE8G7AHogdq8C33QgKHAnodRESNaZB9oV-VwdlvbyamduJApUXLNOkrbEG4Ae6bIGrfmgtcnO2e_8BtXvPWnn6HHp__IinU7035Zl_jeLoG9x-Yvhn_YHBY-S5sjcYE6_DlZY9KfHNc7o19CVqYu-vaMeDCYrzF6laj4-Fb65LPcpTour2BgO5tr0N0CcPvpPfSo1SXuyAotdQmz6FB-58cAKePSfI-VYiNu56DxsRLv4-syVkaZUhYaVua7CitfdotWpwK8_CjLjcnQGCHMQ';
const BATCH_REQUEST_LIMIT = 20;


const getAccessToken = () => accessToken;

async function connect() {
    return accessToken;
}

function validateConnection() {
    if (!accessToken) {
        throw new Error('You need to sign-in first');
    }
}

function getAuthorizedRequestOption({ body = null, json = true, method = 'GET' } = {}, logger) {
    validateConnection();
    const bearer = `Bearer ${accessToken}`;
    const headers = new Headers();
    headers.append('Authorization', bearer);
    if (json) {
        headers.append('Accept', 'application/json');
        headers.append('Content-Type', 'application/json');
    }

    const options = {
        method,
        headers,
    };

    if (body) {
        options.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    return options;
}

module.exports = {
    connect,
    getAccessToken,
    getAuthorizedRequestOption,
    validateConnection,
};
