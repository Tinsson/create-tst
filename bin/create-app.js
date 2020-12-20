#!/usr/bin/env node

// 引入ESM插件支持ES语法
require = require('esm')(module /*, options*/);
require('../src/cli').cli(process.argv);