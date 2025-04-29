import { Space, DatePicker } from 'antd';
import React from 'react';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

const onChange = (date: any) => {
  if (date) {
    console.log('Date: ', date);
  } else {
    console.log('Clear');
  }
};

const onRangeChange = (dates: any, dateStrings: [string, string]) => {
  if (dates) {
    console.log('From: ', dates[0], ', to: ', dates[1]);
    console.log('From: ', dateStrings[0], ', to: ', dateStrings[1]);
  } else {
    console.log('Clear');
  }
};

const rangePresets = [
  {
    label: 'Last 7 Days',
    value: [dayjs().add(-7, 'd'), dayjs()],
  },
  {
    label: 'Last 14 Days',
    value: [dayjs().add(-14, 'd'), dayjs()],
  },
  {
    label: 'Last 30 Days',
    value: [dayjs().add(-30, 'd'), dayjs()],
  },
  {
    label: 'Last 90 Days',
    value: [dayjs().add(-90, 'd'), dayjs()],
  },
];

interface DropdownListProps {
  presets: any;
}

const SelectDate: React.FC<DropdownListProps> = ({ presets }) => {
  return (
    <Space direction="vertical" size={12}>
      <RangePicker
        presets={presets}
        showTime
        format="YYYY/MM/DD HH:mm:ss"
        // onChange={onRangeChange}
        style={{ backgroundColor: 'rgba(128, 128, 128, 0.2)' }}
      />
    </Space>
  );
};

const DateRange: React.FC = () => {
  return (
    <div>
      <SelectDate presets={rangePresets} />
    </div>
  );
};

export default DateRange;
