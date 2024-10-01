import moment from 'moment/moment';
import { AllData } from '../types';
import { ColumnSelectionState, ResizeMode, SMDataRow } from './types';

export function toIso(excelDateNumber: number | string | undefined): string {
  if (!excelDateNumber) {
    return '';
  }
  if (typeof excelDateNumber === 'string') {
    return excelDateNumber;
  }
  const startDate = new Date(1899, 11, 30); // Excel's base date
  const jsDate = new Date(startDate.getTime() + excelDateNumber * 86400000); // No need to subtract 1
  return moment(jsDate).format('YYYY-MM-DD');
}

export const templateRow = (userId: string): SMDataRow => ({
  userId,
  firstName: '',
  lastName: '',
  entryDate: '',
  prevEmployeeFunction: '',
  officeId: '',
  currency: '',

  newEmployeeFunction: '',

  prevPartTime: 0,
  prevMonthsWorked: 0,

  prevFixed: 0,
  prevBonus: 0,
  prevCarAllowance: 0,
  prevMobileAllowance: 0,
  prevPensionFundPayment: 0,
  prevOther: 0,

  newPartTime: 0,
  newMonthsWorked: 0,

  newFixed: 0,
  newBonus: 0,
  newCarAllowance: 0,
  newMobileAllowance: 0,
  newPensionFundPayment: 0,
  newOther: 0,

  // derived
  prevCompTotal: 0,
  newCompTotal: 0,
  comparePercentage: 0,

  // operational
  version: -1,
  dirty: false,
  userAddress: '',
  rowIndex: -1
});
export const prepareDataRows = ({
  prevYear,
  newYear,
  allData
}: {
  prevYear: number;
  newYear: number;
  allData: AllData[];
}): SMDataRow[] => {
  const perUser: { [key: string]: SMDataRow } = {};
  allData.forEach((data) => {
    const { userId, year } = data;

    if (!perUser[userId]) {
      perUser[userId] = templateRow(userId);
    }

    const smTableRow = perUser[userId];

    smTableRow.firstName = data.firstName;
    smTableRow.lastName = data.lastName;
    smTableRow.officeId = data.officeId || '';
    smTableRow.currency = data.currency || '';
    smTableRow.entryDate = toIso(data.entryDate || smTableRow.entryDate);
    if (year === prevYear) {
      smTableRow.prevPartTime = data.partTime || 0;
      smTableRow.prevMonthsWorked = data.monthsWorked || 0;
      smTableRow.prevEmployeeFunction = data.employeeFunction || '';
      smTableRow.prevFixed = data.fixed || 0;
      smTableRow.prevBonus = data.bonus || 0;
      smTableRow.prevCarAllowance = data.carAllowance || 0;
      smTableRow.prevMobileAllowance = data.mobileAllowance || 0;
      smTableRow.prevPensionFundPayment = data.pensionFundPayment || 0;
      smTableRow.prevOther = data.other || 0;
    }
    if (year === newYear) {
      smTableRow.newPartTime = data.partTime || 0;
      smTableRow.newMonthsWorked = data.monthsWorked || 0;
      smTableRow.newEmployeeFunction = data.employeeFunction || '';
      smTableRow.newFixed = data.fixed || 0;
      smTableRow.newBonus = data.bonus || 0;
      smTableRow.newCarAllowance = data.carAllowance || 0;
      smTableRow.newMobileAllowance = data.mobileAllowance || 0;
      smTableRow.newPensionFundPayment = data.pensionFundPayment || 0;
      smTableRow.newOther = data.other || 0;
    }
  });

  const smTableRows: SMDataRow[] = Object.values(perUser);
  return smTableRows.sort((a, b) => a.userId.localeCompare(b.userId));
};

const resizeModePrefix = '__list_page_resizeMode_';

export const getResizeMode = (key: string): ResizeMode => {
  const k = `${resizeModePrefix}${key}`;
  return (localStorage.getItem(k) as ResizeMode) || 'sizeToFit';
};
export const saveResizeMode = (resizeMode: ResizeMode, key: string) => {
  const k = `${resizeModePrefix}${key}`;
  localStorage.setItem(k, resizeMode);
};

const toggleStatePrefix = '__sm_toggleState_';

export const getToggleState = (key: string): ColumnSelectionState => {
  const k = `${toggleStatePrefix}${key}`;
  const s = localStorage.getItem(k);
  return JSON.parse(s ?? '{}') as ColumnSelectionState;
};

export const saveToggleState = (toggleState: ColumnSelectionState, key: string) => {
  const k = `${toggleStatePrefix}${key}`;
  localStorage.setItem(k, JSON.stringify(toggleState));
};
