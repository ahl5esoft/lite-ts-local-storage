import { FileFactory } from 'lite-ts-fs';
import { join } from 'path';

const exportReg = /["|'](.*)["|']/;
const importReg = /import.*["|'](.*)["|']/;

// 要过滤的行
const ignoreLine = 'export {};';
// 已解析的文件
const parsedFiles: string[] = [];
const fsFactory = new FileFactory();

/**
 * 解析整个目录，从该目录底下的 index.d.ts 的 export 内容一个一个解析过去
 * 
 * @param dirPath 目录地址
 * @returns 
 */
async function getDirContent(dirPath: string) {
    const path = join(dirPath, 'index.d.ts');
    const indexTsFile = fsFactory.buildFile(path);
    const dirExists = await indexTsFile.exists();
    if (!dirExists || parsedFiles.includes(path))
        return '';

    parsedFiles.push(path);

    const indexTsFileContent = await indexTsFile.readString();
    const exportsArray = indexTsFileContent.split('\n');
    let content = '';
    for (const line of exportsArray) {
        const regRes = line.match(exportReg);
        if (regRes && regRes[1]) {
            const paths = regRes[1].split('/');
            if (!paths[paths.length - 1].endsWith('.d.ts'))
                paths[paths.length - 1] += '.d.ts';

            const filePath = join(dirPath, ...paths);
            if (parsedFiles.includes(filePath))
                continue;

            parsedFiles.push(filePath);

            const file = fsFactory.buildFile(filePath);
            let fileText = await file.readString();
            fileText = await getFileContent(fileText, dirPath);
            content += fileText + '\n';
        } else if (line && line != ignoreLine) {
            content += line + '\n';
        }
    }
    return content;
}

/**
 * 获取文件的内容，如果有 import 那么把指定文件的内容拼接起来
 * 
 * @param fileContent 
 * @param dirPath 
 * @returns 
 */
async function getFileContent(fileContent: string, dirPath: string) {
    const arr = fileContent.split('\n');
    let content = '';
    for (const line of arr) {
        const regRes = line.match(importReg);
        if (regRes && regRes[1]) {
            const paths = regRes[1].split('/');
            const dirExists = await fsFactory.buildDirectory(join(dirPath, ...paths)).exists();
            if (dirExists) {
                content += await getDirContent(join(dirPath, ...paths)) + '\n';
            } else {
                if (!paths[paths.length - 1].endsWith('.d.ts'))
                    paths[paths.length - 1] += '.d.ts';

                const path = join(dirPath, ...paths);
                if (parsedFiles.includes(path))
                    continue;

                const file = fsFactory.buildFile(path);
                const fileExists = await file.exists();
                if (!fileExists) {
                    const regRes = line.match(exportReg);
                    if (regRes?.length) {
                        const exportDir = fsFactory.buildDirectory('node_modules', regRes[1], 'dist');
                        const isEexists = await exportDir.exists();
                        if (!isEexists)
                            console.log(`无法处理 ${line}, 找不到文件: ${file.path}, 已跳过`);

                        content += await getDirContent(join(exportDir.path)) + '\n';
                    } else {
                        console.log(`无法处理 ${line}, 找不到文件: ${file.path}, 已跳过`);
                    }
                    continue;
                }

                parsedFiles.push(path);
                let fileText = await file.readString();
                if (fileText) {
                    fileText = await getFileContent(fileText, dirPath);
                    content += fileText + '\n';
                }
            }
        } else if (line && line != ignoreLine) {
            content += line + '\n';
        }
    }
    return content;
}

(async () => {
    const res = await getDirContent('dist');
    const pkg = await fsFactory.buildFile('package.json').read<{ name: string; }>();

    await fsFactory.buildFile(`${pkg.name}.d.ts`).write(
        res.replace(/export\ /g, '')
            .replace(/moment\.unitOfTime\.StartOf/g, 'string')
    );

    const licenseFile = fsFactory.buildFile(`${pkg.name}.min.js.LICENSE.txt`);
    const exists = await licenseFile.exists();
    if (exists)
        await licenseFile.remove();
})();