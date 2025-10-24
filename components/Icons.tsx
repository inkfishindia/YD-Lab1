
import React from 'react';

const createOutlineIcon =
  (path: React.ReactNode) => (props: React.SVGProps<SVGSVGElement> & { title?: string }) => {
    const { title, ...rest } = props;
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        {...rest}
      >
        {title && <title>{title}</title>}
        {path}
      </svg>
    );
  };

// Using heroicons as a base for SVGs.

export const HomeIcon = createOutlineIcon(
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h7.5"
  />,
);
export const FolderIcon = createOutlineIcon(
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
  />,
);
export const LightBulbIcon = createOutlineIcon(
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.311a14.994 14.994 0 01-3.75 0M9.75 10.5a3 3 0 116 0 3 3 0 01-6 0z"
  />,
);
export const BriefcaseIcon = createOutlineIcon(
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    d="M20.25 14.15v4.075c0 1.313-.972 2.4-2.215 2.521-1.4.14-2.585-.935-2.585-2.252V14.15M15.75 14.15v4.075a2.25 2.25 0 01-2.25 2.25h-4.5a2.25 2.25 0 01-2.25-2.25V14.15M15.75 14.15L18 12.75l-2.25-1.4M15.75 14.15L12 12.75m3.75 1.4L12 12.75m-3.75 1.4L9 12.75l-2.25 1.4m2.25-1.4L6 12.75m7.5 1.5l-3-3m0 0l-3 3m3-3v-6m-1.5 9H5.625c-.621 0-1.125-.504-1.125-1.125V10.5a1.125 1.125 0 011.125-1.125h12.75c.621 0 1.125.504 1.125 1.125v8.625c0 .621-.504 1.125-1.125 1.125H13.5"
  />,
);
export const PresentationChartLineIcon = createOutlineIcon(
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    d="M3.75 3v11.25A2.25 2.25 0 006 16.5h12A2.25 2.25 0 0020.25 14.25V3M3.75 3l-1.48-1.48M3.75 3h16.5M19.5 3l1.48-1.48M6.75 9l3.75 3 3.75-3m-7.5 0V3h7.5v6M12 16.5v-3.75"
  />,
);
export const MegaphoneIcon = createOutlineIcon(
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    d="M10.5 6a7.5 7.5 0 100 15 7.5 7.5 0 000-15zM10.5 21V3M3.75 12H10.5m0 0H17.25"
  />,
);
export const CurrencyDollarIcon = createOutlineIcon(
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 11.21 12.75 11 12 11c-.75 0-1.536.21-2.121.659L7.5 14.25m5.25-2.25V6"
  />,
);
export const WrenchScrewdriverIcon = createOutlineIcon(
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    d="M11.42 15.17L17.25 21A2.25 2.25 0 0113.5 21v-4.5m-4.5-4.5H3.75a2.25 2.25 0 010-4.5h3.75m0 0V3.75c0-1.036.84-1.875 1.875-1.875h1.5c1.036 0 1.875.84 1.875 1.875v3.75m0 0h3.75a2.25 2.25 0 010 4.5h-3.75m0 0v1.5a2.25 2.25 0 002.25 2.25h1.5a2.25 2.25 0 002.25-2.25v-1.5m-6-3.75v1.5a2.25 2.25 0 01-2.25 2.25h-1.5a2.25 2.25 0 01-2.25-2.25v-1.5"
  />,
);
export const Cog6ToothIcon = createOutlineIcon(
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    d="M9.594 3.94c.09-.542.56-1.006 1.11-1.226.554-.22 1.196-.22 1.75 0 .554.22 1.02.684 1.11 1.226l.094.542c.063.372.333.693.668.867.336.174.712.265 1.08.265h.542c.554 0 1.055.343 1.282.843.228.502.16.92-.19 1.31l-.094.13c-.173.245-.295.536-.328.843-.033.307.01.617.14.898l.094.13c.35.39.418.808.19 1.31-.228.502-.728.843-1.282.843h-.542c-.368 0-.744.09-.108.265-.335.174-.605.495-.668.867l-.094.542c-.09.542-.556 1.006-1.11 1.226-.554-.22-1.196-.22-1.75 0-.554-.22-1.02-.684-1.11-1.226l-.094-.542c-.063-.372-.333-.693-.668-.867-.336-.174-.712-.265-1.08-.265h-.542c-.554 0-1.055-.343-1.282-.843-.228-.502-.16-.92.19-1.31l.094-.13c.173-.245.295-.536.328-.843.033-.307-.01-.617-.14-.898l-.094-.13c-.35-.39-.418-.808-.19-1.31.228.502.728.843 1.282.843h.542c.368 0 .744-.09 1.08-.265.335-.174.605-.495.668-.867l-.094-.542zM12 15a3 3 0 100-6 3 3 0 000 6z"
  />,
);
export const PinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    {...props}
  >
    {' '}
    <path
      fillRule="evenodd"
      d="M10 3a1 1 0 0 1 1 1v1.172l4.293 4.293a1 1 0 0 1-1.414 1.414L11 8.414V16a1 1 0 1 1-2 0V8.414l-2.879 2.88a1 1 0 0 1-1.414-1.415l4.293-4.292V4a1 1 0 0 1 1-1Z"
      clipRule="evenodd"
    />{' '}
  </svg>
);
export const PinOffIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    {...props}
  >
    {' '}
    <path d="M14.5 5.23a1 1 0 0 1 1.41.09l.1.1 1.41 1.41a1 1 0 0 1 0 1.41L15.91 9.75l-5.66-5.66L14.5 5.23Zm-1.41-1.41-1.41-1.42a1 1 0 0 0-1.41 0L8.86 3.81l5.66 5.66 1.41-1.42a1 1 0 0 0 0-1.41l-1.5-1.5Z M3.25 10.19 10.19 3.25 9.75 2.81 2.81 9.75l-1.5 5.25a1 1 0 0 0 1.12 1.12l5.25-1.5 6.94-6.94-.44-.44Z" />{' '}
  </svg>
);
export const ChevronDoubleLeftIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    {...props}
  >
    <path
      fillRule="evenodd"
      d="M15.79 16.53a.75.75 0 0 1-1.06 0l-7-7a.75.75 0 0 1 0-1.06l7-7a.75.75 0 1 1 1.06 1.06L9.31 9l6.47 6.47a.75.75 0 0 1 0 1.06Z"
      clipRule="evenodd"
    />
    <path
      fillRule="evenodd"
      d="M8.79 16.53a.75.75 0 0 1-1.06 0l-7-7a.75.75 0 0 1 0-1.06l7-7a.75.75 0 1 1 1.06 1.06L2.31 9l6.47 6.47a.75.75 0 0 1 0 1.06Z"
      clipRule="evenodd"
    />
  </svg>
);
export const ChevronDoubleRightIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    {...props}
  >
    <path
      fillRule="evenodd"
      d="M4.21 3.47a.75.75 0 0 1 1.06 0l7 7a.75.75 0 0 1 0 1.06l-7 7a.75.75 0 1 1-1.06-1.06L10.69 10 4.21 3.53a.75.75 0 0 1 0-1.06Z"
      clipRule="evenodd"
    />
    <path
      fillRule="evenodd"
      d="M11.21 3.47a.75.75 0 0 1 1.06 0l7 7a.75.75 0 0 1 0 1.06l-7 7a.75.75 0 1 1-1.06-1.06L17.69 10l-6.47-6.47a.75.75 0 0 1 0-1.06Z"
      clipRule="evenodd"
    />
  </svg>
);
export const ViewGridIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    {...props}
  >
    <path
      fillRule="evenodd"
      d="M1 4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V4ZM4 0a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H5ZM4 11a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-2Zm7-7a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1h-2Zm-1 8a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-2Z"
      clipRule="evenodd"
    />
  </svg>
);
export const EnvelopeIcon = createOutlineIcon(
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
  />,
);
export const SlackIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" {...props}>
    <path
      fill="currentColor"
      d="M94.12 315.88A47.06 47.06 0 0 0 47.06 363a47.06 47.06 0 0 0 47.06 47.06A47.06 47.06 0 0 0 141.18 363a47.06 47.06 0 0 0-47.06-47.12zm0-94.12A47.06 47.06 0 0 0 47.06 269a47.06 47.06 0 0 0 47.06 47.06V221.76zM94.12 47.06A47.06 47.06 0 0 0 47.06 94.12A47.06 47.06 0 0 0 94.12 141.18V47.06zm94.12 0A47.06 47.06 0 0 0 141.18 94.12h47.06A47.06 47.06 0 0 0 235.3 47.06zM315.88 410.06a47.06 47.06 0 0 0 47.06-47.06 47.06 47.06 0 0 0-47.06-47.06 47.06 47.06 0 0 0-47.06 47.06 47.06 47.06 0 0 0 47.06 47.06zm0 94.12a47.06 47.06 0 0 0 47.06-47.06h-47.06a47.06 47.06 0 0 0 0 47.06zM410.06 315.88a47.06 47.06 0 0 0-47.06 47.06 47.06 47.06 0 0 0 47.06 47.06V315.88zm-94.12-94.12a47.06 47.06 0 0 0-47.06-47.06v47.06a47.06 47.06 0 0 0 47.06 0zM141.18 221.76a47.06 47.06 0 0 0-47.06-47.06H47.06a47.06 47.06 0 0 0 47.06 47.06zm0 94.12a47.06 47.06 0 0 0 47.06 47.06 47.06 47.06 0 0 0 47.06-47.06h-94.12zm94.12-94.12a47.06 47.06 0 0 0 47.06-47.06v-47.06a47.06 47.06 0 0 0-47.06 47.06zm0-94.12a47.06 47.06 0 0 0 47.06-47.06 47.06 47.06 0 0 0-47.06-47.06v94.12z"
    />
  </svg>
);
export const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" {...props}>
    <path
      fill="currentColor"
      d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"
    />
  </svg>
);
export const InteraktIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    {...props}
  >
    {' '}
    <path d="M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16ZM3 10a7 7 0 1 1 12.32-3.61l-4.5 4.5a1 1 0 0 1-1.42-1.42l4.5-4.5A7 7 0 0 1 3 10Z" />{' '}
  </svg>
);
export const MetaIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" {...props}>
    <path
      fill="currentColor"
      d="M512 256C512 114.6 397.4 0 256 0S0 114.6 0 256C0 376 82.7 476.8 194.2 504.5V334.2H141.4V256h52.8V222.3c0-87.1 39.4-127.5 125-127.5c16.2 0 44.2 3.2 55.7 6.4V179h-43.6c-42.3 0-52.6 15.6-52.6 44.5v32.5h89.2l-14.8 78.2h-74.4V504.5C429.3 476.8 512 376 512 256z"
    />
  </svg>
);
export const GoogleAdsIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    {...props}
  >
    {' '}
    <path d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0ZM4.5 9.5a.5.5 0 0 0 0 1h2.15l-1.3 1.3a.5.5 0 1 0 .7.7l2-2a.5.5 0 0 0 0-.7l-2-2a.5.5 0 0 0-.7.7l1.3 1.3H4.5ZM13.5 9a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-1 0v-3a.5.5 0 0 1 .5-.5ZM11.5 7a.5.5 0 0 0-.5.5v7a.5.5 0 0 0 1 0v-7a.5.5 0 0 0-.5-.5Z" />{' '}
  </svg>
);
export const SparklesIcon = createOutlineIcon(
  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.502L16.5 21.75l-.398-1.248a3.375 3.375 0 00-2.456-2.456L12.75 18l1.248-.398a3.375 3.375 0 002.456 2.456l1.248.398-1.248.398a3.375 3.375 0 00-2.456 2.456z" />
);
export const ChartBarIcon = createOutlineIcon(
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A2.625 2.625 0 011.5 18.375V17.25c0-1.034.84-1.875 1.875-1.875h1.125c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-1.125a1.875 1.875 0 01-1.875-1.875V13.125zM12.75 3C12.75 2.448 13.2 2 13.8 2h2.4c.6 0 1.05.448 1.05 1v17c0 .552-.45 1-1.05 1h-2.4c-.6 0-1.05-.448-1.05-1V3zM9 9.375C9 8.754 9.504 8.25 10.125 8.25h2.25c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-2.25A2.625 2.625 0 016.75 19.125V18c0-1.034.84-1.875 1.875-1.875h.375c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125h-.375a1.875 1.875 0 01-1.875-1.875V9.375z"
  />,
);
export const DocumentTextIcon = createOutlineIcon(
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
  />,
);
export const SearchIcon = createOutlineIcon(
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
  />,
);
export const BellIcon = createOutlineIcon(
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.31 5.022 23.847 23.847 0 005.455 1.31m5.714 0a24.298 24.298 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
  />,
);
export const PlusIcon = createOutlineIcon(
  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />,
);
export const ChevronDownIcon = createOutlineIcon(
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    d="M19.5 8.25l-7.5 7.5-7.5-7.5"
  />,
);
export const ClipboardCheckIcon = createOutlineIcon(
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
  />,
);
export const UsersIcon = createOutlineIcon(
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.5-2.962c.513-.346 1.063-.628 1.626-.826M9 9.75a3 3 0 116 0 3 3 0 01-6 0zM3.75 20.25a9.094 9.094 0 013.741-.479 3 3 0 014.682-2.72M12 12.75a3 3 0 110-6 3 3 0 010 6zM3.75 15.75c-.513.346-1.063.628-1.626.826"
  />,
);
export const ClockIcon = createOutlineIcon(
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
  />,
);
export const IdentificationIcon = createOutlineIcon(
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
  />,
);
export const TrendingUpIcon = createOutlineIcon(
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.517L21.75 6"
  />,
);
export const CollectionIcon = createOutlineIcon(
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    d="M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6A1.125 1.125 0 012.25 10.875v-3.75zM14.25 8.625c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-8.25zM3.75 16.125c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-2.25z"
  />,
);
export const ChatBubbleOvalLeftEllipsisIcon = createOutlineIcon(
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.76 9.76 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
  />,
);
export const CalendarIcon = createOutlineIcon(
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18M12 12.75h.008v.008H12v-.008z"
  />,
);
export const UserCircleIcon = createOutlineIcon(
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
  />,
);
export const BeakerIcon = createOutlineIcon(
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M19 14.5h-14v4.75h14v-4.75ZM6.375 18.375h.008v.008h-.008v-.008Zm11.25 0h.008v.008h-.008v-.008Z"
  />,
);
export const SwatchIcon = createOutlineIcon(
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    d="M4.098 19.902a3.75 3.75 0 0 0 5.304 0l6.401-6.402a3.75 3.75 0 0 0-.61-6.21 3.75 3.75 0 0 0-6.21-.61l-6.401 6.402a3.75 3.75 0 000 5.304Zm12.13-1.06-6.401-6.402m6.401 6.402a3.75 3.75 0 0 1-5.304 0l-6.401-6.402a3.75 3.75 0 0 1 0-5.304l6.401-6.402a3.75 3.75 0 015.304 0l6.401 6.402a3.75 3.75 0 010 5.304l-6.401 6.402Z"
  />,
);
export const TargetIcon = createOutlineIcon(
  <>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </>,
);
export const RocketLaunchIcon = createOutlineIcon(
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    d="M9 19L11 21M13 19L11 21M9 13.5v6M13 13.5v6M11 21v-7.5M11 3L5.5 13.5h11L11 3z"
  />,
);
export const BuildingStorefrontIcon = createOutlineIcon(
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.658-.463 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
  />,
);
export const ComputerDesktopIcon = createOutlineIcon(
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 01"
  />,
);

