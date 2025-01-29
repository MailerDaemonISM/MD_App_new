import React, { useEffect, useState, useMemo } from 'react';
import { View, FlatList, Text, StyleSheet } from 'react-native';
import PlacementCard from './PlacementCard';
import { fetchPlacementData } from '../sanity';
import Filter from './filter';

const PlacementList = () => {
  const [placements, setPlacements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState('Year');
  const [selectedValue, setSelectedValue] = useState(null);

  useEffect(() => {
    const getData = async () => {
      try {
        const data = await fetchPlacementData();
        if (Array.isArray(data)) {
          setPlacements(data);
        } else {
          setPlacements([]);
        }
      } catch (error) {
        console.error('Error fetching placement data:', error);
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, []);

  // Filter and Sort Data
  const filteredData = useMemo(() => {
    let data = placements;

    if (selectedValue) {
      data = data.filter((item) =>
        selectedOption === 'Year'
          ? item.year === selectedValue
          : item.eligible_branch.includes(selectedValue)
      );
    }

    // Sort Alphabetically by Company Name
    return data.sort((a, b) => a.company_name.localeCompare(b.company_name));
  }, [placements, selectedOption, selectedValue]);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Filter Section */}
      <Filter
        selectedOption={selectedOption}
        setSelectedOption={setSelectedOption}
        setSelectedValue={setSelectedValue}
      />

      {/* Placement List */}
      <FlatList
        data={filteredData}
        keyExtractor={(item, index) => item._id || index.toString()}
        renderItem={({ item }) => (
          <PlacementCard
            image={{ uri: item.imageUrl || 'https://via.placeholder.com/150' }}
            title={item.name}
            companyName={item.company_name}
            role={item.role}
            year={item.year}
            students={item.students || []}
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
