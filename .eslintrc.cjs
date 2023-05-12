/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution');

module.exports = {
  root: true,
  'extends': [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/eslint-config-typescript',
    '@vue/eslint-config-prettier/skip-formatting',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  'rules': {
    "vue/multi-word-component-names": [0, {
      "ignores": [],
    }],
    "indent": ["error", 2],
    //关闭行末分号提示/报错
    'semi': 2,
    //关闭定义变量未使用提示/报错
    "@typescript-eslint/no-unused-vars": ["error"],
    //在写逗号时，逗号前面不需要加空格，而逗号后面需要添加空格
    "comma-spacing": [
      2,
      {
        "before": false,
        "after": true,
      },
    ],
    //使用=== !== 代替== != .
    "eqeqeq": [
      2,
      "allow-null",
    ],
    "comma-dangle": ["error", {
      "arrays": "always-multiline",
      // 当最后一个元素或属性与闭括号 ] 或 } 在 不同的行时，要求使用拖尾逗号；当在 同一行时，禁止使用拖尾逗号。
      "objects": "always-multiline",
      "imports": "never",
      "exports": "never",
      "functions": "never",
    }],
    // 非空文件的末尾强制执行至少一个换行符（或没有换行符）。
    'eol-last': ["error", "always"],
    'no-multiple-empty-lines': "error",
  },
};
