const _clone = require("lodash/clone");
const _get = require("lodash/get");
const _reject = require("lodash/reject");
const _uniqBy = require("lodash/uniqBy");
const compareRules = require("./compareRules");

function mergeModule(pLeftModule, pRightModule) {
  return {
    ...pLeftModule,
    ...pRightModule,
    dependencies: _uniqBy(
      pLeftModule.dependencies.concat(pRightModule.dependencies),
      pDependency => pDependency.resolved
    ),
    rules: pLeftModule.rules
      .concat(_get(pRightModule, "rules", []))
      .sort(compareRules),
    valid: pLeftModule.valid && pRightModule.valid,
    consolidated:
      Boolean(pLeftModule.consolidated) || Boolean(pRightModule.consolidated)
  };
}

function mergeModules(pSourceString, pModules) {
  return pModules
    .filter(pModule => pModule.source === pSourceString)
    .reduce(
      (pMergedModule, pCurrentModule) =>
        mergeModule(pMergedModule, pCurrentModule),
      {
        dependencies: [],
        rules: [],
        valid: true
      }
    );
}

module.exports = pModules => {
  let lModules = _clone(pModules);
  let lRetval = [];

  while (lModules.length > 0) {
    lRetval.push(mergeModules(lModules[0].source, lModules));
    lModules = _reject(lModules, { source: lModules[0].source });
  }
  return lRetval;
};
