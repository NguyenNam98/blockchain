const StoreFile = artifacts.require("StoreFile");

module.exports = function (deployer) {
  deployer.deploy(StoreFile);
};
