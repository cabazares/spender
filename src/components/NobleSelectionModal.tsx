import React from 'react';

import {
  NobleComponent
} from './NobleComponent';

import {
  Noble,
} from '../types';

export interface NobleSelectionModalProps {
  nobles: Noble[]
  onSelectNoble?: (noble: Noble) => void,
}

export const NobleSelectionModal = (
  { nobles, onSelectNoble }: NobleSelectionModalProps
): React.ReactElement<NobleSelectionModalProps> => (
  <div className="nobleSelectionModal">
    {nobles.map((noble, key) => (
      <NobleComponent key={key} noble={noble} onSelectNoble={onSelectNoble} />
    ))}
  </div>
);
