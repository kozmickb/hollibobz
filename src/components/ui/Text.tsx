import { createText } from '@shopify/restyle';
import { Theme } from '../../theme/theme';

// Create the text component with proper theme typing
export const Text = createText<Theme>();

// Add error boundary for theme issues
export const SafeText = ({ color, ...props }: any) => {
  // If color is secondary and theme might not be loaded, use fallback
  if (color === 'secondary') {
    return (
      <Text 
        {...props} 
        color="text" 
        style={[{ color: '#14B8A6' }, props.style]}
      />
    );
  }
  
  return <Text color={color} {...props} />;
};

export type TextProps = React.ComponentProps<typeof Text>;
