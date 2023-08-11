import React, { useState, useEffect } from "react";
import { Slot, Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, StyleSheet, FlatList } from "react-native";
import { Button, Text, ListItem, Avatar } from "@rneui/themed";
import { LinearProgress } from "@rneui/themed";
import * as DocumentPicker from "expo-document-picker";
import { ActivityIndicator } from "react-native";
import * as FileSystem from "expo-file-system";

import {
  getStorage,
  listAll,
  ref,
  uploadBytesResumable,
  getDownloadURL
} from "firebase/storage";

import app from "../../firebaseConfig";
import { uriToBlob } from "../../common/utils";

import { AntDesign } from "@expo/vector-icons";

const storage = getStorage(app);

function Cloud() {
  const [songs, setSongs] = useState({
    loading: true,
    data: [],
  });

  const [progress, setProgress] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setSongs((state) => ({
      ...state,
      loading: true,
    }));
    const songsRef = ref(storage, "/songs");
    const result = await listAll(songsRef);
    // console.log("list result", result);
    let songsResult = [];
    result.items.forEach((itemRef, index) => {
      const fileName = itemRef.name;
      const fullPath = itemRef.fullPath;
      const bucket = itemRef.bucket;

      songsResult.push({
        fileName,
        fullPath,
        bucket,
        itemRef,
      });
    });
    setSongs((state) => ({
      ...state,
      loading: false,
      data: songsResult,
    }));
  }

  async function docUploadHandler() {
    // TODO: Check for permission
    const doc = await DocumentPicker.getDocumentAsync({
      multiple: false,
      type: "audio/mpeg",
    });
    if (doc?.assets?.length > 0) {
      const file = doc.assets[0];
      const songRef = ref(storage, "songs/" + file.name);

      const blob = await uriToBlob(file.uri);
      // const blob = await response.blob();

      const uploadTask = uploadBytesResumable(songRef, blob);
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Observe state change events such as progress, pause, and resume
          // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
          const progress = snapshot.bytesTransferred / snapshot.totalBytes;
          setProgress(progress);
        },
        (error) => {
          // Handle unsuccessful uploads
          setProgress(false);
        },
        () => {
          console.log("Upload Done");
          // Handle successful uploads on complete
          // For instance, get the download URL: https://firebasestorage.googleapis.com/...
          setProgress(false);
          // getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          //   console.log("File available at", downloadURL);
          // });
        }
      );
    }

    // console.log("snapshot", result2);
  }

  // Checks if gif directory exists. If not, creates it
  async function ensureDirExists(dir) {
    const dirInfo = await FileSystem.getInfoAsync(dir);
    if (!dirInfo.exists) {
      console.log(
        "Songs directory doesn't exist, creating...",
        FileSystem.documentDirectory
      );
      await FileSystem.makeDirectoryAsync(
        `${FileSystem.documentDirectory}${dir}`,
        { intermediates: true }
      );
    }
  }

  const callback = (downloadProgress) => {
    const progress =
      downloadProgress.totalBytesWritten /
      downloadProgress.totalBytesExpectedToWrite;
    setProgress(progress);
  };

  async function downloadFile(file) {
    setProgress(0.1)
    const downloadURL = await getDownloadURL(ref(storage, file.fullPath))
    // if songs folder exist
    await ensureDirExists("spotify-clone/songs");
    // if not create a folder
    console.log("file", file);
    console.log(
      "local path",
      `${FileSystem.documentDirectory}/spotify-clone/songs/${file.fileName}`
    );
    const downloadResumable = FileSystem.createDownloadResumable(
      downloadURL,
      `${FileSystem.documentDirectory}/spotify-clone/songs/${file.fileName}`,
      {},
      callback
    );

    try {
      const { uri } = await downloadResumable.downloadAsync();
      console.log("Finished downloading to ", uri);
      setProgress(false);
    } catch (e) {
      console.error(e);
      setProgress(false);
    }
  }

  const renderItem = ({ item }) => (
    <ListItem onPress={() => downloadFile(item)}>
      <ListItem.Content>
        <ListItem.Title>{item.fileName}</ListItem.Title>
      </ListItem.Content>
      <AntDesign name="clouddownload" size={24} color="black" />
    </ListItem>
  );

  return (
    <View style={styles.container}>
      <Text>Manage Cloud Data</Text>
      {songs?.loading ? (
        <ActivityIndicator color="#2089dc" />
      ) : (
        <FlatList
          keyExtractor={(item, index) => index.toString()}
          data={songs?.data}
          renderItem={renderItem}
        />
      )}

      {!!progress && (
        <LinearProgress
          color="primary"
          value={progress}
          style={styles.progress}
        />
      )}

      <Button
        title="Add Song"
        onPress={docUploadHandler}
        disabled={!!progress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "space-between",
  },
  progress: {
    marginBottom: 6,
  },
});

export default Cloud;
