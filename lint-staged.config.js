module.exports = {
  "{package.json, yarn.lock}": ["check-yarn-lock"],
  "*.{js,jsx,ts,tsx,json,md}": ["prettier --write"],
};
