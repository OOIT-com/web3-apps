import { FC } from 'react';

export const AppIcon: FC<{ src: any; alt: string }> = ({ src, alt }) => {
  return (
    <span
      style={{
        display: 'block',
        padding: '1em',
        background: 'none' //'#f8ffff55'
      }}
    >
      <img src={src} alt={alt} style={{ maxHeight: '5em', maxWidth: '5em' }} />
    </span>
  );
};
