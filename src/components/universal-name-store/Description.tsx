import { CollapsiblePanel } from '../common/CollapsiblePanel';
import * as React from 'react';
import { FC } from 'react';
import ReactMarkdown from 'react-markdown';

export const Description: FC = () => {
  return (
    <CollapsiblePanel
      collapsible={true}
      collapsed={true}
      title={'Description'}
      content={
        <ReactMarkdown>{`
Here you can save a name for your address or a name for a contract address in the Universal Name Store. The address will be seen by everybody who likes to 
resolve your address with the name.

__Important__: Registration of an address requires a fee. The fee is around 1$ on Polygon and Fantom. 10$ on Ethereum.
Every payable action will be prompted before the transaction occurres.

The name accepts only CAPITAL LETTER and dashes or dots for separating word parts:

- OOIT.COM __Ok__
- MY-NAME-1234 __Ok__
- MY_Name-1234 __Not ok__, contains underscore and lower case letters *
- -MY-1234! __Not ok__, starts with a dash and contains punctuations such as '!' and '?'*


Once you have registered the name you can add further key/value pairs.

- phone: 098765789
- my.vacation.address: Scenic Way 123

key/value pairs have no letter restrictions.

You can:

- *save*: Save a name for your address (EOA) or a contract address
- *remove*: Remove your name from the blockchain.
- *find name*: Read the name of a given address from the blockchain.
- *find address*: Read the address from a given name - if it is taken.

## 
    
`}</ReactMarkdown>
      }
    />
  );
};
