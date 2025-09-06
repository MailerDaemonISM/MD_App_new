import React, { useState } from "react";
import { TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";

export default function NotificationButton() {
  const [enabled, setEnabled] = useState(false);

  return (
    <TouchableOpacity 
  onPress={() => setEnabled(!enabled)} 
  style={{ padding: 2, marginLeft: 12 }}
>
  <Icon
    name={enabled ? "bell" : "bell-o"} // solid vs outlined
    size={28}
    color={enabled ? "gray" : "#333"}
  />
</TouchableOpacity>

  );
}
