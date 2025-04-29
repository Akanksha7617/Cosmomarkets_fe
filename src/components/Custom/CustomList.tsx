import React, {Component} from 'react';

type KeyValue = {
  key: string;
  value: string;
}

interface CustomProps<T> {
  data: T[];
  renderItem: (item: T) => React.ReactNode;
  style?: React.CSSProperties;
}

class CustomList<T> extends Component<CustomProps<T>> {
  render() {
    const {data, renderItem, style} = this.props;
    return (
      <div style={style}>
        {data.map(item => renderItem(item))}
      </div>
    );
  }
}

export {CustomList, KeyValue};
