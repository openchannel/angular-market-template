const fs = require('fs');

function netlifyPlugin() {
    return {
        onPreBuild: ({utils}) => {
            console.log('Custom Openchannel Netlify plugin :');
            if ((String(process.env['ENABLE_PROXY'])) === "true") {
                console.log('Enabled PROXY');
                const fromValue = 'enableProxy: false';
                const toValue = 'enableProxy: true';
                [
                    './src/environments/environment.ts',
                    './src/environments/environment.dev1.ts',
                    './src/environments/environment.stage1.ts',
                    './src/environments/environment.prod.ts'
                ].forEach(filePath => updateFileProperty(utils, filePath, fromValue, toValue));
            } else {
                console.log('Disabled PROXY');
            }
        },
    }
}

function updateFileProperty(utils, filePath, fromValue, toValue) {
    let fileData = ''
    try {
        fileData = fs.readFileSync(filePath).toString();
    } catch (err) {
        utils.build.failBuild(`Can\'t load file : ${filePath} , err: ${err}`);
    }

    const newFileData = fileData.replace(fromValue, toValue);
    try {
        fs.writeFileSync(filePath, newFileData);
    } catch (err) {
        utils.build.failBuild(`Can\'t save file : ${filePath} , err: ${err}`);
    }
}

module.exports = netlifyPlugin;



