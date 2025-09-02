import React from 'react';
import { View } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Path } from 'react-native-svg';
import { OdysyncPalette } from '../theme/tokens';

type BackgroundType = 'wave' | 'blob' | 'peaks';

interface HeroBackgroundProps {
  type?: BackgroundType;
  height?: number;
  style?: any;
}

const getBackgroundPath = (type: BackgroundType, height: number): string => {
  switch (type) {
    case 'wave':
      return `M0,${height * 0.7} Q25,${height * 0.5} 50,${height * 0.7} T100,${height * 0.7} L100,${height} L0,${height} Z`;
    case 'blob':
      return `M0,${height * 0.8} Q25,${height * 0.3} 50,${height * 0.8} Q75,${height * 0.5} 100,${height * 0.8} L100,${height} L0,${height} Z`;
    case 'peaks':
      return `M0,${height * 0.8} L25,${height * 0.4} L50,${height * 0.8} L75,${height * 0.6} L100,${height * 0.8} L100,${height} L0,${height} Z`;
    default:
      return `M0,${height * 0.7} Q25,${height * 0.5} 50,${height * 0.7} T100,${height * 0.7} L100,${height} L0,${height} Z`;
  }
};

export const HeroBackground: React.FC<HeroBackgroundProps> = ({
  type = 'wave',
  height = 200,
  style,
}) => {
  const path = getBackgroundPath(type, height);

  return (
    <View style={[{ position: 'absolute', top: 0, left: 0, right: 0 }, style]}>
      <Svg width="100%" height={height} viewBox={`0 0 100 ${height}`}>
        <Defs>
          <LinearGradient id="sunriseGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <Stop offset="0%" stopColor={OdysyncPalette.yellow400} />
        <Stop offset="50%" stopColor={OdysyncPalette.orange400} />
        <Stop offset="100%" stopColor={OdysyncPalette.orange500} />
          </LinearGradient>
        </Defs>
        <Path
          d={path}
          fill="url(#sunriseGradient)"
          opacity={0.8}
        />
      </Svg>
      
      {/* Bottom vignette scrim for text contrast */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 60,
          backgroundColor: OdysyncPalette.scrim,
        }}
      />
    </View>
  );
};
