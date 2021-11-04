module.exports = {
  "package.json": ["sort-package-json", "check-yarn-lock"],
  "yarn.lock": ["check-yarn-lock"],
  "*.{js,ts,json,md}": ["prettier --write"],
};
