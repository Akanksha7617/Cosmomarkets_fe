import React from "react";
import {Card, CardProps, theme} from "antd";


const MyCard: React.FC<CardProps> = ({bordered,
                                              children,
                                              ...restProps
                                            }) => {

  const {token} = theme.useToken();

  return (
    <Card
      {...restProps}
      onMouseEnter={(e) => {
        const card = e.currentTarget;
        card.style.transition = "all 0.3s";
        //card.style.backgroundColor = token.colorBgTextHover;
        card.style.color = token.colorPrimaryHover;
      }}
      onMouseLeave={(e) => {
        const card = e.currentTarget;
        card.style.transition = "all 0.3s";
        //card.style.backgroundColor = token.colorBgContainer;
        card.style.color = token.colorText;
      }}
    >
      {children}
    </Card>
  );
};

export default MyCard;
