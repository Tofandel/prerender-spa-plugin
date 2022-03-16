module.exports = {
  root: true,
  parser: '@babel/eslint-parser',
  // https://github.com/feross/standard/blob/master/RULES.md#javascript-standard-style
  extends: 'standard',
  ignorePatterns: ['examples'],
  // add your custom rules here
  rules: {
    // allow paren-less arrow functions
    'arrow-parens': 0,
    semi: ['error', 'always']
  }
};
