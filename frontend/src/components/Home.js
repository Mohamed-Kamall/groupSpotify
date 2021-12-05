import React from "react";
import { Button, Typography, Grid } from "@material-ui/core";
import { Create, ArrowDownward } from "@material-ui/icons";
import { Link } from "react-router-dom";
import { useStyle } from "./styles/styles";



export default function Home() {
  const style = useStyle()
  return (
    <>
      <Grid
        container
        spacing={2}
        alignItems='center'
        className={style.root}
      >
        <Grid item xs={12} lg={6}>
            <Button variant="outlined" style={{color:"#c27ba0"}} startIcon={<Create style={{color:'#c27ba0'}} />}to="/create" component={Link}>
              Create Room
            </Button>
        </Grid>
        <Grid item xs={12} lg={6}>
            <Button
              style={{ backgroundColor: "#ffd966", color: "#c27ba0" }}
              variant="contained"
              color="inherit"
              startIcon={<ArrowDownward />}
              to="/join"
              component={Link}
            >
              Join Room
            </Button>
        </Grid>
      </Grid>
    </>
  );
}
