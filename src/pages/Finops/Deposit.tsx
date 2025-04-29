import { api } from '@/components/common/api';
import { Type } from '@/generated';
import { Transfer } from '@/pages/Finops/common/Transfer';
import { useModel } from '@@/exports';
import { CalculatorOutlined, WalletOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { history } from '@umijs/max';
import { Card, ConfigProvider, theme, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
import CustomLoader from '../CustomLoader';
import StatusPage from './common/StatusPage';

const { Title, Text } = Typography;

/**
 * Main Deposit Component that serves as the entry point for deposit functionality
 */
const Deposit: React.FC = () => {
  const { token } = theme.useToken();
  const [isMt5, setIsMt5] = useState(false);
  const { initialState } = useModel('@@initialState');
  const [proofData, setProofData] = useState('');
  const [loading, setLoading] = useState(true);

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

  async function init() {
    // Initialize data if needed
  }

  async function proofSettings() {
    try {
      const response = await api.proof.getProofSetting();
      response.forEach((field) => {
        field && field.status === 'Approved' ? setProofData('Approved') : setProofData('Requested');
      });
    } catch (error) {
      console.log(error);
    }
  }

  // Handle wallet deposit option click
  function handleWalletClick() {
    setIsMt5(false);
    history.push('/Finops/DepositCard');
  }

  // Handle MT5 deposit option click
  function handleMt5Click() {
    setIsMt5(true);
    history.push('/Finops/DepositTransfer');
  }

  return (
    <>
      {proofData !== '' && proofData === 'Approved' ? (
        <ConfigProvider>
          {loading ? (
            <CustomLoader />
          ) : (
            <PageContainer>
              <Card className="deposit-card">
                <div className="deposit-header">
                  <Title level={2} className="deposit-title">
                    Deposit
                  </Title>
                </div>

                <div className="deposit-content">
                  <Title level={4} className="deposit-subtitle">
                    Select Type of Balance Transfer
                  </Title>

                  <div className="deposit-options">
                    <Card hoverable className="deposit-option-card" onClick={handleWalletClick}>
                      <div className="option-container">
                        <div className="icon-circle">
                          <WalletOutlined className="deposit-icon" />
                        </div>
                        <div className="card-text">
                          <Text strong className="card-text-strong">
                            Wallet
                          </Text>
                          <Text className="card-text-secondary" type="secondary">
                            Deposit to your main wallet
                          </Text>
                        </div>
                      </div>
                    </Card>

                    <Card hoverable className="deposit-option-card" onClick={handleMt5Click}>
                      <div className="option-container">
                        <div className="icon-circle">
                          <CalculatorOutlined className="deposit-icon" />
                        </div>
                        <div className="card-text">
                          <Text strong className="card-text-strong">
                            MT5 Account
                          </Text>
                          <Text className="card-text-secondary" type="secondary">
                            Deposit directly to MT5 account
                          </Text>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              </Card>

              {/* Conditional Render */}
              {isMt5 && (
                <Transfer
                  title={'Deposit to MT5'}
                  type={Type.WALLET_TO_MT}
                  successMsg={{
                    content: 'Requested deposit to MT5 successfully!',
                    icon: <span className="orange-success-icon"> ✔ </span>,
                    className: 'orange-success-notification',
                    duration: 3,
                  }}
                  failureMsg={{
                    content: 'Failed to request deposit amount to MT5!',
                    icon: <span className="orange-error-icon"> ✘ </span>,
                    className: 'orange-error-notification',
                    duration: 3,
                  }}
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

export default Deposit;
