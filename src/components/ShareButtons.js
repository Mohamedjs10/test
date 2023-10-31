import React from "react";
import Box from "@mui/material/Box";

import {
  FacebookMessengerShareButton,
  FacebookIcon,
  WhatsappShareButton,
  WhatsappIcon,
  EmailShareButton,
} from "react-share";
function ShareButton() {
  return (
    <Box sx={{ display: "flex", gap: 1 }}>
      <FacebookMessengerShareButton
        url={
          "https://www.youtube.com/watch?v=9WzIACv_mxs&ab_channel=frontendWala%28..%29"
        }
      >
        <FacebookIcon size={40} round={true}></FacebookIcon>
      </FacebookMessengerShareButton>
      <WhatsappShareButton
        url={
          "https://www.youtube.com/watch?v=9WzIACv_mxs&ab_channel=frontendWala%28..%29"
        }
      >
        <WhatsappIcon size={40} round={true}></WhatsappIcon>
      </WhatsappShareButton>
      <EmailShareButton
        url={
          "https://www.youtube.com/watch?v=9WzIACv_mxs&ab_channel=frontendWala%28..%29"
        }
      >
        <img
          src="https://www.freepnglogos.com/uploads/email-png/email-messages-icon-16.png"
          width={40}
          height={40}
          alt="Email"
        ></img>
      </EmailShareButton>
    </Box>
  );
}

export default ShareButton;
