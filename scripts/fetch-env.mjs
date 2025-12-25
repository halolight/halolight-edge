#!/usr/bin/env node

/**
 * 从数据字典 API 获取环境变量并写入 GitHub Actions 环境
 *
 * 使用方式:
 *   node scripts/fetch-env.mjs
 *
 * 环境变量:
 *   ENV_API_URL - API 地址 (如: https://action.h7ml.cn/api/data-dictionary/xxx)
 *   ENV_API_TOKEN - API Token (如: hlt_xxx)
 */

import { appendFileSync, writeFileSync } from 'fs';

const API_URL = process.env.ENV_API_URL;
const API_TOKEN = process.env.ENV_API_TOKEN;
const GITHUB_ENV = process.env.GITHUB_ENV;

async function main() {
  if (!API_URL || !API_TOKEN) {
    console.error('❌ 缺少环境变量: ENV_API_URL 或 ENV_API_TOKEN');
    process.exit(1);
  }

  console.log('📡 正在从 API 获取环境配置...');
  console.log(`   URL: ${API_URL}`);

  try {
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.success || !result.data?.value) {
      throw new Error('API 返回数据格式错误');
    }

    // 解析 value (可能是 JSON 字符串或对象)
    let envConfig;
    if (typeof result.data.value === 'string') {
      envConfig = JSON.parse(result.data.value);
    } else {
      envConfig = result.data.value;
    }

    // 过滤出 VITE_ 开头的变量 (前端构建需要的)
    const viteEnvs = Object.entries(envConfig)
      .filter(([key]) => key.startsWith('VITE_'))
      .reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {});

    console.log(`✅ 获取到 ${Object.keys(envConfig).length} 个变量`);
    console.log(`   其中 VITE_* 变量: ${Object.keys(viteEnvs).length} 个`);

    // 写入 GitHub Actions 环境
    if (GITHUB_ENV) {
      console.log('📝 写入 GitHub Actions 环境...');

      for (const [key, value] of Object.entries(viteEnvs)) {
        // 处理多行值
        if (value.includes('\n')) {
          appendFileSync(GITHUB_ENV, `${key}<<EOF\n${value}\nEOF\n`);
        } else {
          appendFileSync(GITHUB_ENV, `${key}=${value}\n`);
        }
        console.log(`   ✓ ${key}`);
      }

      console.log('✅ 环境变量已写入 GITHUB_ENV');
    } else {
      // 本地测试: 输出到 .env.local
      console.log('📝 本地模式: 写入 .env.local...');

      const envContent = Object.entries(viteEnvs)
        .map(([key, value]) => {
          const escaped = value.replace(/\n/g, '\\n');
          return `${key}="${escaped}"`;
        })
        .join('\n');

      writeFileSync('.env.local', envContent);
      console.log('✅ 已写入 .env.local');
    }

    // 输出摘要
    console.log('\n📋 环境变量摘要:');
    for (const key of Object.keys(viteEnvs)) {
      console.log(`   - ${key}`);
    }

  } catch (error) {
    console.error('❌ 获取环境配置失败:', error.message);
    process.exit(1);
  }
}

main();
