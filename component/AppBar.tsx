"use client"
import * as React from "react"
import AppBar from "@mui/material/AppBar"
import Box from "@mui/material/Box"
import Toolbar from "@mui/material/Toolbar"
import Typography from "@mui/material/Typography"
import { KR } from "country-flag-icons/react/3x2"

export default function ButtonAppBar() {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar
          variant="dense"
          // sx={{ minHeight: "12px" }}
          style={{
            minHeight: "12px",
            backgroundColor: "#383434",
            justifyContent: "space-between",
          }}
        >
          <Typography fontWeight="semibold">GPT LANG</Typography>
          <div className="flex gap-1">
            <KR className="w-4" />
            <Typography variant="caption">한국어</Typography>
          </div>
          {/* <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            News
          </Typography>
          <Button color="inherit">Login</Button> */}
        </Toolbar>
      </AppBar>
    </Box>
  )
}
