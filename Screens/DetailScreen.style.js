import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
    color: "#000000",
  },
  noDataContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noDataText: {
    fontSize: 18,
    color: "gray",
    marginTop: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    color: "#222",
    marginBottom: 10,
  },
  detail: {
    fontSize: 18,
    color: "#555",
    marginVertical: 5,
  },
  card: {
    marginVertical: 10,
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 12,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  sectionHeading: {
    fontSize: 22,
    fontWeight: "bold",
    color: "rgba(238, 109, 152, 1)",
    marginVertical: 15,
    borderBottomWidth: 2,
    borderBottomColor: "rgba(238, 109, 152, 1)",
  },
  accordionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    padding: 10,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
  },
  accordionText: {
    fontSize: 14,
    color: "#333",
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontStyle: "italic",
  },
  companyLogo: {
    width: 120,
    height: 120,
    resizeMode: "contain",
    alignSelf: "center",
    marginBottom: -9,
  },
});

