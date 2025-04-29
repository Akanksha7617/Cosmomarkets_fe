import {PageContainer} from '@ant-design/pro-components';
import {useModel} from '@umijs/max';
import {Card, theme} from 'antd';
import React from 'react';
import {Typography} from "antd";

const {Title, Text} = Typography

const Income: React.FC = () => {
  const {token} = theme.useToken();

  return (
    <PageContainer>
      <Text>Please complete the proof My Details Verification Process to continue the Wallet transfer.</Text>
    </PageContainer>
  );
};

export default Income;
