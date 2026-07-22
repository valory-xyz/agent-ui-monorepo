import { createGlobalStyle } from 'styled-components';

/**
 * Button redesigns ported verbatim from Pearl
 * (olas-operate-app frontend/styles/globals.scss) — this Profile tab renders
 * inside Pearl's iframe, so buttons must match the host: soft inset shadows,
 * gradient primary fill, 36px height (set via the Button `controlHeight` token
 * in constants/theme.ts).
 */
export const GlobalStyles = createGlobalStyle`
  /* === Primary buttons === */
  .ant-btn-primary {
    background: linear-gradient(0deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.1) 100%), #7e22ce;
    background-blend-mode: overlay, normal;
    box-shadow:
      0 -1px 0 0 rgba(0, 0, 0, 0.05) inset,
      0 0 0 1px rgba(0, 0, 0, 0.1) inset,
      0 -4px 16px 0 rgba(255, 255, 255, 0.24) inset,
      0 4px 16px 0 rgba(255, 255, 255, 0.24) inset,
      0 0 0 2px rgba(255, 255, 255, 0.12) inset;
  }

  .ant-btn-primary:hover {
    background: linear-gradient(0deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.3) 100%), #7e22ce;
    background-blend-mode: overlay, normal;
    box-shadow:
      0 -1px 0 0 rgba(0, 0, 0, 0.05) inset,
      0 0 0 1px rgba(0, 0, 0, 0.1) inset,
      0 -4px 16px 0 rgba(255, 255, 255, 0.24) inset,
      0 4px 16px 0 rgba(255, 255, 255, 0.24) inset,
      0 0 0 2px rgba(255, 255, 255, 0.06) inset;
  }

  .ant-btn-primary:focus-visible,
  .ant-btn-primary:active {
    background:
      linear-gradient(180deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.1) 100%),
      linear-gradient(0deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.3) 100%),
      #7e22ce;
    background-blend-mode: normal, overlay, normal;
    box-shadow:
      0 -1px 0 0 rgba(0, 0, 0, 0.5) inset,
      0 1.5px 0.5px 0.5px rgba(0, 0, 0, 0.15) inset;
  }

  .ant-btn-primary:disabled {
    opacity: 0.4;
    background: linear-gradient(0deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.1) 100%), #7e22ce;
    background-blend-mode: overlay, normal;
    box-shadow:
      0 -1px 0 0 rgba(0, 0, 0, 0.05) inset,
      0 0 0 1px rgba(0, 0, 0, 0.1) inset,
      0 -4px 16px 0 rgba(255, 255, 255, 0.24) inset,
      0 4px 16px 0 rgba(255, 255, 255, 0.24) inset,
      0 0 0 2px rgba(255, 255, 255, 0.12) inset;
  }

  /* === Default buttons === */
  .ant-btn-default {
    background: #fff;
    box-shadow:
      0 -1px 0 0 #dfe6ec inset,
      0 0 0 1px #eaedf1 inset,
      0 0 0 2px #fff inset,
      0 4px 8px 0 rgba(255, 255, 255, 0.5) inset,
      0 0 8px 2px #edf2f7 inset;
    border: 1px transparent;
    transition: background 0.2s ease, box-shadow 0.1s ease;
  }

  .ant-btn-default:not(:disabled):not(.ant-btn-disabled):hover {
    border: 1px transparent;
    color: #000000 !important;
    background: #edf2f7;
    box-shadow:
      0 -1px 0 0 #d1d9e6 inset,
      0 0 0 1px #dfe6ec inset,
      0 0 0 2px rgba(255, 255, 255, 0.5) inset;
  }

  .ant-btn-default:not(:disabled):not(.ant-btn-disabled):focus-visible,
  .ant-btn-default:not(:disabled):not(.ant-btn-disabled):active {
    background: #dfe6ec !important;
    box-shadow:
      0 -1px 0 0 rgba(0, 0, 0, 0.1) inset,
      0 1.25px 0.5px 1px rgba(0, 0, 0, 0.1) inset;
  }

  .ant-btn-default:disabled {
    border: 1px solid #dfe6ec;
    color: #000000 !important;
    opacity: 0.4;
    background: #fff;
    box-shadow:
      0 -1px 0 0 #dfe6ec inset,
      0 0 0 1px #eaedf1 inset,
      0 0 0 2px #fff inset,
      0 0 0 3px #f4f7fa inset,
      0 4px 8px 0 rgba(255, 255, 255, 0.5) inset,
      0 0 6px 2px #edf2f7 inset;
  }

  /* === Link buttons === */
  .ant-btn-link {
    color: #7e22ce !important;
  }

  .ant-btn-link:hover,
  .ant-btn-link:focus-visible,
  .ant-btn-link:active {
    color: #36075f !important;
  }

  .ant-btn-link:disabled,
  .ant-btn-text:disabled {
    opacity: 0.4;
    color: #000000 !important;
  }

  /* === Coding-tool select dropdown (rendered in a portal) === */
  .connect-harness-popup .ant-select-item-option-content {
    font-size: 14px;
  }
`;