// --- Newly added icons based on error report ---

export const ScaleIcon = createOutlineIcon(
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    d="M12 3v18M15 6.75l-6 6V6.75A2.25 2.25 0 0111.25 4.5h1.5A2.25 2.25 0 0115 6.75zm-3 9L9 11.25l-3 3v-7.5A2.25 2.25 0 018.25 4.5h3A2.25 2.25 0 0113.5 6.75V11.25z"
  />,
);

export const PencilIcon = createOutlineIcon(
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14.25v4.5a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18.75V5.25A2.25 2.25 0 015.25 3h4.5"
  />,
);

export const QueueListIcon = createOutlineIcon(
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 18.75h16.5M3.75 9.75h16.5M3.75 6.75h16.5"
  />,
);

export const RefreshIcon = createOutlineIcon(
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    d="M16.023 9.348h4.992v-.001M2.985 15.348A10.146 10.146 0 0112 3.75c4.665 0 8.448 3.55 8.794 8.008L20.5 12M2.985 15.348A10.146 10.146 0 0012 20.25c4.665 0 8.448-3.55 8.794-8.008L20.5 12"
  />,
);

export const CloseIcon = createOutlineIcon(
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    d="M6 18L18 6M6 6l12 12"
  />,
);

export const EditIcon = createOutlineIcon(
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"
  />,
);

