import React, { useState } from 'react';
import { ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';

const Example = (props) => {
  const [dropdownOpen, setOpen] = useState(false);

  const toggle = () => setOpen(!dropdownOpen);

  return (
    <ButtonDropdown isOpen={dropdownOpen} toggle={toggle}>
      <DropdownToggle caret style={{ backgroundColor: "transparent", border:"none", color: "black", fontWeight: "700", boxShadow: "none"}}>
        Seeds
      </DropdownToggle>
      <DropdownMenu style={{zIndex: "15"}}>
        {props.torrents.map((torrent, i) => {
          return (
          <DropdownItem key={`torrentButton${i}`} style={{backgroundColor: props.hash === torrent.hash ? 'grey' : 'transparent'}} onClick={() => props.setHash(torrent.hash)}  value={torrent.hash}>
            peers:{torrent.seeds} / {torrent.peers} quality: {torrent.quality}
          </DropdownItem>
        )})}
      </DropdownMenu>
    </ButtonDropdown>
  );
}

export default Example;
