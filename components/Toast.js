import React, { useEffect, useRef } from "react";
import { View, StyleSheet } from "react-native";
import { Text, Button } from "@rneui/themed";

import { Ionicons } from "@expo/vector-icons";

export default function Toast({
  text,
  visible,
  onClose,
  isClosable,
  duration,
}) {
  const timeoutId = useRef(null);
  useEffect(() => {
    if (duration && visible && !timeoutId.current) {
      timeoutId.current = setTimeout(() => {
        onClose();
      }, duration);
    }
    if (!visible) {
      clearTimeout(timeoutId.current);
    }
    return () => {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
    };
  }, [visible, duration]);

  return (
    <View style={{ ...styles.container, display: visible ? "flex" : "none" }}>
      <Text style={styles.text}>{text}</Text>
      {isClosable && (
        <Button
          onPress={onClose}
          buttonStyle={{
            backgroundColor: "grey",
            width: 32,
            height: 32,
            borderRadius: 32,
            padding: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Ionicons
            name="close"
            size={16}
            style={{ display: "flex", marginLeft: -2 }}
            color="#fff"
          />
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "orange",
    padding: 10,
    borderRadius: 4,
    marginBottom: 8,
  },
  text: {
    paddingTop: 6,
  },
});
