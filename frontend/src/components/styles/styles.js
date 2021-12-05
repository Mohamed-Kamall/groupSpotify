import { makeStyles } from "@material-ui/core";

export const useStyle = makeStyles((theme) => ({
  toolbar: theme.mixins.toolbar,
  root: {
    padding: "15px",
    borderRadius: "10px",
    boxShadow: "1px 1px 20px 1px #5b5b5b",
    width: "40%",
    height: "20vh",
    textAlign: "center",
    backgroundColor: "#f3f6f4f3",
    [theme.breakpoints.down("sm")]: {
      width: "90%",
      height: "30vh",
    },
  },
  creatRoom: {
    width: "40%",
    [theme.breakpoints.down("sm")]: {
      width: "90%",
    },
  },
  roomJoin: {
    position: 'relative',
    backgroundColor: "#fff2cc",
    borderRadius: "10px",
    padding: "15px",
    width: "60%",
    [theme.breakpoints.down("sm")]: {
      width: "90%",
    },
  },
}));
