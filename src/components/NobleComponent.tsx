import React from 'react';

import {
  COLORS,
} from '../constants';

import {
  Noble,
} from '../types';

export interface NobleComponentProps {
  noble: Noble
  onSelectNoble?: (noble: Noble) => void
}

export const NobleComponent = (
  { noble, onSelectNoble }: NobleComponentProps
): React.ReactElement<NobleComponentProps> => (
  <div className="nobleCard" onClick={() => onSelectNoble && onSelectNoble(noble)}>
    {COLORS.map(color => {
      const count = noble.cost.filter(gemColor => gemColor === color).length;
      return count ? <div key={color} className={`cost color-${color}`}>{count}</div> : null;
    })}
    <div className="points">{noble.points}</div>
  </div>
);
