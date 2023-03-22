async function main(params) {
    const project = params.project;
    const projectDetail = params.projectDetail;
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            var result = {
                statusCode: 200,
                body: {
                    payload: floodgateContent(project, projectDetail),
                }
            };
            resolve(result);
        }, 90000);
    });
}

function floodgateContent(project, projectDetail) {
    const response = {};
    response.project = project;
    response.projectDetail = projectDetail;
    return response;
}


// async function floodgateContent(project, projectDetail) {
//     async function copyFilesToFloodgateTree(urlInfo) {
//         const status = { success: false };
//         if (!urlInfo?.doc) return status;

//         try {
//             const srcPath = urlInfo.doc.filePath;
//             let copySuccess = false;
//             if (urlInfo.doc.fg?.sp?.status !== 200) {
//                 const destinationFolder = `${srcPath.substring(0, srcPath.lastIndexOf('/'))}`;
//                 copySuccess = await copyFile(srcPath, destinationFolder, undefined, true);
//             } else {
//                 // Get the source file
//                 const file = await getFile(urlInfo.doc);
//                 if (file) {
//                     const destination = urlInfo.doc.filePath;
//                     if (destination) {
//                         // Save the file in the floodgate destination location
//                         const saveStatus = await saveFile(file, destination, true);
//                         if (saveStatus.success) {
//                             copySuccess = true;
//                         }
//                     }
//                 }
//             }
//             status.success = copySuccess;
//             status.srcPath = srcPath;
//             status.url = urlInfo.doc.url;
//         } catch (error) {
//             // eslint-disable-next-line no-console
//             console.log(`Error occurred when trying to copy files to floodgated content folder ${error.message}`);
//         }
//         return status;
//     }

//     const startCopy = new Date();
//     const copyStatuses = await Promise.all(
//         [...projectDetail.urls].map((valueArray) => copyFilesToFloodgateTree(valueArray[1])),
//     );
//     const endCopy = new Date();

//     const previewStatuses = await Promise.all(
//         copyStatuses
//             .filter((status) => status.success)
//             .map((status) => simulatePreview(handleExtension(status.srcPath), 1, true)),
//     );

//     const failedCopies = copyStatuses.filter((status) => !status.success)
//         .map((status) => status.srcPath || 'Path Info Not available');
//     const failedPreviews = previewStatuses.filter((status) => !status.success)
//         .map((status) => status.path);

//     const excelValues = [['COPY', startCopy, endCopy, failedCopies.join('\n'), failedPreviews.join('\n')]];
//     await updateExcelTable(project.excelPath, 'COPY_STATUS', excelValues);

//     const copyStatus = {};
//     if (failedCopies.length > 0 || failedPreviews.length > 0) {
//         copyStatus.failedCopies = failedCopies;
//         copyStatus.failedPreviews = failedPreviews;
//     }
//     return copyStatus;
// }

exports.main = main;