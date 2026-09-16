import Svg, { Path } from "react-native-svg";

import { ICON_PATHS, type IconName } from "@/components/ui/icon/paths";
import { color } from "@/styles/tokens";

export interface IconProps {
  name: IconName;
  size?: number;
  tint?: string;
}

export function Icon({ name, size = 24, tint = color.text.primary }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 256 256" fill="none">
      <Path d={ICON_PATHS[name]} fill={tint} />
    </Svg>
  );
}
