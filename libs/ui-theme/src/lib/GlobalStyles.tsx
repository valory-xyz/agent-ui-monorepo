import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
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
  .mt-16 {
    margin-top: 16px !important;
  }
  .ml-auto {
    margin-left: auto;
  }

  /* padding */
  .p-0 {
    padding: 0px !important;
  }

  /* font size */
  .text-sm {
    font-size: 14px;
  }
  .text-xs {
    font-size: 12px;
  }
  .text-center {
    text-align: center;
  }

  /* card */
  .card-gradient {
    border-radius: 12px;
    background: linear-gradient(180deg, #F5F7FA 0%, #FFF 100%), #FFF;
    box-shadow: 0px 0px 0px 4px #FFF inset;
  }
`;
