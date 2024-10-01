import { Stack } from '@mui/material';
import { useCallback, useMemo, useState } from 'react';
import { CellEditRequestEvent, ColDef, GetRowIdParams, ValueFormatterParams } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-theme-quartz.css'; // import Quartz theme
import 'ag-grid-community/styles/ag-grid.css';
import { RowValueChangedEvent } from 'ag-grid-community/dist/types/core/events';

export function AGGridTestTable() {
  //
  // ({
  //   editable,
  //   dataDefinition,
  //   initialData,
  //   dataRowEntris
  // }: {
  //   editable: boolean;
  //   dataDefinition: string;
  //   initialData: string;
  //   dataRowEntris: DataRowEntry[][];
  // })

  return (
    <Stack>
      <Stack>AG Grid Test Table</Stack>
      <Stack>
        <GridExample />
      </Stack>
    </Stack>
  );
}

// Row Data Interface
interface IRow {
  id: number;
  mission: string;
  company: string;
  location: string;
  date0: string;
  time: string;
  rocket: string;
  price: number;
  age: number;
  successful: boolean;
}

const rowData0: IRow[] = [
  {
    id: 1,
    mission: 'CRS SpX-25',
    company: 'SpaceX',
    location: 'LC-39A, Kennedy Space Center, Florida, USA',
    date0: '2022-07-15',
    time: '0:44:00',
    rocket: 'Falcon 9 Block 5',
    price: 12480000,
    age: 12480000,
    successful: true
  },
  {
    id: 2,
    mission: 'SDe',
    company: 'Hubli',
    location: 'Sronyki',
    date0: '2001-07-15',
    time: '0:44:00',
    rocket: 'SParrow',
    price: 12480000,
    age: 33,
    successful: true
  }
];
// Create new GridExample component
const GridExample = () => {
  // Row Data: The data to be displayed.
  const [rowData, setRowData] = useState<IRow[]>(rowData0);
  // Column Definitions: Defines & controls grid columns.
  const [colDefs] = useState<ColDef[]>([
    {
      field: 'age'
    },
    {
      field: 'mission',
      filter: true
    },
    {
      field: 'company',
      cellRenderer: 'CompanyLogoRenderer'
    },
    {
      field: 'location'
    },
    { field: 'date0' },
    {
      field: 'price',
      valueFormatter: (params: ValueFormatterParams) => {
        return '£' + params.value.toLocaleString();
      }
    },
    { field: 'successful' },
    { field: 'rocket' }
  ]);

  const getRowId = useCallback((params: GetRowIdParams<IRow>) => params.data.id.toString(), []);

  // Apply settings across all columns
  const defaultColDef = useMemo<ColDef>(() => {
    return {
      filter: true,
      editable: true
    };
  }, []);

  return (
    <div className={`ag-theme-quartz`} style={{ width: '100%', height: '10em' }}>
      <AgGridReact
        rowData={rowData}
        columnDefs={colDefs}
        defaultColDef={defaultColDef}
        pagination={true}
        onCellValueChanged={({ value, rowIndex, data }) =>
          alert(`New Cell Value: ${value} ${rowIndex} ${JSON.stringify(data)}`)
        }
        onRowValueChanged={({ data }: RowValueChangedEvent<IRow>) => {
          alert(JSON.stringify(data));
        }}
        getRowId={getRowId}
        readOnlyEdit={true}
        onCellEditRequest={({ data, rowIndex, colDef: { field }, newValue }: CellEditRequestEvent<IRow>) => {
          const newRowData = [...rowData];
          if (field && typeof rowIndex === 'number') {
            newRowData[rowIndex] = { ...data, [field]: newValue };
            setRowData(newRowData);
          }
        }}
      />
    </div>
  );
};
