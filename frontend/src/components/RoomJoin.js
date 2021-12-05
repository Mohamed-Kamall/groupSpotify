import React, { useState } from "react";
import { Grid, Typography, Button, TextField, Card } from "@material-ui/core";
import { Link,useHistory } from "react-router-dom";
import axios from "axios";
import { useStyle } from "./styles/styles";

export default function RoomJoin() {
  const style = useStyle()
  let history = useHistory()
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const JoinRoomHandler = ()=>{
    axios.post('api/join-room',{
      roomCode : code
    }).then(response =>{
      if(response.statusText==='OK'){
        history.push(`/room/${code}`)
      }
    }).catch((error)=>{console.log(error.message); setError('Room not found')})
  }
  
  return (
    <>
      <Grid container spacing={1} className={style.roomJoin}>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom color="primary">
            Join a Room
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <TextField
            variant="outlined"
            value={code}
            placeholder="Type room cood..."
            label="code"
            error={Boolean(error)}
            helperText={error}
            fullWidth
            onChange={(e)=>setCode(e.target.value.trim())}
          />
        </Grid>
        <Grid item xs={12}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: "20px",
            }}
          >
            <Button variant="outlined" color="primary" onClick={JoinRoomHandler} disabled={code?false:true}>
              Join
            </Button>
            <Button
              variant="contained"
              color="secondary"
              to="/"
              component={Link}
            >
              Back
            </Button>
          </div>
        </Grid>
      </Grid>
    </>
  );
}
