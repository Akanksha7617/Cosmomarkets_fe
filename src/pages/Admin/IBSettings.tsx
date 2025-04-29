import { Tabs } from 'antd'
import TabPane from 'antd/es/tabs/TabPane'
import React from 'react'
import './Settings.css'
import GroupSettings from './IB/GroupSettings'
import DateRange from '@/tools/DateRange'
import InputSearch from '@/tools/InputSearch'
import LevelSettings from './IB/LevelSettings'
import IBDetails from './IB/IBDetails'

const IBSettings: React.FC = () => {
    const tabStyles = {
        width: '33.33%',
        textAlign: 'center',
      };
  return (
    <div>
        <Tabs defaultActiveKey='1'>
            <TabPane tab="Group Settings" key="1">
               <GroupSettings/>
            </TabPane>
            <TabPane tab="Levels Settings" key="2">
                <LevelSettings/>
            </TabPane>
            <TabPane tab="IB Details" key="3">
                <IBDetails/>
            </TabPane>
        </Tabs>
    </div>
  )
}

export default IBSettings
