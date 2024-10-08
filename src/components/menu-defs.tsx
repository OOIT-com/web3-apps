import KeyBlockUi from './key-block/KeyBlockUi';
import { PublicKeyStoreUi } from './public-key-store/PublicKeyStoreUi';
import { PrivateMessageStoreUi } from './private-message-store/PrivateMessageStoreUi';
import { JSX, ReactNode } from 'react';
import { About } from './about/About';
import { ToolsUi } from './tools/ToolsUi';
import { UniqueNameStoreUi } from './unique-name-store/UniqueNameStoreUi';
import { ArtworkUi } from './artwork/ArtworkUi';
import { SharedSecretStoreUi } from './shared-secret-store/SharedSecretStoreUi';
import { ContractManagementUi } from './contract-registry/ContractManagementUi';
import { PublicKeyStoreV2Ui } from './public-key-store-v2/PublicKeyStoreV2Ui';
import keyBlock from './images/secret-vault.png';
import secretMessages from './images/secret-message.png';
import privateMessageStoreV2Png from './images/private-message-store-v2.png';

import artworkPng from './images/artwork.png';
import salaryManager from './images/salary-manager.png';
import sharedKey from './images/shared-key.png';
import publicKey from './images/public-key.png';
import publicKeyV2 from './images/public-key-v2.png';
import addressBook from './images/address-book.png';
import thisIsMe from './images/my-name.png';
import uns from './images/universal-name-store.png';
import contractRegistryPng from './images/contract-registry.png';
import toolsPng from './images/tools.png';
import aboutPng from './images/about.png';
import { SalaryManagerUi } from './secure-blockchain-table/SalaryManagerUi';
import { UniversalNameStoreUi } from './universal-name-store/UniversalNameStoreUi';
import { UiGallery } from './ui-gallery/UiGallery';
import { AddressBookUi } from './address-book/AddressBookUi';
import { PrivateMessageStoreV2Ui } from './private-message-store-v2/PrivateMessageStoreV2Ui';

export type MenuEntry = {
  path: string;
  name: string;
  icon?: ReactNode;
  description: string;
  element: JSX.Element;
  hidden?: boolean;
};
export type MenuColumn = { name: string; description: string; entries: MenuEntry[] };
const debug: boolean = false;
export const menuColumns: MenuColumn[] = [
  {
    name: ' User DApps',
    description: '',
    entries: [
      {
        path: 'key-block',
        name: 'My Secret Vault',
        icon: <AppIcon src={keyBlock} alt={'key-block'} />,
        description: 'Save your secrets, password etc. in the most possible safe and secure way.',
        element: <KeyBlockUi />
      },
      {
        path: 'private-message-store',
        name: 'Private & Safe Messages',
        icon: <AppIcon src={secretMessages} alt={'secret messages'} />,
        description: 'Send and receive encrypted messages.',
        element: <PrivateMessageStoreUi />
      },
      {
        path: 'private-message-store-v2',
        name: 'Private & Safe Messages V2',
        icon: <AppIcon src={privateMessageStoreV2Png} alt={'secret messages'} />,
        description: '',
        element: <PrivateMessageStoreV2Ui />
      },
      {
        path: 'artwork',
        name: 'Artwork',
        icon: <AppIcon src={artworkPng} alt={'Art Work'} />,
        description: 'Encrypt and Create an Artwork Time Proof',
        element: <ArtworkUi />
      },
      {
        path: 'secure-blockchain-table',
        name: 'Salary Manager',
        icon: <AppIcon src={salaryManager} alt={'Salary Manager'} />,
        description: 'Save and Secret Salary Management Tool',
        element: <SalaryManagerUi />
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
        name: 'Public Key Store V2',
        icon: <AppIcon src={publicKeyV2} alt={'Public Key V2'} />,
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
        icon: <AppIcon src={uns} alt={'This is my name'} />,
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
        element: <ContractManagementUi />
      }
    ]
  },
  {
    name: 'Tools and More',
    description: '',
    entries: [
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
        element: <UiGallery />,
        hidden: !debug
      }
    ]
  }
];

function AppIcon({ src, alt }: { src: any; alt: string }) {
  return (
    <span
      style={{
        display: 'block',
        padding: '1em',
        background: 'none' //'#f8ffff55'
      }}
    >
      <img src={src} alt={alt} style={{ maxHeight: '5em', maxWidth: '5em' }} />
    </span>
  );
}
