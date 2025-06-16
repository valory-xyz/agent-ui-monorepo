import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider } from 'antd';
import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';
import { mainTheme } from './constants/theme';

const queryClient = new QueryClient();

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ConfigProvider theme={mainTheme}>
        <App />
      </ConfigProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
