import { createText } from '@shopify/restyle';
import { Theme } from '../../theme/theme';

export const Text = createText<Theme>();
export type TextProps = React.ComponentProps<typeof Text>;
