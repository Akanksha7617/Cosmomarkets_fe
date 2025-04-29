import {PageContainer} from '@ant-design/pro-components';
// import {useModel} from '@umijs/max';
import {Card, theme} from 'antd';
import React from 'react';
import {Typography} from "antd";

const {Title, Text} = Typography

const Profile: React.FC = () => {
  const {token} = theme.useToken();

  return (
    <PageContainer>
      <div>
      <img src="\images\pending-task2.png" style={{width:900,height:350}}/>
      </div>
      <Text>Please complete the proof My Details Verification Process to continue the Wallet transfer.</Text>
    </PageContainer>
  );
};

export default Profile;
