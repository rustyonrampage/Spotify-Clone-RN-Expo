import React, { useState, useEffect } from "react";
import { Slot, Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { lightColors, createTheme, ThemeProvider } from "@rneui/themed";

import { getStorage, listAll, ref } from "firebase/storage";

const theme = createTheme({
  components: {
    Text: {
      style: {
        fontFamily: "Poppins_400Regular",
      },
    },
    Button: {
      buttonStyle: {},
      titleStyle: {
        fontFamily: "Poppins_500Medium",
      },
      style: {},
    },
  },
  lightColors: {
    ...Platform.select({
      default: lightColors.platform.android,
      ios: lightColors.platform.ios,
    }),
  },
});

function _layout(props) {
  return (
    <ThemeProvider theme={theme}>
      <Tabs />
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default _layout;
