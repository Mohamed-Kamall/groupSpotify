import axios from "axios";
import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
  Link,
} from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Avatar,
  Divider,
  IconButton,
  CssBaseline,
} from "@material-ui/core";
import { Brightness2, Brightness5 } from "@material-ui/icons";
import Home from "./Home";
import Room from "./Room";
import RoomCreate from "./RoomCreate";
import RoomJoin from "./RoomJoin";
import { useStyle } from "./styles/styles";
export default function App() {
  const style = useStyle();
  const [roomCode, setRoomCode] = useState(null);
  const [dark, setDark] = useState(true);
  useEffect(() => {
    axios
      .get("api/in-room")
      .then((response) => {
        setRoomCode(response.data.code);
      })
      .catch((error) => console.log(error.message));
  }, []);

  const clearRoomCode = () => {
    setRoomCode(null);
  };
  return (
    <>
      <AppBar position="static" style={{ backgroundColor: "#fff2cc" }}>
        <Toolbar>
          <Avatar
            src="../../static/images/Spoofy.png"
            style={{ width: "45px", height: "45px" }}
          />
          <Divider orientation="vertical" flexItem variant="middle" light />
          <Typography
            variant="h5"
            style={{ color: "#c27ba0", fontWeight: 600, flexGrow: 1 }}
          >
            GROUP SPOTIFY
          </Typography>
          <IconButton onClick={() => setDark(!dark)}>
            {dark ? <Brightness5 /> : <Brightness2 />}
          </IconButton>
        </Toolbar>
      </AppBar>
      
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          background: dark ? "#1a1721" : "#ffffff",
        }}
      >
        <Router>
          <Switch>
            <Route exact path="/">
              {roomCode ? <Redirect to={`/room/${roomCode}`} /> : <Home />}
            </Route>
            <Route path="/join">
              <RoomJoin />
            </Route>
            <Route path="/create">
              <RoomCreate />
            </Route>
            <Route path="/room/:roomCode">
              <Room clearRoom={clearRoomCode} />
            </Route>
          </Switch>
        </Router>
      </div>
    </>
  );
}
