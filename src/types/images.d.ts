/**
 * Type declarations for static image imports.
 * Next.js provides these at runtime via next/image-types/global, but
 * that reference only resolves after a build. This file ensures tsc
 * can type-check image imports without requiring a prior build.
 */
declare module '*.png' {
  import type { StaticImageData } from 'next/image';
  const content: StaticImageData;
  export default content;
}

declare module '*.jpg' {
  import type { StaticImageData } from 'next/image';
  const content: StaticImageData;
  export default content;
}

declare module '*.jpeg' {
  import type { StaticImageData } from 'next/image';
  const content: StaticImageData;
  export default content;
}

declare module '*.gif' {
  import type { StaticImageData } from 'next/image';
  const content: StaticImageData;
  export default content;
}

declare module '*.webp' {
  import type { StaticImageData } from 'next/image';
  const content: StaticImageData;
  export default content;
}

declare module '*.avif' {
  import type { StaticImageData } from 'next/image';
  const content: StaticImageData;
  export default content;
}

declare module '*.ico' {
  import type { StaticImageData } from 'next/image';
  const content: StaticImageData;
  export default content;
}

declare module '*.svg' {
  import type { StaticImageData } from 'next/image';
  const content: StaticImageData;
  export default content;
}
