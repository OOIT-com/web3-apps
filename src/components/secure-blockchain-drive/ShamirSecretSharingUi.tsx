import { CollapsiblePanel } from '../common/CollapsiblePanel';
import { AttributeTableUi } from '../../ui-factory/AttributeTableUi';
import * as React from 'react';
import { useState } from 'react';
import { AttributeDef, PRecord } from '../../ui-factory/types';
import { ButtonPanel } from '../common/ButtonPanel';
import { Button } from '@mui/material';
import { combine, split } from 'shamir-secret-sharing';
import { errorMessage } from '../../utils/status-message';
import { StatusMessageElement } from '../common/StatusMessageElement';
import { noop } from '../../ui-factory/utils';

type NAMES =
  | 'shares'
  | 'threshold'
  | 'secret'
  | 'typeOfSecret'
  | 'partialKeys'
  | 'recreatedSecret'
  | 'givenPartialKeys'
  | 'title1'
  | 'title2'
  | 'createActionButtons'
  | 'recreateActionButtons'
  | 'statusMessageStr';
const initialValues: PRecord<NAMES> = {
  shares: 5,
  threshold: 3,
  secret: '',
  typeOfSecret: 0,
  partialKeys: '',
  givenPartialKeys: '',
  recreatedSecret: '',
  title1: '',
  title2: '',
  createActionButtons: 0,
  recreateActionButtons: 0,
  statusMessageStr: ''
};

const attributeDefs: AttributeDef<NAMES>[] = [
  {
    name: 'statusMessageStr',
    uiType: ({ cx = {}, action = noop }) => {
      return (
        <StatusMessageElement
          statusMessage={cx.statusMessageStr ? JSON.parse(cx.statusMessageStr.toString()) : undefined}
          onClose={() => action({ ...cx, statusMessageStr: '' })}
        />
      );
    }
  },
  { name: 'shares', label: 'Number of Members', uiTypeOptions: { dataType: 'number' } },
  { name: 'threshold', label: 'Threshold', uiTypeOptions: { dataType: 'number' } },
  { name: 'secret', label: 'The Secret Text' },
  { name: 'typeOfSecret', visible: true },

  {
    name: 'createActionButtons',
    noLabel: true,
    uiType: ({ cx, action }) => {
      return (
        <ButtonPanel>
          <Button
            key={'create-partial-keys'}
            variant={'outlined'}
            onClick={async () => {
              if (cx && action) {
                const shares = +cx.shares.toString();
                const threshold = +cx.threshold.toString();
                //const typeOfSecret = data.typeOfSecret.toString();
                const secret = cx.secret.toString();

                if (secret && threshold && shares) {
                  const r = await split(new Uint8Array(Buffer.from(secret, 'utf8')), shares, threshold);
                  const p = r.map((part) => Buffer.from(part).toString('base64')).join('\n');
                  action({ ...cx, partialKeys: p });
                }
              }
            }}
          >
            Create Partial Keys
          </Button>
        </ButtonPanel>
      );
    }
  },

  { name: 'partialKeys', label: 'Created Partial Keys', multiline: true, editable: false },

  { name: 'givenPartialKeys', label: 'Given Partial Keys', multiline: true },
  {
    name: 'recreateActionButtons',
    uiType: ({ cx, action }) => (
      <ButtonPanel>
        <Button
          key={'combine'}
          variant={'outlined'}
          disabled={!cx?.givenPartialKeys}
          onClick={async () => {
            if (cx && action) {
              const givenPartialKeys = cx.givenPartialKeys.toString();
              if (givenPartialKeys) {
                try {
                  const b64Arr = givenPartialKeys
                    .split(/\s+/)
                    .map((e) => e.trim())
                    .filter((e) => !!e);
                  const uint8Arr = b64Arr.map((b64) => new Uint8Array(Buffer.from(b64, 'base64')));
                  const recreatedSecretUint = await combine(uint8Arr);
                  const recreatedSecret = Buffer.from(recreatedSecretUint).toString('utf8');
                  action({ ...cx, recreatedSecret });
                } catch (e) {
                  action({
                    ...cx,
                    recreatedSecret: '',
                    statusMessageStr: JSON.stringify(errorMessage('Combine failed', e))
                  });
                }
              }
            }
          }}
        >
          Re-Create Secret
        </Button>
      </ButtonPanel>
    )
  },
  { name: 'recreatedSecret', label: 'Recreated Secret', editable: false }
];

export const ShamirSecretSharingUi = () => {
  const [data, setData] = useState<PRecord<NAMES>>(initialValues);

  return (
    <CollapsiblePanel collapsible={false} title={'Shamir Secret Sharing Ui'}>
      <AttributeTableUi attributeDefs={attributeDefs} data={data || {}} setData={setData} />
    </CollapsiblePanel>
  );
};
