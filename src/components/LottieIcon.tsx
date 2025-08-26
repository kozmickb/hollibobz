import React, { useRef, useEffect } from 'react';
import { View } from 'react-native';
import LottieView from 'lottie-react-native';
import { useThemeStore } from '../store/useThemeStore';

interface LottieIconProps {
  source: any;
  size?: number;
  autoPlay?: boolean;
  loop?: boolean;
  style?: any;
}

export const LottieIcon: React.FC<LottieIconProps> = ({
  source,
  size = 100,
  autoPlay = true,
  loop = true,
  style,
}) => {
  const { reduceMotion } = useThemeStore();
  const animationRef = useRef<LottieView>(null);

  useEffect(() => {
    if (reduceMotion) {
      // Stop animation if reduce motion is enabled
      animationRef.current?.pause();
    } else if (autoPlay) {
      // Play animation if reduce motion is disabled and autoPlay is true
      animationRef.current?.play();
    }
  }, [reduceMotion, autoPlay]);

  if (reduceMotion) {
    // Show static frame when reduce motion is enabled
    return (
      <View style={[{ width: size, height: size }, style]}>
        <LottieView
          ref={animationRef}
          source={source}
          style={{ width: '100%', height: '100%' }}
          autoPlay={false}
          loop={false}
          progress={0.5} // Show middle frame
        />
      </View>
    );
  }

  return (
    <View style={[{ width: size, height: size }, style]}>
      <LottieView
        ref={animationRef}
        source={source}
        style={{ width: '100%', height: '100%' }}
        autoPlay={autoPlay}
        loop={loop}
      />
    </View>
  );
};
