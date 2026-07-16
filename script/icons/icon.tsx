import React from 'react';
import { ICON_MAP, type IconId } from './icon-map.ts';
import { loadIconLib, type IconModule } from './loaders.ts';

export type IconProps = { id: IconId } & React.SVGProps<SVGSVGElement>;

export const Icon = ({ id, ...props }: IconProps) => {
  const ref = ICON_MAP[id];
  const [mod, setMod] = React.useState<IconModule | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    setMod(null);
    loadIconLib(ref.lib).then((m) => {
      if (!cancelled) setMod(m);
    });
    return () => {
      cancelled = true;
    };
  }, [ref.lib]);

  const Component = mod?.[ref.name];
  if (!Component) return null;
  return <Component {...props} />;
};
