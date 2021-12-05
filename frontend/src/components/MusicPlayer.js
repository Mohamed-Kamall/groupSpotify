import React, { useState } from "react";
import {
  Grid,
  Typography,
  Card,
  IconButton,
  LinearProgress,
  Snackbar,
  CardContent,
  Badge,
} from "@material-ui/core";
import { PlayArrow, Pause, SkipNext } from "@material-ui/icons";
import axios from "axios";

export default function MusicPlayer({ song }) {
  const progress = (song.time / song.duration) * 100;

  const [pop, setPop] = useState(false);

  const playSong = () => {
    axios
      .put("/spotify/play-song")
      .then((response) => {
        console.log(response.statusText);
      })
      .catch((error) => console.log(error));
  };

  const pauseSong = () => {
    axios
      .put("/spotify/pause-song")
      .then((response) => {
        console.log(response.statusText);
      })
      .catch((error) => {
        setPop(true);
      });
  };

  const skipSong = () => {
    axios
      .post("/spotify/skip-song")
      .then((res) => console.log(res.statusText))
      .catch((err) => console.log(err.message));
  };

  return (
    <Card>
      <Grid spacing={1} container alignItems="center">
        <Grid item align="center" xs={4} lg={6}>
          <img src={song.album_cover} height="100%" width="100%" />
        </Grid>
        <Grid item align="center" xs={8} lg={6}>
          <Typography variant="body2">{song.title}</Typography>
          <Typography color="textSecondary" variant="subtitle2">
            {song.artist}
          </Typography>
          <div>
            <IconButton
              onClick={() => {
                song.is_playing ? pauseSong() : playSong();
              }}
            >
              {song.is_playing ? <Pause /> : <PlayArrow />}
            </IconButton>
            <Badge
              badgeContent={song.votes + "/" + song.votes_required}
              color={
                song.votes == song.votes_required ? "success" : "secondary"
              }
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
            >
              <IconButton onClick={() => skipSong()}>
                <SkipNext />
              </IconButton>
            </Badge>
          </div>
        </Grid>
      </Grid>
      <LinearProgress
        variant="determinate"
        color={song.is_playing ? "primary" : "secondary"}
        value={progress}
      />
      <Snackbar
        open={pop}
        autoHideDuration={1000}
        onClose={() => setPop(false)}
        message="Not Allowed"
      />
    </Card>
  );
}
