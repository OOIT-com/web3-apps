import { SMDataRow } from './sm-table/types';
import { PRecord } from '../../../ui-factory/types';
import {StatusMessage} from "../../../utils/status-message";

export interface Year {
  year: number;
}

export interface AllData extends UserData, WorkYearUser, Compensation {
  year: number;
}

export interface UserData {
  firstName: string;
  lastName: string;
  userId: string;
}

export interface WorkYearUser {
  entryDate?: string | number;
  partTime: number;
  monthsWorked: number;
  employeeFunction: string;
  officeId: string;
}

export interface Compensation {
  fixed: number;
  bonus: number;
  carAllowance: number;
  mobileAllowance: number;
  pensionFundPayment: number;
  other: number;
  currency: string;
}

export interface Office {
  officeId: string;
  officeName: string;
  currency: string;
}

export interface CurrencyRate {
  year: number;
  currency: string;
  inEuro: number;
}

export interface OfficeRate extends Office, CurrencyRate {}

export interface YearData {
  year: string;
  userDataList: UserData[];
  compensationEuroList: Compensation[];
  officeList: Office[];
  currencyRates: CurrencyRate[];
}

export interface SalaryManager {
  preYear: YearData;
  newYear: YearData;
}

// excel -> readonly data ->

export interface SMInitialData {
  created: string;
  name: string;
  description: string;
  prevYear: number;
  newYear: number;
  officeRate: OfficeRate[];
  smTableRows: SMDataRow[];
  loadMessages?: StatusMessage[];
}

export interface GenInitialData {
  created: string;
  name: string;
  description: string;
  smTableRows: PRecord[];
  loadMessages?: StatusMessage[];
}
