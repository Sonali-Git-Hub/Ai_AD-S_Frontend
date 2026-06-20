import React from 'react';
import { View } from 'react-native-web';

export const BlurView = ({ intensity, tint, style, ...props }) => {
  const blurAmount = intensity ? intensity / 10 : 10;
  const backdropFilter = `blur(${blurAmount}px)`;
  
  let backgroundColor = 'transparent';
  if (tint === 'dark') {
    backgroundColor = 'rgba(0,0,0,0.5)';
  } else if (tint === 'light') {
    backgroundColor = 'rgba(255,255,255,0.5)';
  }

  return (
    <View
      style={[
        style,
        {
          backdropFilter,
          WebkitBackdropFilter: backdropFilter,
          backgroundColor,
        }
      ]}
      {...props}
    />
  );
};
