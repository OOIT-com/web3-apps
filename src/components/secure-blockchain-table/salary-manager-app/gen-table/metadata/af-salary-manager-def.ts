import { GenTableDef } from '../gen-types';

export const afSalaryManagerDef: GenTableDef = {
  name: 'SM_2005',
  selectionGroups: [],
  sumRows: [],
  idName: 'userId',
  attributes: [
    {
      name: 'userId',
      type: 'string',
      editable: false,
      visible: false
    },
    {
      name: 'firstName',
      type: 'string',
      editable: false
    },
    {
      name: 'lastName',
      type: 'string',
      editable: false
    },
    {
      name: 'entryDate',
      type: 'number',
      editable: false
    },
    {
      name: 'officeId',
      type: 'string',
      editable: false
    },
    {
      name: 'currency',
      type: 'string',
      editable: false
    },
    {
      name: 'prevEmployeeFunction',
      type: 'number',
      editable: false
    },
    {
      name: 'prevPartTime',
      type: 'number',
      editable: false,
      selectionGroups: ['prevWork']
    },
    {
      name: 'prevMonthsWorked',
      type: 'number',
      editable: false,
      selectionGroups: ['prevWork']
    },
    {
      name: 'prevEmployeeFunction',
      type: 'number',
      editable: false,
      selectionGroups: ['prevWork']
    },
    {
      name: 'newPartTime',
      type: 'number',
      selectionGroups: ['newWork']
    },
    {
      name: 'newMonthsWorked',
      type: 'number',
      selectionGroups: ['newWork']
    },
    {
      name: 'newEmployeeFunction',
      type: 'string',
      selectionGroups: ['newWork']
    },
    {
      name: 'prevFixed',
      type: 'number',
      selectionGroups: ['prevComp']
    },
    {
      name: 'prevBonus',
      type: 'number',
      editable: false,
      selectionGroups: ['prevComp']
    },
    {
      name: 'prevCarAllowance',
      type: 'number',
      editable: false,
      selectionGroups: ['prevComp']
    },
    {
      name: 'prevMobileAllowance',
      type: 'number',
      editable: false,
      selectionGroups: ['prevComp']
    },
    {
      name: 'prevPensionFundPayment',
      type: 'number',
      editable: false,
      selectionGroups: ['prevComp']
    },
    {
      name: 'prevOther',
      type: 'number',
      editable: false,
      selectionGroups: ['prevComp']
    },
    {
      name: 'newFixed',
      type: 'number',
      selectionGroups: ['newComp']
    },
    {
      name: 'newBonus',
      type: 'number',
      selectionGroups: ['newComp']
    },
    {
      type: 'number',
      name: 'newCarAllowance',
      selectionGroups: ['newComp']
    },
    {
      name: 'newMobileAllowance',
      type: 'number',
      selectionGroups: ['newComp']
    },
    {
      name: 'newPensionFundPayment',
      type: 'number',
      selectionGroups: ['newComp']
    },
    {
      name: 'newOther',
      type: 'number',
      selectionGroups: ['newComp']
    },
    {
      name: 'prevCompTotal',
      type: 'number',
      selectionGroups: ['summaries']
    },
    {
      name: 'newCompTotal',
      type: 'number',
      selectionGroups: ['summaries']
    },
    {
      name: 'comparePercentage',
      type: 'number',
      formatter: 'percentage',
      sumRow: 'average',
      selectionGroups: ['summaries']
    }
  ]
};