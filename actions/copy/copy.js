let openwhisk = require("openwhisk");

// This returns the activation ID of the action that it called
function main(args) {
    let ow = openwhisk();
    return ow.actions.invoke({
        name: 'milo-fg/copy-worker', // the name of the action to invoke
        blocking: false, // this is the flag that instructs to execute the worker asynchronous
        result: false,
        params: args
    });
}

exports.main = main;