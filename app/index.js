import { StatusBar } from "expo-status-bar";
import { Button, StyleSheet, Text, View } from "react-native";
import { getStorage, ref, uploadBytes } from "firebase/storage";
import * as DocumentPicker from "expo-document-picker";
import { uriToBlob } from "../common/utils";
import { Slot } from "expo-router";
import { router } from 'expo-router';

import app from "../firebaseConfig";

const storage = getStorage(app);

export default function App() {
  //   console.log("app", app);
  console.log("storage", storage);

  async function docUploadHandler() {
    const doc = await DocumentPicker.getDocumentAsync({
      multiple: false,
      type: "audio/mpeg",
    });
    if (doc?.assets?.length > 0) {
      const file = doc.assets[0];
      const songRef = ref(storage, "songs/" + file.name);

      const blob = await uriToBlob(file.uri);
      // const blob = await response.blob();

      const result2 = await uploadBytes(songRef, blob);
    }

    // console.log("snapshot", result2);
  }

  return (
    <View style={styles.container}>
      <Button onPress={docUploadHandler} title="Add Song" />
      <Button onPress={() => {router.push("/list")}} title="Go to list" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
