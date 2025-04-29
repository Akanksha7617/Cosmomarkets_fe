import React from "react";
 import "../../common.css"
import { Button, Card, Checkbox, Form, Input, Select } from "antd";
import {history} from '@umijs/max'


const IBcode: React.FC=()=>{
    return(
        <><Button onClick={() => history.push('/ProfileSettings')} className="back-btn">Back</Button><Card title="Introducing Broker" style={{ backgroundColor: '#f2f2f2', marginBottom: 20, marginTop: 20 }}>
            <Card title="Your IB" headStyle={{ backgroundColor: '#f89d42', color: 'white' }} className="profile-cards">
                <Form.Item label="IB Code">
                    <Input placeholder="12345" />
                </Form.Item>
            </Card>
            <Card title="IB Details" className='ib-detail' headStyle={{ backgroundColor: '#f89d42', color: 'white' }}>
                <Form.Item label="Please select which country You are operating your IB Program from:">
                    <Select>
                        <Select.Option value="demo">Demo</Select.Option>
                    </Select>
                </Form.Item>
                <Form.Item label="What is the main region you will be referring clients from?">
                    <Select>
                        <Select.Option value="demo">Demo</Select.Option>
                    </Select>
                </Form.Item>
                <p>Do you hold relevant regulatory/licensing permissions in the EEA to refer clients?</p>
                <Form.Item label="Yes">
                    <Checkbox></Checkbox>
                </Form.Item>
                <Form.Item label="No">
                    <Checkbox></Checkbox>
                </Form.Item>
            </Card>
            <Card title="Program Information" headStyle={{ backgroundColor: '#f89d42', color: 'white' }}>
                <div className='img-para'>
                    <div className='program-img'>
                        <img src="./images/program-information.png" alt="Image" style={{ width: 190, height: 200, verticalAlign: 'bottom', marginBottom: 20, marginTop: 20 }} />
                    </div>

                    <div className='programinfo'>
                        <Form.Item label="What type of IB program do you operate?">
                            <Select>
                                <Select.Option value="demo">Demo</Select.Option>
                            </Select>
                        </Form.Item>
                        <Form.Item label="Do you hold a regulatory license/authorisation?">
                            <Select>
                                <Select.Option value="demo">Demo</Select.Option>
                            </Select>
                        </Form.Item>
                        <Form.Item label="What is the frequency of communication you have with clients?">
                            <Select>
                                <Select.Option value="demo">Demo</Select.Option>
                            </Select>
                        </Form.Item>
                    </div>

                </div>
                <div>
                    <div className='checkbox'>
                        <Form.Item>
                            <Checkbox>I agree to IB Terms and Conditions</Checkbox>
                        </Form.Item>
                        <Form.Item>
                            <Checkbox>I declare and confirm that I accept all terms and conditions of Fiscal.</Checkbox>
                        </Form.Item>
                    </div>
                </div>
                <div className='programinf' style={{ color: 'black' }}>
                    <p>That the information provided in this form is accurate and complete;</p>
                    <p>It is my responsibility to advise TTS Markets as soon as possible if any of the information changes; and</p>
                    <p>TTS Markets may take steps to verify the information, including contacting my clients to validate the nature of my services.</p>
                    <p>I must not display TTS Markets's licensing details on any website or via any other communication channel</p>
                </div>
                <Form.Item>
                    <Button type="primary" className="submit-btn">Submit</Button>
                </Form.Item>
            </Card>
        </Card></>
    )
}
export default IBcode
