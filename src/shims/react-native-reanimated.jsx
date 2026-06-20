import React from 'react';
import { View } from 'react-native';

const AnimatedView = React.forwardRef(({ children, style, entering, exiting, ...props }, ref) => {
  return (
    <View ref={ref} style={style} {...props}>
      {children}
    </View>
  );
});

const AnimatedReanimated = {
  View: AnimatedView,
};

export const FadeIn = null;
export const FadeOut = null;
export default AnimatedReanimated;
