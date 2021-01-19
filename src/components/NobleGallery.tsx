import React from 'react';

import {
  Noble,
} from '../types';
import {NobleComponent} from './NobleComponent';

export interface NobleGalleryProps { nobles: Noble[] }

export const NobleGallery = (
  { nobles }: NobleGalleryProps
): React.ReactElement<NobleGalleryProps> => (
  <div className="noblesBox">
    {nobles.map((noble, key) => (
      <NobleComponent key={key} noble={noble} />
    ))}
  </div>
);

export default NobleGallery;
