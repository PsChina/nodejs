const fs = require('fs');
const path = require('path');
const readline = require('readline');

// 启用按键事件流 ‌:ml-citation{ref="1,2" data="citationList"}
readline.emitKeypressEvents(process.stdin);
if (typeof process.stdin.setRawMode === 'function') {
  process.stdin.setRawMode(true);
}

// 初始化界面参数
let selectedIndex = 0;
let directories = [];
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// 主逻辑
function selectDir(dirPath = '.', callback) {
  getDirectories(dirPath, (dirs) => {
    directories = dirs;
    renderMenu();
    setupKeyListeners(callback);
  });
}

// 获取当前目录下的文件夹列表 ‌:ml-citation{ref="4" data="citationList"}
function getDirectories(dirPath, callback) {
  fs.readdir(dirPath, (err, files) => {
    if (err) return [];
    const dirs = files.filter((file) => {
      try {
        return fs.statSync(path.resolve(dirPath, file)).isDirectory();
      } catch {
        return false;
      }
    });
    callback(dirs);
  });
}

// 渲染交互式菜单 ‌:ml-citation{ref="2,3" data="citationList"}
function renderMenu() {
  process.stdout.write('\x1B[2J\x1B[0f'); // 清屏
  directories.forEach((dir, i) => {
    process.stdout.write(i === selectedIndex ? `> ${dir}\n` : `  ${dir}\n`);
  });
  process.stdout.write('\n上下键选择文件夹，回车确认');
}

// 按键监听逻辑 ‌:ml-citation{ref="1,2" data="citationList"}
function setupKeyListeners(callback = () => null) {
  const onKeyPress = (str, key) => {
    if (key.name === 'up') {
      selectedIndex = Math.max(0, selectedIndex - 1);
      renderMenu();
    } else if (key.name === 'down') {
      selectedIndex = Math.min(directories.length - 1, selectedIndex + 1);
      renderMenu();
    } else if (key.name === 'return') {
      process.stdin.removeListener('keypress', onKeyPress); // 移除监听
      process.stdin.setRawMode(false);
      rl.close();
      callback(directories[selectedIndex]);
    }
  };
  process.stdin.on('keypress', onKeyPress);
}

function merge(file1, fille2) {
  try {
    if (fs.existsSync(fille2) && fs.existsSync(file1)) {
      const packageJson1 = JSON.parse(fs.readFileSync(file1, 'utf8'));
      const packageJson2 = JSON.parse(fs.readFileSync(fille2, 'utf8'));
      // 只合并 dependencies 和 devDependencies 字段
      Object.assign(packageJson2.dependencies, packageJson1.dependencies);
      Object.assign(packageJson2.devDependencies, packageJson1.devDependencies);
      if (fs.existsSync(fille2)) {
        fs.unlinkSync(fille2); // 删除文件
      }
      // 默认覆盖写入如果不存在就创建 (一定不存在)
      fs.writeFileSync(fille2, JSON.stringify(packageJson2, null, 2));
    }
  } catch (e) {
    console.log(e);
  }
}

function findSingleSubdir(parentPath) {
  try {
    // 标准化输入路径‌:ml-citation{ref="3" data="citationList"}
    const resolvedPath = path.resolve(parentPath);

    // 验证父路径是否存在且为目录‌:ml-citation{ref="2" data="citationList"}
    if (!fs.existsSync(resolvedPath)) throw new Error('父路径不存在');
    const parentStats = fs.statSync(resolvedPath);
    if (!parentStats.isDirectory()) throw new Error('目标路径不是文件夹');

    // 读取目录内容‌:ml-citation{ref="1" data="citationList"}
    const items = fs.readdirSync(resolvedPath, { withFileTypes: true });
    const subdir = items.find((item) => item.isDirectory());

    if (!subdir) throw new Error('该文件夹内无子文件夹');
    return path.join(resolvedPath, subdir.name); // 返回完整路径‌:ml-citation{ref="3" data="citationList"}
  } catch (err) {
    console.error('❌ 操作失败:', err.message);
    return null;
  }
}
exports.findSingleSubdir = findSingleSubdir;

exports.merge = merge;

exports.selectDir = selectDir;
