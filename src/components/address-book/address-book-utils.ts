import { AddressData } from '../../contracts/address-book/AddressBook-support';
import { displayAddress } from '../../utils/misc-util';

export const addressDataDisplay = (e: AddressData): string => `${e.name} ${displayAddress(e.userAddress)}`;
