import React, { useEffect, useState } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, FlatList, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Ensure Icon is imported
import { fetchPlacementData } from '../sanity'; // Assuming you have this function

const PlacementList = () => {
  const [placements, setPlacements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getData = async () => {
      try {
        const data = await fetchPlacementData();
        setPlacements(data);
      } catch (error) {
        console.error('Error fetching placement data:', error);
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }
 
  
 
  return (
    <>
    <FlatList
      data={placements}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Image
            source={{ uri: item.imageUrl }} // Assuming you have a companyLogo field
            style={styles.companyLogo}
          />
          <Text style={styles.title}>{item.name}</Text>
          <Text>On Campus</Text>
          <Text style={styles.company}>Company: {item.company_name}</Text>
          <Text>Role: {item.role}</Text>
          <Text>Eligible Branch: {item.eligible_branch}</Text>
          <View style={styles.rightMark} />
        </View>
      )}
      style={styles.list}
    />
    </>
  );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    header: {
      color:'black',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: 'black',
    },
    optionsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingVertical: 16,
    },
    optionButton: {
      backgroundColor: '#98DDFF',
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 8,
    },
    optionText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 14,
    },
    list: {
      backgroundColor: '#f0f0f0', // Background color for the list
    },
    card: {
      backgroundColor: '#fff',
      padding: 16,
      margin: 16,
      borderRadius: 8,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#333',
    },
    rightMark: {
      position: 'absolute',
      right: 0,
      top: 0,
      bottom: 0,
      width: 20, 
      backgroundColor: '#98DDFF', 
      borderTopRightRadius: 8,
      borderBottomRightRadius: 8, 
    },
    company: {
      color: '#777',
    },
    companyLogo: {
      width: 80, // Adjusted width
      height: 80, // Adjusted height
      resizeMode: 'contain', // Ensures the logo is fully visible
      marginBottom: 10,
    },
  });

export default PlacementList;