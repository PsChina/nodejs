const fs = require('fs');
const path = require('path');
const { selectDir, merge, findSingleSubdir } = require('./tools');

// 一个文件夹就默认启动
// 多个文件夹就让用户选择

function countFolders(directory) {
  let folderCount = 0;
  const files = fs.readdirSync(directory);
  files.forEach((file) => {
    const filePath = path.join(directory, file);
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      folderCount++;
      // countFolders(filePath); // 递归统计子文件夹
    }
  });
  return folderCount;
}

const projectPath = path.resolve(__dirname, '../../main/project');

const count = countFolders(projectPath);

const outPutFile = path.resolve(__dirname, '../../package.json');

function main() {
  if (count === 1) {
    // 默认启动文件夹
    const currentProjectPath = findSingleSubdir(projectPath);
    // 项目文件夹下的 config/package.json 文件路径
    const filePath = path.resolve(
      projectPath,
      `${currentProjectPath}/config/package.json`,
    );
    // 拷贝项目中的 package.json 到 package.json 并覆盖
    doMergeFile(filePath, outPutFile);
    process.exit(0);
  } else if (count > 1) {
    // 让用户选择文件夹
    selectDir(projectPath, (selectedDir) => {
      console.log('Selected directory:', selectedDir);
      // 项目文件夹下的 config/package.json 文件路径
      const filePath = path.resolve(
        projectPath,
        `${selectedDir}/config/package.json`,
      );
      // 拷贝项目中的 package.json 到 package.json 并覆盖
      doMergeFile(filePath, outPutFile);
      process.exit(0);
    });
  }
}

function doMergeFile(filePath, outPutFile) {
  merge(filePath, outPutFile);
}

main();
