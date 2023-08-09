import React, { useState, useEffect } from "react";
import { Slot, Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { getStorage, listAll, ref } from "firebase/storage";

import app from "../firebaseConfig";
const storage = getStorage(app);

function _layout(props) {
  const [songs, setSongs] = useState({
    loading: true,
    data: [],
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const songsRef = ref(storage, "/songs");
    const result = await listAll(songsRef);
    // console.log("list result", result);
    result.items.forEach((itemRef, index)=>{
        console.log('item ', itemRef, index)
    })
  }

  return (
    <>
      <Tabs />
      <StatusBar style="auto" />
    </>
  );
}

_layout.propTypes = {};

export default _layout;
