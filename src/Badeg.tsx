import React from 'react';
import { Avatar, Badge } from 'antd';

const App: React.FC = () => (
  <a href="./Transactions">
    <Badge count={5}>
      <Avatar shape="square" size="large" />
    </Badge>
  </a>
);