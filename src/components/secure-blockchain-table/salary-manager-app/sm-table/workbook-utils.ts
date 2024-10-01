import { utils, WorkBook } from 'xlsx';
import { AllData, CurrencyRate, InitialData, Office, OfficeRate, Year } from '../types';
import { errorMessage, infoMessage, StatusMessage } from '../../../../types';
import moment from 'moment';
import { prepareDataRows } from './utils';

export const workbookToInitialData = (wb: WorkBook): InitialData | StatusMessage => {
  // Years
  const wsYears = wb.Sheets['Years'];
  const loadMessages: StatusMessage[] = [];

  const Years: Year[] = utils.sheet_to_json<Year>(wsYears);
  if (Years.length !== 2) {
    return errorMessage('Expected 2 year on Years tab!');
  }
  let prevYear: number;
  let newYear: number;
  if (Years[0].year < Years[1].year) {
    prevYear = Years[0].year;
    newYear = Years[1].year;
  } else {
    prevYear = Years[1].year;
    newYear = Years[0].year;
  }
  loadMessages.push(infoMessage(`Found Years: ${prevYear} -> ${newYear}`));
  // AllData
  const wsAllData = wb.Sheets['AllData'];
  const allData: AllData[] = utils.sheet_to_json<AllData>(wsAllData);

  loadMessages.push(infoMessage(`Found ${allData.length} AllData records.`));

  // CurrencyRate
  const wsCurrencyRate = wb.Sheets['CurrencyRate'];
  const currencyRate: CurrencyRate[] = utils.sheet_to_json<CurrencyRate>(wsCurrencyRate);
  loadMessages.push(infoMessage(`Found ${currencyRate.length} CurrencyRate records.`));

  // Office
  const wsOffice = wb.Sheets['Office'];
  const office: Office[] = utils.sheet_to_json<Office>(wsOffice);
  loadMessages.push(infoMessage(`Found ${office.length} Office records.`));

  // OfficeRate
  const officeRate: OfficeRate[] = [];
  for (const year of [prevYear, newYear]) {
    office.forEach((o) => {
      const cr = currencyRate.find((cr) => cr.year === year && cr.currency === o.currency) || {
        year,
        currency: 'EUR',
        inEuro: 1
      };
      officeRate.push({ ...o, ...cr });
    });
  }
  loadMessages.push(infoMessage(`Number of OfficeRate entries ${officeRate.length}.`));

  return {
    created: moment().format('YYYY-MM-DD'),
    name: `Salary Compare : ${prevYear} -> ${newYear}`,
    description: '',
    prevYear,
    newYear,
    officeRate,
    //allData,
    smTableRows: prepareDataRows({ prevYear, newYear, allData }),
    loadMessages
  };
};
