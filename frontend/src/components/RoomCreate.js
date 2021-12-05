import {
  Typography,
  FormControl,
  FormHelperText,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Grid,
  CardActions,
  Button,
} from "@material-ui/core";
import React, { useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { useStyle } from "./styles/styles";
const axios = require("axios");

export default function RoomCreate() {
  const style = useStyle()
  let history = useHistory();
  const [canPause, setCanPause] = useState(true);
  const [votes, setVotes] = useState(2);

  const handleCreateRoom = () => {
    axios
      .post("api/create-room", {
        guest_can_pause: canPause,
        vote_to_skip: votes,
      })
      .then((response) => {
        console.log(response.data);
        history.push(`/room/${response.data.code}`);
      });
  };

  return (
    <>
      <Grid container spacing={1} className={style.creatRoom}>
        <Grid item xs={12}>
          <Typography variant="h4" gutterBottom style={{color:'#c27ba0'}}>
            Create a Room
          </Typography>
        </Grid>
        <Grid item xs={12} lg={6}>
          <div
            style={{
              backgroundColor: "#f3f6f4f3",
              borderRadius: "10px",
              padding: "10px",
              textAlign: "center",
            }}
          >
            <FormControl component="fieldset">
              <FormHelperText align="center" style={{ fontSize: "18px" }}>
                Guest Control Of Playback
              </FormHelperText>
              <RadioGroup
                row
                aria-label="Control"
                defaultValue="true"
                onChange={(e) =>
                  e.target.value === "true"
                    ? setCanPause(true)
                    : setCanPause(false)
                }
              >
                <FormControlLabel
                  value="true"
                  control={<Radio color="primary" />}
                  label="play/pause"
                  labelPlacement="bottom"
                />
                <FormControlLabel
                  value="false"
                  control={<Radio color="secondary" />}
                  label="no control"
                  labelPlacement="bottom"
                />
              </RadioGroup>
            </FormControl>
          </div>
        </Grid>
        <Grid item xs={12} lg={6}>
          <div
            style={{
              backgroundColor: "#f3f6f4f3",
              borderRadius: "10px",
              padding: "15px",
              textAlign: "center",
            }}
          >
            <FormControl>
              <FormHelperText
                align="center"
                style={{ fontSize: "18px", marginBottom: "24px" }}
              >
                Votes To Skip Song
              </FormHelperText>
              <TextField
                required={true}
                type="number"
                defaultValue={votes}
                onChange={(e) => setVotes(e.target.value)}
                inputProps={{ min: 1, style: { textAlign: "center" } }}
              />
            </FormControl>
          </div>
        </Grid>

        <Grid item xs={12}>
          <CardActions
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "20px",
            }}
          >
            <Button
              variant="outlined"
              color="secondary"
              component={Link}
              to="/"
            >
              Back
            </Button>
            <Button
              variant="contained"
              style={{backgroundColor:'#c27ba0',color:'#ffffff'}}
              onClick={handleCreateRoom}
            >
              Create
            </Button>
          </CardActions>
        </Grid>
      </Grid>
    </>
  );
}
