const fs = require('fs');
const path = require('path');
const rollup = require('rollup');
const version = require('../package.json').version;
const babel = require('rollup-plugin-babel');
const uglify = require('uglify-js');
const zlib = require('zlib');

const banner = '/*!\n' +
  ' * md5js v' + version + '\n' +
  ' * (c) 2017-' + new Date().getFullYear() + ' penyuying\n' +
  ' * Released under the MIT License.\n' +
  ' */';

if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist');
}
const builds = [{
    input: resolve('src/md5.js'),
    format: 'umd',
    name: 'md5',
    output: {
        name: 'md5',
        file: resolve('dist/md5.js')
    },
    plugins: [
      babel({
        exclude: 'node_modules/**' // only transpile our source code
      })
    ],
    banner
}, {
    input: resolve('src/md5.js'),
    format: 'umd',
    name: 'md5',
    output: {
        name: 'md5',
        file: resolve('dist/md5.min.js')
    },
    plugins: [
      babel({
        exclude: 'node_modules/**' // only transpile our source code
      })
    ],
    banner
}];

const tell = function* (configs) {
    let i = 0;
    const total = configs.length;

    while (i < total) {
        yield configs[i];
        i++;
    }
};

build(tell(builds));

/**
 * 生成文件
 * 
 * @param {any} configTell Generator对象
 */
function build(configTell) {
    let _config = configTell.next();
    let config = _config.value;
    if (!_config.done) {
        buildEntry(config).then(() => {
                build(configTell);
        }).catch(logError);
    }
}

/**
 * 绝对路径
 * 
 * @param {any} p 路径名称
 * @returns {String}
 */
function resolve(p) {
    return path.resolve(__dirname, '../', p);
}

/**
 * build文件
 * 
 * @param {Object} config build配置
 * @returns {Promise}
 */
function buildEntry(config) {
    let dest = config.output.file;
    const isProd = /min\.js$/.test(dest);
    return rollup.rollup(config).then((bundle) => {
      const _generate = bundle.generate(config);
      _generate.then(data => {
          let code = data.code;
        if (isProd) {
            var minified = (config.banner ? config.banner + '\n' : '') + uglify.minify(code, {
                output: {
                  ascii_only: true
                },
                compress: {
                  pure_funcs: ['makeMap']
                }
              }).code;
            return write(dest, minified, true);
          } else {
            return write(dest, code);
          }
      });
    }).catch(logError);
}
/**
 * 写入文件
 * 
 * @param {any} dest 存放目录
 * @param {any} code 文件内容
 * @param {any} zip 是否gzip压缩
 * @returns {Promise}
 */
function write(dest, code, zip) {
    return new Promise((resolve, reject) => {
      var report = (extra) => {
        console.log(green(path.relative(process.cwd(), dest)) + ' ' + getSize(code) + (extra || ''));
        resolve();
      };

      fs.writeFile(dest, code, (err) => {
        if (err) {
          return reject(err);
        }
        if (zip) {
          zlib.gzip(code, (err, zipped) => {
            if (err) return reject(err);
            report(' (gzipped: ' + getSize(zipped) + ')');
          });
        } else {
          report();
        }
      });
    });
  }
/**
 * 获取文件大小
 * 
 * @param {any} code 文件内容
 * @returns {String}
 */
function getSize(code) {
    return (code.length / 1024).toFixed(2) + 'kb';
}

/**
 * 字符绿色显示
 * 
 * @param {String} str 字符串
 * @returns {String}
 */
function green(str) {
    return '\x1b[1m\x1b[32m' + str + '\x1b[39m\x1b[22m';
}

/**
 * 打印错误日志
 *
 * @param {any} e 错误对象
 */
function logError(e) {
    console.log(e);
}