export const TrashIcon = createOutlineIcon(
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    d="M14.746 9.172v1.077m-4.646 0v1.077m-4.647 0v1.077M18 17.25c0 .414-.336.75-.75.75H5.25a.75.75 0 01-.75-.75V8.25c0-.414.336-.75.75-.75h1.25L7.75 3c0-.414.336-.75.75-.75h7.25c.414 0 .75.336.75.75l.5 4.5h1.25c.414 0 .75.336.75.75v8.75z"
  />,
);

export const SortIcon = createOutlineIcon(
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    d="M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v9m0 0l-3.25-3.25M17.25 18l3.25-3.25"
  />,
);

export const Squares2X2Icon = createOutlineIcon(
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    d="M3.75 12.75l1.5-1.5m-1.5 1.5l-1.5 1.5m1.5-1.5l1.5 1.5m-1.5-1.5l-1.5-1.5M12.75 3.75l-1.5 1.5m1.5-1.5l1.5 1.5m-1.5-1.5l-1.5-1.5m1.5-1.5l-1.5 1.5"
  />,
);

export const UserGroupIcon = createOutlineIcon(
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
  />,
);

export const ExclamationTriangleIcon = createOutlineIcon(
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    d="M12 9v3.75m-9.303 3.376c-.866 1.5.174 3.374 1.945 3.374h14.71c1.771 0 2.812-1.874 1.945-3.374L13.949 3.376c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
  />,
);

