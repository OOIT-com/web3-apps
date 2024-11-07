import SecretVaultUi from '../secret-vault/SecretVaultUi';
import { PublicKeyStoreUi } from '../public-key-store/PublicKeyStoreUi';
import { JSX, ReactNode } from 'react';
import { About } from '../about/About';
import { ToolsUi } from '../tools/ToolsUi';
import { UniqueNameStoreUi } from '../unique-name-store/UniqueNameStoreUi';
import { ArtworkUi } from '../artwork/ArtworkUi';
import { SharedSecretStoreUi } from '../shared-secret-store/SharedSecretStoreUi';
import { ContractRegistryUi } from '../contract-registry/ContractRegistryUi';
import { PublicKeyStoreV2Ui } from '../public-key-store-v2/PublicKeyStoreV2Ui';
import keyBlock from '../images/secret-vault.png';
import privateMessageStorePng from '../images/private-message-store.png';

import artworkPng from '../images/artwork.png';
import salaryManager from '../images/salary-manager.png';
import sharedKey from '../images/shared-key.png';
import publicKey from '../images/public-key.png';
import keyPairStorePng from '../images/key-pair-store.png';
import addressBook from '../images/address-book.png';
import thisIsMe from '../images/my-name.png';
import universalNameStorePng from '../images/universal-name-store.png';
import contractRegistryPng from '../images/contract-registry.png';
import toolsPng from '../images/tools.png';
import paymentsPng from '../images/payments.png';
import aboutPng from '../images/about.png';
import { SecureBlockchainTableUi } from '../secure-blockchain-table/SecureBlockchainTableUi';
import { UniversalNameStoreUi } from '../universal-name-store/UniversalNameStoreUi';
import { UiGallery } from '../ui-gallery/UiGallery';
import { AddressBookUi } from '../address-book/AddressBookUi';
import { PrivateMessageStoreV2Ui } from '../private-message-store-v2/PrivateMessageStoreV2Ui';
import { AppIcon } from '../common/AppIcon';
import { PaymentsUi } from '../payments/PaymentsUi';

const visibleApps: string[] = (process.env.REACT_APP_VISIBLE_APPS ?? '').split(/\s*,\s*/).filter((e) => !!e);

export type MenuEntry = {
  path: string;
  name: string;
  icon?: ReactNode;
  description: string;
  element: JSX.Element;
  hidden?: boolean;
};
export type MenuColumn = { name: string; description: string; entries: MenuEntry[] };
const menuColumnsAll: MenuColumn[] = [
  {
    name: ' User DApps',
    description: '',
    entries: [
      {
        path: 'secret-vault',
        name: 'My Secret Vault',
        icon: <AppIcon src={keyBlock} alt={'secret-vault'} />,
        description: 'Save your secrets, password etc. in a safe and secure way.',
        element: <SecretVaultUi />
      },
      {
        path: 'private-message-store',
        name: 'Private Messages Store',
        icon: <AppIcon src={privateMessageStorePng} alt={'secret messages'} />,
        description:
          'A save and secure message application. 100% based on Blockchain and SALSA20 encryption (NaCl). Before you can get messages make sure you have registered a public key (Public Key Store)',
        element: <PrivateMessageStoreV2Ui />
      },
      {
        path: 'artwork',
        name: 'Artwork',
        icon: <AppIcon src={artworkPng} alt={'Art Work'} />,
        description: 'Encrypt and create an artwork with a time proof and author proof.',
        element: <ArtworkUi />
      },
      {
        path: 'secure-blockchain-table',
        name: 'Salary Manager',
        icon: <AppIcon src={salaryManager} alt={'Salary Manager'} />,
        description: 'Save and secret salary management tool!',
        element: <SecureBlockchainTableUi />
      }
    ]
  },
  {
    name: 'Key Management',
    description: '',
    entries: [
      {
        path: 'public-key-store',
        name: 'Public Key Store',
        icon: <AppIcon src={publicKey} alt={'Public Key'} />,
        description: 'Provide your public key for others to send you encrypted data.',
        element: <PublicKeyStoreUi />
      },

      {
        path: 'public-key-store-v2',
        name: 'Key Pair Store',
        icon: <AppIcon src={keyPairStorePng} alt={'Public Key V2'} />,
        description: 'Provide a public encryption key for others to send you encrypted data.',
        element: <PublicKeyStoreV2Ui />
      },
      {
        path: 'shared-secret-store',
        name: 'Shared Secret Store',
        icon: <AppIcon src={sharedKey} alt={'Shared Key'} />,
        description: 'Creating a secret key and share it with other users.',
        element: <SharedSecretStoreUi />
      }
    ]
  },
  {
    name: 'Namings',
    description: '',
    entries: [
      {
        path: 'universal-name-store',
        name: 'Universal Name Store',
        icon: <AppIcon src={universalNameStorePng} alt={'This is my name'} />,
        description: 'Register Your Address!',
        element: <UniversalNameStoreUi />
      },
      {
        path: 'address-book',
        name: 'Address Book',
        icon: <AppIcon src={addressBook} alt={'Address Book'} />,
        description: 'Address Book',
        element: <AddressBookUi />
      },

      {
        path: 'unique-name-store',
        name: 'My Unique Name',
        icon: <AppIcon src={thisIsMe} alt={'This is my name'} />,
        description: 'Connect a unique name to your address!',
        element: <UniqueNameStoreUi />
      },
      {
        path: 'contract-registry',
        name: 'Contract Registry',
        icon: <AppIcon src={contractRegistryPng} alt={'Contract Registry'} />,
        description:
          'Contract Registry including Registration, Deployment, Owner Management, Source Code Verification ...',
        element: <ContractRegistryUi />
      }
    ]
  },
  {
    name: 'Tools and More',
    description: '',
    entries: [
      {
        path: 'payments',
        name: 'Payments',
        icon: <AppIcon src={paymentsPng} alt={'Payments'} />,
        description: 'Send Crypto Money to a receiver...',
        element: <PaymentsUi />
      },
      {
        path: 'tools',
        name: 'Tools',
        icon: <AppIcon src={toolsPng} alt={'Tools'} />,
        description: 'Wallet, Seed Phrase, Keys, Encryption, ...',
        element: <ToolsUi />
      },
      {
        path: 'about',
        name: 'About',
        icon: <AppIcon src={aboutPng} alt={'About'} />,

        description: '',
        element: <About />
      },
      {
        path: 'uigallery',
        name: 'Ui Gallery',
        icon: <AppIcon src={aboutPng} alt={'About'} />,

        description: '',
        element: <UiGallery />
      }
    ]
  }
];

export const menuColumns: MenuColumn[] = menuColumnsAll
  .map((menuColumn) => {
    return {
      ...menuColumn,
      entries: menuColumn.entries.filter((entry) => visibleApps.length === 0 || visibleApps.includes(entry.path))
    };
  })
  .filter((menuColumn) => menuColumn.entries.length > 0);
