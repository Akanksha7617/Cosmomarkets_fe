import React, { useState,useEffect } from "react";
import {useIntl} from "@umijs/max";
import {PageContainer} from "@ant-design/pro-components";
import UserSettings from "@/pages/Admin/UserSettings";
import {Tabs} from "antd";
import Clients from "@/pages/IB/Clients";
import Income from "@/pages/IB/Income";
import Commission from "@/pages/IB/Commission";
import Payment from "@/pages/Admin/Payment";
import CRMsettings from "./CRMsettings";
import AdminSettings from "./AdminSettings"
import CustomLoader from "../CustomLoader";
import { api, ShowError } from "@/components/common/api";
import { Encrypt } from '@/generated/services/Encrypt';

const encryptor = new Encrypt();

const Admin: React.FC = () => {
  const [adminflag, setAdminFlag] = useState(false);
  const [loading,setLoading] = useState(true)
  
  useEffect(() => {
    const fetchData = async () => {
      try {
       
        const responseEncrypt = await api.app.getMeEncrypt();
        console.log("Admin getME",responseEncrypt);
        const response = encryptor.decrypData(responseEncrypt.encryptedData);
        const userResponse = JSON.parse(response);
       // adminflag = userResponse.IsSuperAdmin;
        setAdminFlag(userResponse.IsSuperAdmin);
        console.log("Response:", userResponse);
        console.log("ISsUperAdmin",adminflag)
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData(); // Call the async function
  }, []);


  const intl = useIntl();
  return (
   

  
    <PageContainer>
      {
        loading ? ( <CustomLoader/>
        ):(
    
      <Tabs
        defaultActiveKey="1"
        size={"small"}
        items={[
          {
            key: '1',
            label: (
              <span>
                {/* <div className='users-tab'>
                  <img src='\images\users_icon_voco.png' style={{ width: '45px', height: '40px' }} />
                </div> */}
                <h5>User Settings</h5>

              </span>
            ),
            children: <UserSettings />,
          },
          {
            key: '2',
            label:  (
              <span>
                {/* <div className='users-tab'>
                  <img src='\images\users_icon_voco.png' style={{ width: '45px', height: '40px' }} />
                </div> */}
                <h5>Payment Gateways</h5>

              </span>
            ),
            children: <Payment/>,
          },
         /*  {
            key: '3',
            label: `CRM Settings`,
            children: <CRMsettings/>,
          }, */
          {
            key: '3',
            label:  (
              <span>
                {/* <div className='users-tab'>
                  <img src='\images\users_icon_voco.png' style={{ width: '45px', height: '40px' }} />
                </div> */}
                <h5>Admin Settings</h5>

              </span>
            ),
            children: adminflag ? <AdminSettings/> : null,
          },
        ]}

      />
      ) }

    </PageContainer>
  );
};

export default Admin;