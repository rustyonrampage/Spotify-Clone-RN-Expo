import React, { useState, useEffect } from "react";
import { Slot, Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, StyleSheet, FlatList } from "react-native";
import { Button, Text, ListItem, Avatar, Dialog } from "@rneui/themed";
import { LinearProgress } from "@rneui/themed";
import * as DocumentPicker from "expo-document-picker";
import { ActivityIndicator } from "react-native";
import * as FileSystem from "expo-file-system";

import {
  getStorage,
  listAll,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

import app from "../../firebaseConfig";
import { uriToBlob } from "../../common/utils";

import { Ionicons } from "@expo/vector-icons";
import Toast from "../../components/Toast";
import {SONGS_DIR} from "../../common/consts"

const storage = getStorage(app);

function Cloud() {
  const [songs, setSongs] = useState({
    loading: true,
    data: [],
  });

  const [progress, setProgress] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({
    visible: false,
    isDeleting: false,
  });
  const [toast, setToast] = useState(false);

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
    setProgress(0.1);

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
          loadData()
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
    setProgress(0.1);
    const downloadURL = await getDownloadURL(ref(storage, file.fullPath));
    // if songs folder exist
    await ensureDirExists(SONGS_DIR);
    // if not create a folder
    const downloadResumable = FileSystem.createDownloadResumable(
      downloadURL,
      `${FileSystem.documentDirectory}/${SONGS_DIR}/${file.fileName}`,
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

  async function deleteFile(file) {
    // Create a reference to the file to delete
    const desertRef = ref(storage, file.fullPath);

    // Delete the file
    deleteObject(desertRef)
      .then(() => {
        loadData();
        setDeleteDialog({ visible: false, isDeleting: false });
        // File deleted successfully
      })
      .catch((error) => {
        setToast("Error deleting file");
        setDeleteDialog({ visible: false, isDeleting: false });

        // Uh-oh, an error occurred!
      });
  }

  const renderItem = ({ item }) => (
    <ListItem onPress={() => console.log(item)}>
      <ListItem.Content>
        <ListItem.Title>{item.fileName}</ListItem.Title>
      </ListItem.Content>
      <View style={styles.buttonsContainer}>
        <Button
          disabled={!!progress}
          onPress={() => downloadFile(item)}
          type="solid"
          buttonStyle={styles.iconButtons}
        >
          <Ionicons name="cloud-download" size={18} color="#fff" />
        </Button>
        <Button
          color={"error"}
          disabled={!!progress}
          onPress={() => {
            setDeleteDialog({
              visible: item,
              isDeleting: false,
            });
          }}
          type="solid"
          buttonStyle={styles.iconButtons}
        >
          <Ionicons name="trash" size={18} color="#fff" />
        </Button>
      </View>
    </ListItem>
  );

  return (
    <View style={styles.container}>
      <Text>Manage Cloud Data</Text>
      <Toast
        visible={toast}
        duration={1000}
        text={toast}
        isClosable={true}
        onClose={() => setToast(false)}
      />
      {songs?.loading ? (
        <View style={styles.fullView}>
          <ActivityIndicator color="#2089dc" />
        </View>
      ) : songs?.data?.length > 0 ? (
        <FlatList
          keyExtractor={(item, index) => index.toString()}
          data={songs?.data}
          renderItem={renderItem}
        />
      ) : (
        <View style={styles.fullView}>
          <Text>No songs found</Text>
        </View>
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
      <Dialog
        isVisible={!!deleteDialog.visible}
        onBackdropPress={() => {
          if (deleteDialog.isDeleting) return;
          setDeleteDialog({ visible: false, isDeleting: false });
        }}
      >
        <Dialog.Title title="Delete Song" />
        <Text>Are you sure you want to delete a song from the cloud?</Text>

        <Dialog.Actions>
          <Dialog.Button
            title="CONFIRM"
            onPress={() => {
              deleteFile(deleteDialog.visible);
            }}
          />
          <Dialog.Button
            disabled={deleteDialog.isDeleting}
            title="CANCEL"
            onPress={() =>
              setDeleteDialog({ visible: false, isDeleting: false })
            }
          />
        </Dialog.Actions>
      </Dialog>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "space-between",
  },
  fullView: {
    display: "flex",
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  progress: {
    marginBottom: 6,
  },
  iconButtons: {
    height: 36,
    width: 36,
    borderRadius: 40,
    padding: 0,
  },
  buttonsContainer: {
    display: "flex",
    flexDirection: "row",
    gap: 4,
  },
});

export default Cloud;
