import React, { useState, useEffect } from "react";
import { Slot, Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { getStorage, listAll, ref } from "firebase/storage";



function _layout(props) {
 
  return (
    <>
      <Tabs />
      <StatusBar style="auto" />
    </>
  );
}


export default _layout;
