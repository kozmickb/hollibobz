import React from 'react';
import { Button as KittenButton, ButtonProps as KittenButtonProps } from '@ui-kitten/components';
import { LinearGradient } from 'expo-linear-gradient';
import { OdysyncPalette } from '../../theme/tokens';
import { Box } from './Box';

interface ButtonProps extends Omit<KittenButtonProps, 'appearance'> {
  variant?: 'primary' | 'secondary' | 'ghost';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  children, 
  style,
  ...props 
}) => {
  const renderButton = () => {
    switch (variant) {
      case 'primary':
        return (
          <LinearGradient
            colors={[OdysyncPalette.yellow400, OdysyncPalette.orange500]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ borderRadius: 12 }}
          >
            <KittenButton
              appearance="ghost"
              style={[
                {
                  backgroundColor: 'transparent',
                  borderWidth: 0,
                  borderRadius: 12,
                  paddingVertical: 12,
                  paddingHorizontal: 24,
                },
                style,
              ]}
              {...props}
            >
              {children}
            </KittenButton>
          </LinearGradient>
        );
        
      case 'secondary':
        return (
          <KittenButton
            appearance="outline"
            style={[
              {
                backgroundColor: OdysyncPalette.navy700,
                borderColor: OdysyncPalette.navy500,
                borderRadius: 12,
                paddingVertical: 12,
                paddingHorizontal: 24,
              },
              style,
            ]}
            {...props}
          >
            {children}
          </KittenButton>
        );
        
      case 'ghost':
        return (
          <KittenButton
            appearance="ghost"
            style={[
              {
                backgroundColor: 'transparent',
                borderRadius: 12,
                paddingVertical: 12,
                paddingHorizontal: 24,
              },
              style,
            ]}
            {...props}
          >
            {children}
          </KittenButton>
        );
        
      default:
        return null;
    }
  };

  return <Box>{renderButton()}</Box>;
};
