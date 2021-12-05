import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import {
  Grid,
  Typography,
  Button,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  FormHelperText,
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider,
  Snackbar,
  Avatar,
  CircularProgress,
  LinearProgress,
  Card,
  CardContent,
} from "@material-ui/core";
import {
  Star,
  Settings,
  CheckCircleOutline,
  CloseOutlined,
} from "@material-ui/icons";
import MusicPlayer from "./MusicPlayer";
import { useStyle } from "./styles/styles";

export default function Room({ clearRoom }) {
  const [canPause, setCanPause] = useState(false);
  const [voteToSkip, setvoteToSkip] = useState(2);
  const [spotify_authenticated, setSpotify_authenticated] = useState(false);

  const [canPause_, setCanPause_] = useState(canPause);
  const [voteToSkip_, setvoteToSkip_] = useState(voteToSkip);
  const [error, setError] = useState("");

  const [isHost, setIsHost] = useState(false);
  const { roomCode } = useParams();
  const [code, setCode] = useState("");

  const [song, setSong] = useState({});

  const history = useHistory();
  const style = useStyle();

  const [isOpen, setIsOpen] = useState(false);
  const [open, setOpen] = useState(false);

  const authenticateSpotify = () => {
    axios.get("/spotify/is-auth").then((response) => {
      setSpotify_authenticated(response.data.status);
      if (!response.data.status) {
        axios.get("/spotify/auth-url").then((response) => {
          window.location.replace(response.data.url);
        });
      }
    });
  };

  const handleSubscribe = () => {
    axios
      .patch("/api/update-room", {
        code: code,
        vote_to_skip: voteToSkip_,
        guest_can_pause: canPause_,
      })
      .then((response) => {
        if (response.statusText === "OK") {
          setOpen(true);
          window.location.reload();
        }
      })
      .catch((error) => {
        console.log(error.message);
        setError("Room not found");
      });
  };

  const getCurrentSong = () => {
    axios
      .get("/spotify/current-song")
      .then((response) => {
        setSong(response.data);
      })
      .catch((error) => console.log(error));
  };

  
  const getRoomDetails = () => {
    axios
      .get(`/api/get-room?roomCode=${roomCode}`)
      .then((response) => {
        const data = response.data;
        setCanPause(data.guest_can_pause);
        setvoteToSkip(data.vote_to_skip);
        setIsHost(data.is_host);
        authenticateSpotify();
        
      })
      .catch((error) => {
        console.log(error.message);
        clearRoom();
        history.push("/");
      });
  };

  useEffect(() => {
    getRoomDetails();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => getCurrentSong(), 1000);
    return () => clearInterval(interval);
  }, [song.time]);


  const handleLeave = () => {
    axios.post("/api/leave-room").then((response) => {
      if (response.statusText === "OK") {
        clearRoom();
        history.push("/");
      }
    });
  };
  return (
    <>
      <div className={style.toolbar}/>
      <Grid container spacing={1} align="center" className={style.roomJoin}>
        <Button
          color="primary"
          variant="text"
          onClick={() => setIsOpen(true)}
          style={{ position: "absolute", top: "5px", right: "5px" }}
        >
          <Settings />
        </Button>

        <Dialog
          open={isOpen && isHost}
          onClose={() => setIsOpen(false)}
          fullWidth
          style={{ textAlign: "center" }}
        >
          <DialogTitle>Update Room</DialogTitle>
          <DialogContent>
            <TextField
              required={true}
              variant="outlined"
              value={code}
              placeholder="Type room cood..."
              label="code"
              error={Boolean(error)}
              helperText={error}
              fullWidth
              onChange={(e) => setCode(e.target.value.trim())}
            />
          </DialogContent>
          <Divider />
          <DialogContent>
            <FormControl component="fieldset">
              <FormHelperText align="center" style={{ fontSize: "18px" }}>
                Guest Control Of Playback
              </FormHelperText>
              <RadioGroup
                row
                aria-label="Control"
                defaultValue={canPause_? "true" : "false"}
                onChange={(e) =>
                  e.target.value === "true"
                    ? setCanPause_(true)
                    : setCanPause_(false)
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
          </DialogContent>
          <Divider />
          <DialogContent>
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
                defaultValue={voteToSkip}
                onChange={(e) => setvoteToSkip_(e.target.value)}
                inputProps={{ min: 1, style: { textAlign: "center" } }}
              />
            </FormControl>
          </DialogContent>
          <DialogActions
            style={{ display: "flex", justifyContent: "space-between" }}
          >
            <Button onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button disabled={!code} onClick={() => handleSubscribe()}>
              Update
            </Button>
          </DialogActions>
        </Dialog>

        <Badge
          badgeContent={isHost?
            <img
              src="../../static/images/host2.png"
              style={{
                position: "absolute",
                top: "-50px",
                left: "-25px",
                width: "60px",
                height: "80px",
              }}
            />:<img
            src="../../static/images/relief.png"
            style={{
              position: "absolute",
              top: "-30px",
              left: "-25px",
              width: "50px",
              height: "39px",
            }}
          />
          }
        />
        <Grid item xs={12}>
          <Typography variant="h4">{roomCode}</Typography>
        </Grid>
        {song.album_cover ? (
          <>
            <Grid item xs={12} lg={6}>
              <MusicPlayer song={song} />
            </Grid>
            <Grid item xs={12} lg={6}>
              <Card style={{ backgroundColor: "#d9ead3" }}>
                <CardContent>
                  <Typography
                    variant="subtitle2"
                    style={{ height: "240px" ,overflowY:'auto',}}
                  >
                    LYRICS:
                    <br /> {song.lyrics ? song.lyrics.replace('Paroles de la chanson ','') : "Not Available"}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </>
        ) : (
          <Grid item xs={12}>
            <CircularProgress />
          </Grid>
        )}

        <Grid item xs={12} align="end">
          <Button color="secondary" variant="contained" onClick={handleLeave}>
            Leave Room
          </Button>
        </Grid>
      </Grid>
    </>
  );
}
