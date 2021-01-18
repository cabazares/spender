import React from 'react';

import {
  COLORS,
} from '../constants';
import {
  gemsOfColor,
} from '../utils';
import {
  GemColor,
} from '../types';

export interface DiscardGemModalProps {
  gems: GemColor[],
  onSelectGem: (color: GemColor) => void,
}

export const DiscardGemModal = (
  { gems, onSelectGem } : DiscardGemModalProps
): React.ReactElement<DiscardGemModalProps> => (
  <div className="playerDiscardModal">
    <div>Select tokens to return:</div>
    {COLORS.map(color => (
      <div
        key={color}
        className={`gemToken color-${color}`}
        onClick={() => onSelectGem(color)}
      >{gemsOfColor(gems, color).length}</div>
    ))}
  </div>
);

export default DiscardGemModal;
