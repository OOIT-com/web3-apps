import { StatusMessage, Web3Session } from '../types';

export type ConstructorArgDef = { name: string };

export type DeploymentPlan = {
  label: string;
  contractName: string;
  defaultRegistryName: string;
  contractType: string;
  contractSourceCode?: string;
} & (DeploymentPlanAbi | DeploymentPlanFun);

export type DeploymentPlanAbi = {
  contractABI: string;
  contractBytecode: string;
  constructorArgDefs: ConstructorArgDef[];
};

export type DeploymentFunction = (web3Session: Web3Session) => Promise<string | StatusMessage>;

export type DeploymentPlanFun = {
  deploymentFunction: DeploymentFunction;
};
