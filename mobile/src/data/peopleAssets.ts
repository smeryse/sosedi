import { Image } from 'react-native';

const assetUri = (asset: number) => Image.resolveAssetSource(asset).uri;

export const PEOPLE_IMAGES = {
  maria: assetUri(require('../../assets/people/maria.jpg')),
  artem: assetUri(require('../../assets/people/artem.jpg')),
  ekaterina: assetUri(require('../../assets/people/ekaterina.jpg')),
  ilya: assetUri(require('../../assets/people/ilya.jpg')),
} as const;
