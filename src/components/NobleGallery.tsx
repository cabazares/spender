import React from 'react';

import {
  COLORS,
} from '../constants';

import {
  Noble,
} from '../types';

export interface NobleGalleryProps { nobles: Noble[] }

export const NobleGallery = (
  { nobles }: NobleGalleryProps
): React.ReactElement<NobleGalleryProps> => (
  <div className="noblesBox">
    {nobles.map((noble, key) => (
      <div key={key} className="nobleCard">
        {COLORS.map(color => {
          const count = noble.cost.filter(gemColor => gemColor === color).length;
          return count ? <div key={color} className={`cost color-${color}`}>{count}</div> : null;
        })}
        <div className="points">{noble.points}</div>
      </div>
    ))}
  </div>
);

export default NobleGallery;
