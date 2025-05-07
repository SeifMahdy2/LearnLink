import '@mui/material/styles';

declare module '@mui/material/styles' {
  interface TypeBackground {
    card?: string;
  }
}

declare module 'react-router-dom' {
  export interface RouteComponentProps {
    history: any;
    location: any;
    match: any;
    staticContext?: any;
  }
}

// Needed for styled-components
declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

declare module '*.svg' {
  import React = require('react');
  export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
  const src: string;
  export default src;
} 