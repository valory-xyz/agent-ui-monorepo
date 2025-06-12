import styled from 'styled-components';

import { Route, Routes, Link } from 'react-router-dom';
import { Navbar } from '@agent-ui-monorepo/ui-navbar';
import { Button } from 'antd';

const StyledApp = styled.div`
  // Your style here
  font-family: 'Roboto', sans-serif;
`;

export function App() {
  return (
    <StyledApp>
      <Navbar agentType="modius" />
      <br />
      <br />
      <br />
      <br />
      <Button type="primary">Ant Design Button</Button>
      <h2>Modius UI Example</h2>
      <br />
      <hr />
      <br />
      <div role="navigation">
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/page-2">Page 2</Link>
          </li>
        </ul>
      </div>
      <Routes>
        <Route
          path="/"
          element={
            <div>
              <Link to="/page-2">Click here for page 2.</Link>
            </div>
          }
        />
        <Route
          path="/page-2"
          element={
            <div>
              <Link to="/">Click here to go back to root page.</Link>
            </div>
          }
        />
      </Routes>
    </StyledApp>
  );
}

export default App;
