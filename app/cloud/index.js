import React, { useState, useEffect } from "react";
import { Slot, Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";

import { getStorage, listAll, ref } from "firebase/storage";

import app from "../../firebaseConfig";
const storage = getStorage(app);

function Cloud() {
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
    result.items.forEach((itemRef, index) => {
      console.log("item ", itemRef, index);
    });
  }

  return <View>
    <Text>Manage Cloud Data</Text>
  </View>;
}

export default Cloud;
