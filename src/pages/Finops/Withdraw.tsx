import { api } from '@/components/common/api';
import { Type } from '@/generated';
import { Transfer } from '@/pages/Finops/common/Transfer';
import { CalculatorOutlined, WalletOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { history, useModel } from '@umijs/max';
import { Card, ConfigProvider, Row, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
import CustomLoader from '../CustomLoader';
import './../../common.css';
import StatusPage from './common/StatusPage';

const { Title, Text } = Typography;

const Withdraw: React.FC = () => {
  // State management
  const [isMt5, setIsMt5] = useState(false);
  const [proofData, setProofData] = useState('');
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState<number>(0);

  // Get user information
  const { initialState, setInitialState } = useModel('@@initialState');

  // Fetch data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        await init();
        await proofSettings();
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Initialize balance from user data
  async function init() {
    setBalance(initialState?.currentUser?.wallet?.balance || 0);
  }

  // Fetch proof settings
  async function proofSettings() {
    try {
      const response = await api.proof.getProofSetting();
      response.forEach((field) => {
        field && field.status === 'Approved' ? setProofData('Approved') : setProofData('Requested');
      });
    } catch (error) {
      console.log('Withdraw page error', error);
    }
  }

  // Handle wallet withdraw option click
  function handleWalletClick() {
    setIsMt5(false);
    history.push('/Finops/WithdrawCard');
  }

  // Handle MT5 withdraw option click
  function handleMt5Click() {
    setIsMt5(true);
    history.push('/Finops/WithdrawTransfer');
  }

  return (
    <>
      {proofData !== '' && proofData === 'Approved' ? (
        <ConfigProvider>
          {loading ? (
            <CustomLoader />
          ) : (
            <PageContainer>
              <Card className="withdraw-card">
                <Row>
                  <div className="withdraw-header">
                    <Title level={2} style={{ margin: 0 }}>
                      Withdraw
                    </Title>
                  </div>
                </Row>

                <div className="withdraw-content">
                  <Title level={4} className="withdraw-subtitle">
                    Select Type of Balance Transfer
                  </Title>

                  <div className="withdraw-options">
                    <Card hoverable className="withdraw-option-card" onClick={handleWalletClick}>
                      <div className="withdraw-option-content">
                        <div className="withdraw-icon-circle">
                          <WalletOutlined className="withdraw-icon" />
                        </div>
                        <div className="withdraw-text">
                          <Text strong className="withdraw-text-title">
                            Wallet
                          </Text>
                          <Text type="secondary" className="withdraw-text-subtitle">
                            Withdraw from your main wallet
                          </Text>
                        </div>
                      </div>
                    </Card>

                    <Card hoverable className="withdraw-option-card" onClick={handleMt5Click}>
                      <div className="withdraw-option-content">
                        <div className="withdraw-icon-circle">
                          <CalculatorOutlined className="withdraw-icon" />
                        </div>
                        <div className="withdraw-text">
                          <Text strong className="withdraw-text-title">
                            MT5 Account
                          </Text>
                          <Text type="secondary" className="withdraw-text-subtitle">
                            Withdraw directly from MT5 account
                          </Text>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              </Card>

              {/* Display MT5 Transfer component if MT5 option is selected */}
              {isMt5 && (
                <Transfer
                  title={'Withdraw from MT5'}
                  type={Type.MT_TO_WALLET}
                  successMsg={`Requested withdraw from MT5 successfully!`}
                  failureMsg={`Failed to request withdraw amount from MT5!`}
                />
              )}
            </PageContainer>
          )}
        </ConfigProvider>
      ) : (
        <StatusPage />
      )}
    </>
  );
};

export default Withdraw;
