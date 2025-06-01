// wdio.conf.js
// WebdriverIO v8 configuration for local (selenium‑standalone) execution.
// ドキュメント: https://webdriver.io/docs/wdio-v8-config

/* eslint-disable node/no-unpublished-require */
const path = require('path');

exports.config = {
  ///////////////////////////////////////////////
  // Runner & Framework
  ///////////////////////////////////////////////
  runner: 'local',
  framework: 'mocha',
  specs: [
    path.join(__dirname, './*.spec.js'), // ルート直下の *.spec.js を対象
  ],
  maxInstances: 1, // 並列数（必要に応じて増減）

  ///////////////////////////////////////////////
  // Capabilities
  ///////////////////////////////////////////////
  capabilities: [
    {
      browserName: process.env.WDIO_BROWSER || 'chrome',
      'goog:chromeOptions': {
        // CI 環境ではヘッドレス
        args: process.env.CI
          ? ['--headless', '--disable-gpu', '--window-size=1280,800']
          : ['--window-size=1280,800'],
      },
    },
  ],

  logLevel: 'info',
  baseUrl: process.env.BASE_URL || 'https://hotel.testplanisphere.dev/ja/',
  waitforTimeout: 10000, // 既定タイムアウト (ms)

  ///////////////////////////////////////////////
  // Test Framework options
  ///////////////////////////////////////////////
  mochaOpts: {
    ui: 'bdd',
    timeout: 60000, // 個々の it() のタイムアウト
  },

  ///////////////////////////////////////////////
  // Services & Reporters
  ///////////////////////////////////////////////
  services: [
    [
      'selenium-standalone',
      {
        installArgs: {
          drivers: {
            chrome: { version: 'latest' },
            edge: { version: 'latest' },
          },
        },
        args: {
          drivers: {
            chrome: { version: 'latest' },
            edge: { version: 'latest' },
          },
        },
      },
    ],
  ],

  reporters: [
    'spec',
    [
      'junit',
      {
        outputDir: path.join(__dirname, 'reports'),
        outputFileFormat: (opts) => `results-${opts.cid}.xml`,
      },
    ],
  ],
};
