import { Select, SelectProps } from 'antd';
import React from 'react';

interface Option {
  value: string;
  label: string;
}

interface SearchBoxProps {
  option: Option[];
}

const SelectValue: React.FC<SelectProps<Option>> = ({ option }) => {
  const handleFilter = (input: string, option: any) => {
    return (
      option?.label.toLowerCase().indexOf(input.toLowerCase()) >= 0 ||
      option?.value.toLowerCase().indexOf(input.toLowerCase()) >= 0
    );
  };

  return (
    <Select
      showSearch
      style={{ width: 200 }}
      placeholder="Select Option"
      optionFilterProp="children"
      filterOption={handleFilter}
      options={option}
      bordered
    />
  );
};

const SearchBox: React.FC<SearchBoxProps> = (props) => {
  return (
    <div>
      <SelectValue option={props.option} />
    </div>
  );
};

export default SearchBox;
