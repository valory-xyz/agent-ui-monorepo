import { createGlobalStyle } from 'styled-components';

interface GlobalStylesProps {
  tooltipBorderColor?: string;
}

export const GlobalStyles = createGlobalStyle<GlobalStylesProps>`
  body {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Roboto', sans-serif;
  }

  /* antd override */
  .ant-tag {
    display: flex;
    align-items: center;
    width: max-content;
    gap: 6px;
  }

  ${({ tooltipBorderColor }) =>
    tooltipBorderColor &&
    `.ant-tooltip-inner {
      border: 1px solid ${tooltipBorderColor};
    }
  `}

  u {
    text-underline-offset: 6px;
  }

  /* margins */
  h1, h2, h3, h4, h5, h6 {
    margin: 0
  }
  .m-0 {
    margin: 0px !important;
  }
  .mb-0 {
    margin-bottom: 0px !important;
  }
  .mb-8 {
    margin-bottom: 8px !important;
  }
  .mb-16 {
    margin-bottom: 16px !important;
  }
  .mb-24 {
    margin-bottom: 24px !important;
  }
  .mt-8 {
    margin-top: 8px !important;
  }
  .mt-16 {
    margin-top: 16px !important;
  }
  .mx-auto {
    margin: 0 auto;
  }
  .ml-auto {
    margin-left: auto;
  }
  .ml-8 {
    margin-left: 8px !important;
  }

  /* padding */
  .p-0 {
    padding: 0px !important;
  }

  /* font size */
  .text-lg {
    font-size: 18px;
  }
  .text-md {
    font-size: 16px;
  }
  .text-sm {
    font-size: 14px;
  }
  .text-xs {
    font-size: 12px;
  }
  .text-center {
    text-align: center;
  }

  /* font color */
  .text-white-075 {
    color: rgba(255, 255, 255, 0.75) !important;
  }

  /* font weights */
  .font-normal {
    font-weight: normal !important;
  }

  /* sizes */
  .w-full {
    width: 100%;
  }

  .underline {
    text-decoration: underline !important;
    text-underline-offset: 4px;
  }

  /* card */
  .card-gradient {
    border-radius: 12px;
    background: linear-gradient(180deg, #F5F7FA 0%, #FFF 100%), #FFF;
    box-shadow: 0px 0px 0px 4px #FFF inset;
  }

  /* antd-segment */
  .ant-segmented {
    padding: 3px;
    .ant-segmented-item {
      border-radius: 4px;
    }
  }
`;
