module.exports = {
  "{package.json, yarn.lock}": ["check-yarn-lock"],
  "*.{js,ts,json,md}": ["prettier --write"],
};
