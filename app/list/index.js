import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import * as FileSystem from "expo-file-system";
import { SONGS_DIR } from "../../common/consts";

export default function List() {
  useEffect(() => {
    readFiles();
  }, []);

  const [songs, setSongs] = useState({
    data: [],
    loading: true,
  });

  async function readFiles() {
    setSongs((state) => ({
      ...state,
      loading: true,
    }));
    const files = await FileSystem.readDirectoryAsync(
      `${FileSystem.documentDirectory}/${SONGS_DIR}`
    );
    console.log("files", files);
  }

  return (
    <View>
      <Text>List of songs</Text>
    </View>
  );
}
