import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
  headerRightIcons: {
    flexDirection: "row",
  },
  iconButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  searchBox: {
    backgroundColor: "#F0F0F0",
    padding: 10,
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 10,
  },
  cardContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginTop: 7,
  },
  cardTextContainer: {
    flex: 3,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 4,
  },
  cardCategory: {
    fontSize: 10,
    fontStyle: "italic",
    color: "#666",
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 14,
    color: "#444",
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  cardLabel: {
    fontSize: 12,
    color: "#888",
  },
  cardTime: {
    fontSize: 12,
    color: "#888",
  },
  sideBarContainer: {
    width: 50,
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingFooter: {
    paddingVertical: 20,
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  modalCategory: {
    fontSize: 12,
    color: "#666",
    marginBottom: 12,
  },
  modalBody: {
    fontSize: 14,
    color: "#444",
    marginBottom: 12,
  },
  modalHashtags: {
    paddingTop: 12,
    fontSize: 14,
    color: "#333",
    marginBottom: 12,
  },
  modalTime: {
    fontSize: 12,
    color: "#888",
    marginBottom: 16,
  },
  searchContainer: {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "#f5f5f5",
  borderRadius: 8,
  marginHorizontal: 16,
  marginBottom: 10,
  paddingHorizontal: 10,
},
searchBox: {
  flex: 1,
  height: 40,
  fontSize: 16,
  color: "#333",
},
clearButton: {
  paddingLeft: 6,
}
});

export default styles;
