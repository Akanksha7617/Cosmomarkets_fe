import { api } from '@/components/common/api';
import { AppUserModel } from '@/generated';
import React, { useEffect, useState } from 'react'
import Dashboard from './Dashboard';
import AdminDashboard from '../Admin/AdminDashboard';

const SuperDashBoardPage: React.FC = () => {

    // const [userData, setUserData] = useState<AppUserModel>({});
    const [isAdmin, setIsAdmin] = useState<boolean>(true);
    useEffect(() => {

        getUser()
    }, [])

    const getUser = async () => {
        const userResponse = await api.app.getMe();
        // setUserData(userResponse);
        { userResponse.roles?.includes("Admin") ? setIsAdmin(true) : setIsAdmin(false) }

    }

    return (
        <div className='main-container'>
            {
                isAdmin ? <Dashboard/> : <AdminDashboard/>
            }


        </div>
    )
}

export default SuperDashBoardPage