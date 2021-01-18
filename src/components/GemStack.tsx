import React from 'react';

import {
  COLORS,
  GEM_COLORS,
} from '../constants';
import {
  gemsOfColor,
} from '../utils';

import {
  GemColor,
} from '../types';

export interface GemStackProps {
  gems: GemColor[],
  onPlayerSelectGem?: (gem: GemColor) => void
}

export const GemStack = (
  { gems, onPlayerSelectGem }: GemStackProps
): React.ReactElement<GemStackProps> => (
  <div className="gemStack">
    {COLORS.map(color => {
      const tokens = gemsOfColor(gems, color);
      return (
        <div
          key={color}
          className={`gemToken color-${color}`}
          onClick={() => {
            if (tokens.length > 0 && color !== GEM_COLORS.GOLD) {
              onPlayerSelectGem && onPlayerSelectGem(color);
            }
          }}
        >{tokens.length}</div>
      );
    })}
  </div>
);

export default GemStack;