export const CursorArrowRaysIcon = createOutlineIcon(
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    d="M15.042 2.25L13.5 7.5M15.042 2.25L12 7.5M15.042 2.25L10.5 7.5M15.042 2.25L9 7.5M15.042 2.25L7.5 7.5M15.042 2.25L6 7.5M15.042 2.25L4.5 7.5M15.042 2.25L3 7.5M15.042 2.25L1.5 7.5M15.042 2.25L0 7.5M15.042 2.25L-1.5 7.5"
  />,
);

export const ShoppingCartIcon = createOutlineIcon(
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    d="M2.25 3h1.386c.51 0 .955.343 1.023.828L5.75 20.25H20.25c.414 0 .749-.335.749-.75V15.75a.75.75 0 00-.749-.75H13.5c-.414 0-.75-.335-.75-.75V9.75c0-.414-.336-.75-.75-.75H5.75c-.414 0-.75-.336-.75-.75V4.5A2.25 2.25 0 003.75 2.25H2.25zM18.75 15a.75.75 0 00-.75-.75h-2.25a.75.75 0 00-.75.75v.75a.75.75 0 00.75.75h2.25a.75.75 0 00.75-.75v-.75z"
  />,
);

// FIX: Added CheckCircleIcon
export const CheckCircleIcon = createOutlineIcon(
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
  />,
);