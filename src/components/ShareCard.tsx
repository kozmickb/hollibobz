import React from 'react';
import { View, Text, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { TripTickLogo } from './TripTickLogo';
import { getRingColor, getGradientColors } from '../utils/proximityTheme';

interface ShareCardProps {
  destination: string;
  daysLeft: number;
  imageUrl?: string;
  size?: number;
}

export function ShareCard({ destination, daysLeft, imageUrl, size = 400 }: ShareCardProps) {
  const stroke = Math.floor(size * 0.067); // 12/180 ratio
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(1, 1 - (daysLeft / 365))); // Simple progress calculation
  const strokeDashoffset = circumference * (1 - progress);
  const ringColor = getRingColor(daysLeft);
  const gradientColors = getGradientColors(daysLeft);

  return (
    <View style={{
      width: size,
      height: size * 1.2, // 20% taller for text
      borderRadius: 20,
      overflow: 'hidden',
      backgroundColor: '#FFFFFF',
    }}>
      {/* Background */}
      {imageUrl ? (
        <ImageBackground
          source={{ uri: imageUrl }}
          style={{ flex: 1 }}
          imageStyle={{ opacity: 0.3 }}
        >
          <LinearGradient
            colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
            style={{ flex: 1, padding: 20 }}
          >
            <ShareCardContent />
          </LinearGradient>
        </ImageBackground>
      ) : (
        <LinearGradient
          colors={gradientColors}
          style={{ flex: 1, padding: 20 }}
        >
          <ShareCardContent />
        </LinearGradient>
      )}
    </View>
  );

  function ShareCardContent() {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        {/* Logo */}
        <View style={{ marginBottom: 20 }}>
          <TripTickLogo size={40} />
        </View>

        {/* Countdown Ring */}
        <View style={{ marginBottom: 20 }}>
          <Svg width={size * 0.45} height={size * 0.45}>
            {/* Background ring */}
            <Circle
              stroke="rgba(255,255,255,0.2)"
              cx={size * 0.225}
              cy={size * 0.225}
              r={radius * 0.45}
              strokeWidth={stroke * 0.45}
              fill="none"
            />
            {/* Progress arc */}
            <Circle
              stroke={ringColor}
              cx={size * 0.225}
              cy={size * 0.225}
              r={radius * 0.45}
              strokeWidth={stroke * 0.45}
              fill="none"
              strokeDasharray={circumference * 0.45}
              strokeDashoffset={strokeDashoffset * 0.45}
              strokeLinecap="round"
              transform={`rotate(-90 ${size * 0.225} ${size * 0.225})`}
            />
          </Svg>

          {/* Days count in centre */}
          <View style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Text style={{
              fontSize: size * 0.1,
              fontFamily: 'Poppins-Bold',
              color: '#FFFFFF',
              textAlign: 'center',
            }}>
              {daysLeft}
            </Text>
            <Text style={{
              fontSize: size * 0.025,
              fontFamily: 'Poppins-Medium',
              color: 'rgba(255,255,255,0.8)',
              textAlign: 'center',
            }}>
              {daysLeft === 0 ? "It's go day!" : daysLeft === 1 ? "day" : "days"}
            </Text>
          </View>
        </View>

        {/* Destination text */}
        <Text style={{
          fontSize: size * 0.06,
          fontFamily: 'Poppins-Bold',
          color: '#FFFFFF',
          textAlign: 'center',
          marginBottom: 8,
          textShadowColor: 'rgba(0,0,0,0.5)',
          textShadowOffset: { width: 1, height: 1 },
          textShadowRadius: 3,
        }}>
          {daysLeft === 0 ? "I'm in" : "to"}
        </Text>
        <Text style={{
          fontSize: size * 0.08,
          fontFamily: 'Poppins-Bold',
          color: '#FFFFFF',
          textAlign: 'center',
          textShadowColor: 'rgba(0,0,0,0.5)',
          textShadowOffset: { width: 1, height: 1 },
          textShadowRadius: 3,
        }}>
          {destination}
        </Text>

        {/* App branding */}
        <View style={{
          position: 'absolute',
          bottom: 20,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        }}>
          <Ionicons name="airplane" size={16} color="#FFFFFF" />
          <Text style={{
            fontSize: size * 0.025,
            fontFamily: 'Poppins-Medium',
            color: 'rgba(255,255,255,0.8)',
          }}>
            TripTick
          </Text>
        </View>
      </View>
    );
  }
}
