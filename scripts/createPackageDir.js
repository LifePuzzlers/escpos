const path = require('path');
const fse = require('fs-extra');

const files = [
    'README.md',
    'LICENSE',
];

Promise.all(files.map(file => copyFile(file)))
    .then(() => createPackageFile())
    .then(()=>{
        const srcDir = path.resolve(__dirname,'../src/');
        const destDir = path.resolve(__dirname,'../dist/');

        console.log(`Start copying compiled files form ${srcDir} to ${destDir}...`)
        // To copy a folder or file
        fse.copySync(srcDir, destDir,{ recursive: true }, function (err) {
            if (err) {
                console.error(err);
            } else {
                console.log("copying success!");
            }
        });
    });

async function copyFile(file) {
    const buildPath = resolveBuildPath(file);
    await new Promise(resolve => {
        fse.copy(file, buildPath, (err) => {
            if (err)
                throw err;
            resolve();
        });
    });
    return console.log(`Copied ${file} to ${buildPath}`);
}

function resolveBuildPath(file) {
    return path.resolve(__dirname, '../dist/', path.basename(file));
}

async function createPackageFile() {
    const data = await new Promise((resolve) => {
        fse.readFile(path.resolve(__dirname, '../package.json'), 'utf8', (err, data) => {
            if (err)
                throw err;
            resolve(data);
        });
    });
    let packageData = JSON.parse(data);
    const { 
        author,
        name,
        version,
        description,
        keywords,
        repository,
        license,
        bugs,
        homepage,
        peerDependencies,
        dependencies,
    } = packageData;

    const minimalPackage = {
        name,
        author,
        version,
        description,
        main: './index.js',
        types: './index.d.ts',
        keywords,
        repository,
        license,
        bugs,
        homepage,
        peerDependencies,
        dependencies,
    };
    return new Promise((resolve) => {
        const buildPath = path.resolve(__dirname, '../dist/package.json');
        const data_1 = JSON.stringify(minimalPackage, null, 2);
        fse.writeFile(buildPath, data_1, (err) => {
            if (err)
                throw (err);
            console.log(`Created package.json in ${buildPath}`);
            resolve();
        });
    });
}