import { ArtworkTimeProof, ArtworkType } from '../../contracts/artwork-time-proof/ArtworkTimeProof-support';
import { errorMessage, isStatusMessage, StatusMessage } from '../../types';

export async function getMyArtworks(artworkTimeProof: ArtworkTimeProof): Promise<ArtworkType[] | StatusMessage> {
  try {
    const len = await artworkTimeProof.getMyArtworkCount();
    if (isStatusMessage(len)) {
      return len;
    }
    const items: ArtworkType[] = [];
    for (let index = 0; index < len; index++) {
      const entry = await artworkTimeProof.getMyArtwork(index);
      if (isStatusMessage(entry)) {
        return entry;
      } else {
        items.push(entry);
      }
    }
    return items;
  } catch (e) {
    return errorMessage('Serious Error', e);
  }
}
