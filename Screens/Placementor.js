import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, StyleSheet } from 'react-native';
import PlacementCard from './PlacementCard';
import { fetchPlacementData } from '../sanity';
import Filter from './filter'; 

const PlacementList = () => {
  const [placements, setPlacements] = useState([]); // Ensure it's initialized as an empty array
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState('year');

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
    <View style={{ flex: 1 }}>
      {/* Use Filter component */}
      <Filter selectedOption={selectedOption} setSelectedOption={setSelectedOption} />

      {/* Placement List */}
      <FlatList
        data={placements}
        keyExtractor={(item, index) => item._id || index.toString()} // Fallback to index if _id is missing
        renderItem={({ item }) => (
          <PlacementCard
            image={{ uri: item.imageUrl || 'https://via.placeholder.com/150' }}
            title={item.name}
            companyName={item.company_name}
            role={item.role}
            year={item.year}
            students={item.students || []}
            facebookLink="https://www.facebook.com/share/15bXw7KR7z/"
          />
        )}
        style={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    flex: 1,
  },
});

export default PlacementList;
