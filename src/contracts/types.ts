export type ConstructorArgDef = { name: string };
export type DeploymentPlan = {
  label: string;
  contractName: string;
  defaultRegistryName: string;
  contractType: string;
  contractABI: string;
  contractBytecode: string;
  contractSourceCode?: string;
  constructorArgDefs: ConstructorArgDef[];
};
